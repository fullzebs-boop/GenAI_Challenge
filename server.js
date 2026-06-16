require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read data
const readData = () => {
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Health check for Render Cold Start Warm-Up
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is awake!' });
});

// GET all data
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// GET history by date
app.get('/api/history', (req, res) => {
    const { date } = req.query;
    const data = readData();
    if (date) {
        const filtered = data.history.filter(h => h.date === date);
        res.json(filtered);
    } else {
        res.json(data.history);
    }
});

// POST spin (record history)
app.post('/api/spin', (req, res) => {
    const { username, date, meal_type, mood, energy_level, selected_restaurant_id, selection_method } = req.body;
    const data = readData();
    
    // Remove existing entry for the same user, date, and meal_type to prevent duplicates
    data.history = data.history.filter(h => !(h.username === username && h.date === date && h.meal_type === meal_type));
    
    const newEntry = {
        id: Date.now(),
        username,
        date,
        meal_type,
        mood,
        energy_level,
        selected_restaurant_id,
        selection_method: selection_method || 'manual',
        timestamp: new Date().toISOString()
    };
    data.history.push(newEntry);
    writeData(data);
    res.json({ success: true, entry: newEntry });
});

// POST new restaurant
app.post('/api/restaurants', (req, res) => {
    const { name, price_range, meal_types, food_category } = req.body;
    const data = readData();
    const newId = data.restaurants.length > 0 ? Math.max(...data.restaurants.map(r => r.id)) + 1 : 1;
    const newRestaurant = {
        id: newId,
        name,
        price_range,
        meal_types,
        food_category
    };
    data.restaurants.push(newRestaurant);
    writeData(data);
    res.json({ success: true, restaurant: newRestaurant });
});

// PUT update restaurant
app.put('/api/restaurants/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price_range, meal_types, food_category } = req.body;
    const data = readData();
    const index = data.restaurants.findIndex(r => r.id === id);
    if (index !== -1) {
        data.restaurants[index] = { ...data.restaurants[index], name, price_range, meal_types, food_category };
        writeData(data);
        res.json({ success: true, restaurant: data.restaurants[index] });
    } else {
        res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
});

// DELETE restaurant
app.delete('/api/restaurants/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    data.restaurants = data.restaurants.filter(r => r.id !== id);
    writeData(data);
    res.json({ success: true });
});

// POST simulate mock data
app.post('/api/simulate', (req, res) => {
    const data = readData();
    
    // Create 40 users, 7 days backwards
    const users = Array.from({length: 40}, (_, i) => `User${i+1}`);
    const moods = ['Stressed', 'Drained', 'Relaxed'];
    const energies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    const today = new Date();
    
    // Clear old mock data if exists (for idempotency)
    // Actually we will just clear all history for simplicity, or just append
    // Let's clear and re-simulate
    data.history = [];
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        users.forEach(username => {
            const meal_type = mealTypes[Math.floor(Math.random() * mealTypes.length)];
            const mood = moods[Math.floor(Math.random() * moods.length)];
            const energy_level = energies[Math.floor(Math.random() * energies.length)];
            
            // Correlation logic
            // If งานเดือด, high chance for รสจัด
            let candidateRestaurants = data.restaurants.filter(r => r.meal_types.includes(meal_type));
            if (candidateRestaurants.length === 0) {
                candidateRestaurants = data.restaurants; // fallback
            }
            
            let selectedRestaurant;
            const r = Math.random();
            if (mood === 'Stressed' && r < 0.8) {
                const spicy = candidateRestaurants.filter(rest => rest.food_category === 'รสจัด' || rest.food_category === 'ชาบู');
                if (spicy.length > 0) {
                    selectedRestaurant = spicy[Math.floor(Math.random() * spicy.length)];
                } else {
                    selectedRestaurant = candidateRestaurants[Math.floor(Math.random() * candidateRestaurants.length)];
                }
            } else if (mood === 'Drained' && r < 0.7) {
                 const easy = candidateRestaurants.filter(rest => rest.food_category === 'ก๋วยเตี๋ยว' || rest.food_category === 'ตามสั่ง');
                 if (easy.length > 0) {
                     selectedRestaurant = easy[Math.floor(Math.random() * easy.length)];
                 } else {
                     selectedRestaurant = candidateRestaurants[Math.floor(Math.random() * candidateRestaurants.length)];
                 }
            } else if (mood === 'Relaxed' && r < 0.6) {
                 const shabu = candidateRestaurants.filter(rest => rest.food_category === 'ชาบู' || rest.food_category === 'สุขภาพ');
                 if (shabu.length > 0) {
                     selectedRestaurant = shabu[Math.floor(Math.random() * shabu.length)];
                 } else {
                     selectedRestaurant = candidateRestaurants[Math.floor(Math.random() * candidateRestaurants.length)];
                 }
            } else {
                selectedRestaurant = candidateRestaurants[Math.floor(Math.random() * candidateRestaurants.length)];
            }
            
            const smRand = Math.random();
            const selMethod = smRand < 0.2 ? 'quiz' : (smRand < 0.8 ? 'spin' : 'manual');
            
            data.history.push({
                id: Math.floor(Math.random() * 1000000000),
                username,
                date: dateStr,
                meal_type,
                mood,
                energy_level,
                selected_restaurant_id: selectedRestaurant.id,
                selection_method: selMethod,
                timestamp: new Date(d.getTime() + Math.random() * 86400000).toISOString()
            });
        });
    }
    
    data.simulation_config.is_simulated_data_present = true;
    writeData(data);
    res.json({ success: true, message: "Simulated data generated for 40 users over 7 days." });
});

// POST clear data
app.post('/api/clear', (req, res) => {
    const data = readData();
    data.history = [];
    data.simulation_config.is_simulated_data_present = false;
    writeData(data);
    res.json({ success: true });
});

// ==========================================
// Multiplayer Rooms & Mock AI Logic
// ==========================================
const rooms = {};

// Clean up rooms older than 1 hour
setInterval(() => {
    const now = Date.now();
    for (const roomId in rooms) {
        if (now - rooms[roomId].lastActive > 3600000) { // 1 hour
            console.log(`[Auto-Clean] Deleting room: ${roomId}`);
            delete rooms[roomId];
        }
    }
}, 60000); // Check every minute

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const systemInstruction = `คุณคือผู้ช่วย AI ชื่อ Meal Roulette สำหรับเลือกร้านอาหารในกลุ่มแชท 
หน้าทีของคุณคือชวนผู้ใช้คุยอย่างเป็นธรรมชาติและเป็นกันเองเพื่อหาข้อมูล 6 อย่าง:
1. โลเคชั่น/พิกัด (เช่น สยาม, รังสิต, ใกล้ออฟฟิศ) **สำคัญมาก เพราะเล่นหลายคนต้องมีจุดนัดพบ**
2. มื้อไหน (เช้า/เที่ยง/เย็น) 
3. หมวดหมู่อาหาร 
4. งบประมาณ 
5. แอร์ 
6. รีวิว
ถ้ารู้สึกว่าผู้ใช้ไม่อยากตอบบางข้อให้ข้ามไปได้ ถ้าพิมพ์ยาวๆให้จับใจความเอา

**ข้อบังคับสำคัญ:** ทุกครั้งที่คุณถามคำถามเพื่อขอข้อมูล ให้คุณต่อท้ายข้อความด้วยคำว่า [SUGGESTIONS] ตามด้วยตัวเลือกสั้นๆ 3-4 ข้อที่คั่นด้วยลูกน้ำ (,) เสมอ เพื่อให้ระบบนำไปทำเป็นปุ่มกด
ตัวอย่างเช่น: [SUGGESTIONS] สยาม, ลาดพร้าว, รังสิต, แถวออฟฟิศ

**ป้องกันการคุยนอกเรื่อง (Guardrail):** 
ถ้าผู้ใช้ชวนคุยเรื่องอื่นที่ "ไม่เกี่ยวกับ" การหาร้านอาหาร เมนูอาหาร หรือการนัดหมายกินข้าว ให้คุณปฏิเสธอย่างสุภาพตลกๆ ว่าคุณเป็นแค่ AI ผู้เชี่ยวชาญด้านของกินเท่านั้น และดึงผู้ใช้กลับมาที่เรื่องกินทันที ห้ามให้คำปรึกษาเรื่องอื่นเด็ดขาด!

เมื่อคุณคิดว่าได้ข้อมูลเพียงพอแล้ว หรือผู้ใช้ต้องการจบ/สุ่ม ให้คุณหาร้านอาหารจริงๆ 5 ร้านที่ตรงเงื่อนไข 
แล้วตอบกลับอย่างร่าเริง แต่ในบรรทัดสุดท้ายให้ขึ้นบรรทัดใหม่พิมพ์คำว่า [FINAL_LIST] ตามด้วย JSON Array ของร้านอาหาร 5 ร้านเป๊ะๆ 
ห้ามมีคำอื่นต่อท้าย JSON ตัวอย่างรูปแบบ JSON:
[
  { "id": 1, "name": "ชื่อร้าน", "food_category": "หมวดหมู่", "price_range": "ราคา" }
]`;

const aiQuestions = [
    "สวัสดีครับ! ยินดีต้อนรับสู่ Meal Roulette 🤖 \nเพื่อให้ผมหาร้านได้แม่นยำที่สุด ขอทราบหน่อยครับว่ามื้อนี้เป็น **มื้อไหน (เช้า/เที่ยง/เย็น/ดึก)** ครับ?",
    "รับทราบครับ! แล้วมื้อนี้อยากทานอาหาร **หมวดหมู่ไหน** เป็นพิเศษไหมครับ? (เช่น อาหารไทย, ญี่ปุ่น, ชาบู, หรือตามสั่ง)",
    "น่าอร่อยจัง! แล้วมี **งบประมาณ** ประมาณเท่าไหร่ครับ? (เช่น ต่ำกว่า 100, 100-200, หรือเกิน 200)",
    "โอเคครับ เพื่อความสบายใจ อยากได้ร้านที่ **มีแอร์ (Air-Conditioned)** ไหมครับ?",
    "ใกล้ความจริงแล้วครับ! คุณอยากได้ร้านที่มี **รีวิวขั้นต่ำกี่ดาว** ครับ? (เช่น 3 ดาว, 4 ดาวขึ้นไป)",
    "ได้ข้อมูลครบถ้วนแล้วครับ! สุดท้ายนี้ คุณอยากให้ผม **สุ่มมาให้ 1 ร้านเลย** หรืออยากให้ผม **ส่งเป็น List รายชื่อร้าน** ให้ทุกคนช่วยกันสุ่มครับ?"
];

// Robust JSON List Extractor
function extractFinalList(text) {
    let jsonStr = null;
    let remainingText = text;
    const match = text.match(/\[\s*\{.*"id"\s*:.*\}\s*\]/s);
    
    if (text.includes('[FINAL_LIST]')) {
        const parts = text.split('[FINAL_LIST]');
        remainingText = parts[0].trim();
        jsonStr = parts[1];
    } else if (match) {
        jsonStr = match[0];
        remainingText = text.replace(jsonStr, '').trim();
    }
    
    if (jsonStr) {
        try {
            const parsed = JSON.parse(jsonStr.replace(/```json/g, '').replace(/```/g, '').trim());
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                return { list: parsed, text: remainingText };
            }
        } catch (e) { console.error("JSON parse error:", e); }
    }
    return null;
}

// Initialize Groq
const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', async (data) => {
        let roomId, username, aiProvider, aiPassword;
        if (typeof data === 'string') { roomId = data; aiProvider = 'local'; }
        else { roomId = data.roomId; username = data.username; aiProvider = data.aiProvider || 'local'; aiPassword = data.aiPassword; }
        
        socket.join(roomId);
        socket.roomId = roomId;
        
        if (!rooms[roomId]) {
            rooms[roomId] = {
                lastActive: Date.now(),
                participants: 1,
                messages: [],
                votes: {},
                userVotes: {},
                userNames: {},
                restaurantList: null,
                aiProvider: aiProvider,
                geminiChat: null,
                geminiChat: null,
                groqMessages: [],
                slotState: { location: null, meal: null, category: null, budget: null, aircon: null, rating: null },
                offTopicCount: 0,
                guardrailLevel: 0,
                pendingSlot: 'location'
            };
            
            const welcomeMsg = { 
                sender: 'AI', 
                text: `สวัสดีครับ! ยินดีต้อนรับสู่ห้อง ${roomId} 🤖 ผมคือผู้ช่วยเลือกร้านอาหาร\nเพื่อความแม่นยำ ผมขอทราบ **"พิกัด" (Location)** และ **"แนวอาหาร" (Category)** ที่อยากทานก่อนนะครับ!`, 
                isSystem: true, 
                suggestedPrompts: ["สยาม", "ลาดพร้าว", "อยากกินชาบู", "อาหารญี่ปุ่น", "สุ่มเลย!"] 
            };
            
            rooms[roomId].messages.push(welcomeMsg);
            setTimeout(() => io.to(roomId).emit('chat-message', welcomeMsg), 500);
            
        } else {
            rooms[roomId].participants++;
            
            // Ensure slotState exists for old rooms
            if (!rooms[roomId].slotState) {
                rooms[roomId].slotState = { location: null, meal: null, category: null, budget: null, aircon: null, rating: null };
            }
            if (typeof rooms[roomId].offTopicCount === 'undefined') rooms[roomId].offTopicCount = 0;
            if (typeof rooms[roomId].guardrailLevel === 'undefined') rooms[roomId].guardrailLevel = 0;
            socket.emit('chat-history', rooms[roomId].messages);
        }
    });

    socket.on('update-slots', ({ roomId, slots }) => {
        if (!rooms[roomId]) return;
        // Merge the slots
        rooms[roomId].slotState = { ...rooms[roomId].slotState, ...slots };
    });

    socket.on('send-message', async (data) => {
        const { roomId, sender, text, aiProvider, aiPassword } = data;
        if (!rooms[roomId] || sender === 'System') return;
        
        const room = rooms[roomId];
        room.lastActive = Date.now();
        
        // Broadcast user message
        const userMsg = { sender, text };
        room.messages.push(userMsg);
        io.to(roomId).emit('chat-message', userMsg);
        
        // No AI intervention unless requested via invoke-ai
    });

    socket.on('invoke-ai', async ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;
        
        // Context Gathering: Last 10 messages from users only (to save tokens and prevent AI confusion)
        const userMessages = room.messages.filter(m => m.sender !== 'AI' && m.sender !== 'System');
        const recentMessages = userMessages.slice(-10).map(m => `[${m.sender}]: ${m.text}`).join('\n');
        
        // Import aiService dynamically if not at top level
        const { generateReActResponse, executeRAGSearch } = require('./services/aiService');
        
        const progressCallback = (msg) => {
            io.to(roomId).emit('ai-progress', { status: msg });
        };
        
        const result = await generateReActResponse(recentMessages, progressCallback);
        
        if (result.status === 'missing_info') {
            // Tell frontend to show Suggestion Chips
            io.to(roomId).emit('ask-missing-info', { missing_fields: result.missing_fields });
            // Send bot's question text
            const aiMsg = { sender: 'AI', text: result.message, isSystem: true };
            room.messages.push(aiMsg);
            io.to(roomId).emit('chat-message', aiMsg);
        } else if (result.status === 'confirm_search') {
            // Tell frontend to show Confirmation Modal with Dimensions
            io.to(roomId).emit('ask-confirm-search', { dimensions: result.dimensions });
            // Send bot's summary question
            const aiMsg = { sender: 'AI', text: 'สรุปข้อมูลตามนี้นะครับ ตรวจสอบแล้วเลือกวิธีค้นหาได้เลย!', isSystem: true };
            room.messages.push(aiMsg);
            io.to(roomId).emit('chat-message', aiMsg);
        } else {
            // Success, send final message
            const aiMsg = { sender: 'AI', text: result.message, isSystem: true };
            room.messages.push(aiMsg);
            io.to(roomId).emit('chat-message', aiMsg);
        }
    });

    socket.on('execute-search', async ({ roomId, dimensions, aiProvider, aiPassword }) => {
        const room = rooms[roomId];
        if (!room) return;
        
        io.to(roomId).emit('ai-thinking', true);
        
        const progressCallback = (msg) => {
            io.to(roomId).emit('ai-progress', { status: msg });
        };
        
        const { executeRAGSearch } = require('./services/aiService');
        const result = await executeRAGSearch(dimensions, aiProvider, aiPassword, progressCallback);
        
        io.to(roomId).emit('ai-thinking', false);
        
        if (result.status === 'result_list') {
            room.restaurantList = result.data;
            room.votes = {};
            room.userVotes = {};
            room.userNames = {};
            room.restaurantList.forEach(r => room.votes[r.id] = 0);

            let namesList = room.restaurantList.map((r, i) => `${i + 1}. ${r.name}`).join('\n');
            let chatText = `${result.message}\n\n${namesList}`;

            const aiMsg = { sender: 'AI', text: chatText, isSystem: true, command: { type: 'RESULT_LIST', data: room.restaurantList } };
            room.messages.push(aiMsg);
            io.to(roomId).emit('chat-message', aiMsg);
        } else {
        }
    });

    socket.on('manual-restaurants', ({ roomId, restaurants }) => {
        const room = rooms[roomId];
        if (!room) return;
        
        room.restaurantList = restaurants;
        room.votes = {};
        room.userVotes = {};
        room.userNames = {};
        room.restaurantList.forEach(r => room.votes[r.id] = 0);

        const aiMsg = { sender: 'System', text: 'โหมดป้อนร้านเองเริ่มแล้ว! พร้อมโหวตหรือหมุนวงล้อแล้วครับ 🎲', isSystem: true, command: { type: 'RESULT_LIST', data: room.restaurantList } };
        room.messages.push(aiMsg);
        io.to(roomId).emit('chat-message', aiMsg);
    });

    socket.on('vote', ({ roomId, restaurantId, username }) => {
        const room = rooms[roomId];
        if (!room || !room.votes) return;
        
        if (!room.userVotes) room.userVotes = {};
        if (!room.userNames) room.userNames = {};
        
        // Record vote for this user (socket.id)
        room.userVotes[socket.id] = restaurantId;
        room.userNames[socket.id] = username || 'Guest';
        
        // Recalculate totals
        room.votes = {};
        room.restaurantList.forEach(r => room.votes[r.id] = 0);
        for (const uid in room.userVotes) {
            const rid = room.userVotes[uid];
            if (room.votes[rid] !== undefined) {
                room.votes[rid]++;
            }
        }
        
        const actualParticipants = io.sockets.adapter.rooms.get(roomId)?.size || 1;
        io.to(roomId).emit('update-votes', {
            votes: room.votes,
            totalParticipants: actualParticipants,
            totalVoted: Object.keys(room.userVotes).length
        });
    });

    socket.on('generate-batch-result', async ({ roomId, aiProvider, aiPassword }) => {
        const room = rooms[roomId];
        if (!room) return;
        
        const slots = room.slotState;
        let aiResponse = "";
        let listData = [];
        
        const prompt = `กรุณาแนะนำร้านอาหาร 5 ร้าน โดยมีเงื่อนไขดังนี้:
- พิกัด: ${slots.location || 'ไม่ระบุ'}
- แนวอาหาร: ${slots.category || 'ไม่ระบุ'}
- มื้ออาหาร: ${slots.meal || 'ไม่ระบุ'}
- งบประมาณ: ${slots.budget || 'ไม่ระบุ'}
- แอร์: ${slots.aircon || 'ไม่ระบุ'}

**สำคัญมาก:** คำนึงถึงเวลาเปิด-ปิดของร้านให้เหมาะสมกับ "มื้ออาหาร" ที่ระบุ (เช่น มื้อดึกต้องเป็นร้านที่เปิดดึก/บาร์ มื้อเช้าต้องเป็นร้านที่เปิดเช้า)
**กฎเหล็ก (CRITICAL):** 
1. ห้ามแต่งชื่อร้านอาหารขึ้นมาเองเด็ดขาด (No Hallucination)
2. ร้านที่แนะนำต้องมีอยู่จริงและค้นหาเจอใน Google Maps
3. หากพิกัดที่ระบุไม่มีร้านที่ตรงเงื่อนไข 100% ให้แนะนำ "ร้านแฟรนไชส์ชื่อดัง" ที่มีสาขาทั่วไป (เช่น MK, Bar B Q Plaza, KFC, สตาร์บัคส์) แทนการแต่งชื่อร้านปลอม

ตอบกลับมาเป็น JSON Array เท่านั้น ห้ามมีข้อความอื่นปน
ตัวอย่าง JSON:
[
  { "id": 1, "name": "ชื่อร้าน", "food_category": "หมวดหมู่", "price_range": "ราคา" }
]`;

        try {
            if (aiProvider === 'local') {
                const db = readData().restaurants;
                // Simple filter based on category and random slice
                let filtered = db.filter(r => !slots.category || r.food_category.includes(slots.category));
                if (filtered.length === 0) filtered = db;
                listData = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
            } else if (aiProvider === 'groq') {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a Thai restaurant recommender. Return ONLY valid JSON array." },
                        { role: "user", content: prompt }
                    ],
                    model: "llama-3.3-70b-versatile",
                });
                aiResponse = completion.choices[0].message.content;
                const extracted = extractFinalList(aiResponse);
                if (extracted && extracted.list) listData = extracted.list;
            } else if (aiProvider === 'gemini') {
                if (aiPassword !== process.env.GEMINI_UNLOCK_PASSWORD) {
                    throw new Error("Invalid Gemini Password");
                }
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-flash-latest"
                });
                const geminiPrompt = prompt + "\n\nคำสั่งพิเศษสำหรับ Gemini: ให้คุณใช้ Google Search ค้นหาร้านอาหารที่มีอยู่จริง เปิดให้บริการอยู่จริงๆ ตามพิกัดที่ระบุ และนำชื่อร้านที่ได้จากการค้นหาจริงๆ มาตอบเท่านั้น ห้ามเดาสุ่มเด็ดขาด!";
                const result = await model.generateContent(geminiPrompt);
                aiResponse = result.response.text();
                const extracted = extractFinalList(aiResponse);
                if (extracted && extracted.list) listData = extracted.list;
            }
        } catch (e) {
            console.error("Batch Gen Error:", e);
            io.to(roomId).emit('chat-message', { sender: 'AI', text: `⚠️ เกิดข้อผิดพลาดในการรวบรวมข้อมูล: ${e.message}`, isSystem: true });
            return;
        }

        if (listData.length > 0) {
            room.restaurantList = listData;
            room.votes = {}; room.userVotes = {};
            listData.forEach(r => room.votes[r.id] = 0);
            const command = { type: 'RESULT_LIST', data: listData };
            const aiMsg = { sender: 'AI', text: "🚀 สร้างรายชื่อร้านอาหารเรียบร้อยแล้วครับ! มาเริ่มโหวตกันเลย!", isSystem: true, command };
            room.messages.push(aiMsg);
            io.to(roomId).emit('chat-message', aiMsg);
            
            setTimeout(() => { 
                const actualParticipants = io.sockets.adapter.rooms.get(roomId)?.size || 1;
                io.to(roomId).emit('update-votes', { votes: room.votes, totalParticipants: actualParticipants, totalVoted: 0 }); 
            }, 500);
        } else {
            io.to(roomId).emit('chat-message', { sender: 'AI', text: `⚠️ ไม่สามารถสร้าง JSON จาก AI ได้ครับ โปรดลองใหม่อีกครั้ง`, isSystem: true });
        }
    });

    socket.on('finish-voting', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room || !room.restaurantList) return;
        
        let maxVotes = -1;
        let winners = [];
        for (const [id, count] of Object.entries(room.votes)) {
            if (count > maxVotes) {
                maxVotes = count;
                winners = [id];
            } else if (count === maxVotes) {
                winners.push(id);
            }
        }
        
        const winningId = winners[Math.floor(Math.random() * winners.length)];
        const winningRestaurant = room.restaurantList.find(r => r.id.toString() === winningId.toString());
        
        const command = { 
            type: 'RESULT_RANDOM', 
            data: winningRestaurant,
            allRestaurants: room.restaurantList,
            finalVotes: room.votes,
            userNames: room.userNames,
            userVotes: room.userVotes,
            slots: room.slotState
        };
        
        const isTie = winners.length > 1;
        const btnHtml = `<br><br><button onclick="document.getElementById('room-summary').classList.remove('hidden'); setTimeout(()=>document.getElementById('room-summary').classList.remove('opacity-0'),10);" class="text-sm bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold shadow-sm border border-indigo-100 hover:bg-indigo-50 transition w-full text-center mt-1"><i class="fas fa-chart-pie mr-1"></i> ดูสรุปผลโหวตทั้งหมด</button>`;
        
        const msgText = isTie 
            ? `🏆 สรุปผลโหวตแล้วครับ! (คะแนนเท่ากัน ระบบจึงสุ่มชี้ขาดให้) ผู้ชนะคือร้าน: **${winningRestaurant.name}**${btnHtml}`
            : `🏆 สรุปผลโหวตแล้วครับ! ผู้ชนะคือร้าน: **${winningRestaurant.name}**${btnHtml}`;
            
        const aiMsg = { sender: 'AI', text: msgText, isSystem: true, command };
        room.messages.push(aiMsg);
        io.to(roomId).emit('chat-message', aiMsg);
        
        // Reset list to prevent double clicking
        room.restaurantList = null;
    });

    socket.on('spin-wheel', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room || !room.restaurantList) return;
        
        const winningRestaurant = room.restaurantList[Math.floor(Math.random() * room.restaurantList.length)];
        
        const command = { type: 'RESULT_RANDOM', data: winningRestaurant };
        const aiMsg = { sender: 'AI', text: `🎡 แหกโค้งผลโหวต! วงล้อตัดสินใจเลือกร้าน: **${winningRestaurant.name}**`, isSystem: true, command };
        room.messages.push(aiMsg);
        io.to(roomId).emit('chat-message', aiMsg);
        
        // Reset
        room.restaurantList = null;
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.roomId && rooms[socket.roomId]) {
            rooms[socket.roomId].participants--;
            if (rooms[socket.roomId].participants <= 0) {
                console.log(`[Auto-Clean] Room ${socket.roomId} is empty. Deleting immediately.`);
                delete rooms[socket.roomId];
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
