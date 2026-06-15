require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

const systemInstruction = `คุณคือผู้ช่วย AI ชื่อ AnyMeal สำหรับเลือกร้านอาหารในกลุ่มแชท 
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
    "สวัสดีครับ! ยินดีต้อนรับสู่ AnyMeal AI 🤖 \nเพื่อให้ผมหาร้านได้แม่นยำที่สุด ขอทราบหน่อยครับว่ามื้อนี้เป็น **มื้อไหน (เช้า/เที่ยง/เย็น/ดึก)** ครับ?",
    "รับทราบครับ! แล้วมื้อนี้อยากทานอาหาร **หมวดหมู่ไหน** เป็นพิเศษไหมครับ? (เช่น อาหารไทย, ญี่ปุ่น, ชาบู, หรือตามสั่ง)",
    "น่าอร่อยจัง! แล้วมี **งบประมาณ** ประมาณเท่าไหร่ครับ? (เช่น ต่ำกว่า 100, 100-200, หรือเกิน 200)",
    "โอเคครับ เพื่อความสบายใจ อยากได้ร้านที่ **มีแอร์ (Air-Conditioned)** ไหมครับ?",
    "ใกล้ความจริงแล้วครับ! คุณอยากได้ร้านที่มี **รีวิวขั้นต่ำกี่ดาว** ครับ? (เช่น 3 ดาว, 4 ดาวขึ้นไป)",
    "ได้ข้อมูลครบถ้วนแล้วครับ! สุดท้ายนี้ คุณอยากให้ผม **สุ่มมาให้ 1 ร้านเลย** หรืออยากให้ผม **ส่งเป็น List รายชื่อร้าน** ให้ทุกคนช่วยกันสุ่มครับ?"
];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', async (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId; // Track room for disconnect
        console.log(`User ${socket.id} joined room ${roomId}`);
        
        if (!rooms[roomId]) {
            rooms[roomId] = {
                lastActive: Date.now(),
                participants: 1,
                state: 0,
                messages: [],
                chat: null,
                votes: {},
                restaurantList: null
            };
            
            if (genAI) {
                try {
                    const model = genAI.getGenerativeModel({ 
                        model: "gemini-flash-latest", 
                        systemInstruction
                    });
                    rooms[roomId].chat = model.startChat();
                    const result = await rooms[roomId].chat.sendMessage("สวัสดีครับ มีใครอยู่ไหม ขอให้เริ่มแนะนำตัวและถามคำถามแรกได้เลย พร้อมแนบ [SUGGESTIONS] มาด้วย");
                    let text = result.response.text();
                    let suggestedPrompts = null;
                    if (text.includes('[SUGGESTIONS]')) {
                        const parts = text.split('[SUGGESTIONS]');
                        text = parts[0].trim();
                        suggestedPrompts = parts[1].split('\n')[0].split(',').map(s => s.trim()).filter(s => s);
                    }
                    const welcomeMsg = { sender: 'AI', text: text, isSystem: true, suggestedPrompts };
                    rooms[roomId].messages.push(welcomeMsg);
                    io.to(roomId).emit('chat-message', welcomeMsg);
                } catch (e) {
                    console.error("Gemini Error:", e);
                    const errorMsg = { sender: 'System', text: '⚠️ [ระบบ] โควต้า AI ของคุณเต็มแล้ว! ระบบจะสลับเข้าสู่โหมดจำลองเพื่อให้คุณทดสอบฟีเจอร์โหวตได้ครับ พิมพ์อะไรก็ได้เพื่อดูรายชื่อร้านจำลอง', isSystem: true };
                    rooms[roomId].messages.push(errorMsg);
                    io.to(roomId).emit('chat-message', errorMsg);
                    room.isMockMode = true;
                }
            } else {
                // Mock AI initiates the conversation
                setTimeout(() => {
                    const welcomeMsg = { sender: 'AI', text: aiQuestions[0], isSystem: true };
                    rooms[roomId].messages.push(welcomeMsg);
                    io.to(roomId).emit('chat-message', welcomeMsg);
                }, 500);
            }
        } else {
            rooms[roomId].participants++;
            // Send chat history to the newly joined user
            socket.emit('chat-history', rooms[roomId].messages);
        }
    });

    socket.on('send-message', async ({ roomId, sender, text }) => {
        if (!rooms[roomId]) return;
        if (sender === 'System') return; // Ignore system messages to avoid loops
        
        rooms[roomId].lastActive = Date.now();
        
        // Broadcast user message
        const userMsg = { sender, text };
        rooms[roomId].messages.push(userMsg);
        io.to(roomId).emit('chat-message', userMsg);
        
        const room = rooms[roomId];
        
        if (room.chat) {
            // Real Gemini Logic
            try {
                const result = await room.chat.sendMessage(`[${sender}]: ${text}`);
                const responseText = result.response.text();
                
                let aiResponse = responseText;
                let command = null;
                let suggestedPrompts = null;
                
                if (aiResponse.includes('[SUGGESTIONS]')) {
                    const parts = aiResponse.split('[SUGGESTIONS]');
                    aiResponse = parts[0].trim();
                    const suggestionsStr = parts[1].split('\n')[0]; // get the first line after tag
                    suggestedPrompts = suggestionsStr.split(',').map(s => s.trim()).filter(s => s);
                    // clean up the rest of the text in case AI added more text after suggestions
                    const remainingText = parts[1].substring(suggestionsStr.length).trim();
                    if (remainingText && !remainingText.includes('[FINAL_LIST]')) {
                        aiResponse += "\n" + remainingText;
                    } else if (remainingText.includes('[FINAL_LIST]')) {
                        aiResponse += "\n" + remainingText; // pass it to the next parser
                    }
                }
                
                if (aiResponse.includes('[FINAL_LIST]')) {
                    const parts = responseText.split('[FINAL_LIST]');
                    aiResponse = parts[0].trim();
                    try {
                        const jsonStr = parts[1].replace(/```json/g, '').replace(/```/g, '').trim();
                        const listData = JSON.parse(jsonStr);
                        room.restaurantList = listData;
                        room.votes = {};
                        room.userVotes = {};
                        listData.forEach(r => room.votes[r.id] = 0);
                        command = { type: 'RESULT_LIST', data: listData };
                        setTimeout(() => {
                            io.to(roomId).emit('update-votes', {
                                votes: room.votes,
                                totalParticipants: room.participants,
                                totalVoted: 0
                            });
                        }, 500);
                    } catch(e) {
                        console.error('Failed to parse JSON from AI', e);
                        aiResponse += "\n(Error parsing AI list)";
                    }
                }
                
                const aiMsg = { sender: 'AI', text: aiResponse, isSystem: true, command, suggestedPrompts };
                room.messages.push(aiMsg);
                io.to(roomId).emit('chat-message', aiMsg);
            } catch (e) {
                console.error("Gemini Chat Error:", e);
                const mockList = [
                    { "id": 1, "name": "ร้านจำลอง A", "food_category": "ตามสั่ง", "price_range": "50" },
                    { "id": 2, "name": "ร้านจำลอง B", "food_category": "ชาบู", "price_range": "300" },
                    { "id": 3, "name": "ร้านจำลอง C", "food_category": "คาเฟ่", "price_range": "100" }
                ];
                room.restaurantList = mockList;
                room.votes = {};
                room.userVotes = {};
                mockList.forEach(r => room.votes[r.id] = 0);
                const command = { type: 'RESULT_LIST', data: mockList };
                
                const fallbackMsg = { sender: 'AI', text: "⚠️ เนื่องจากลิมิต AI เต็ม นี่คือรายชื่อร้านแบบจำลองเพื่อให้คุณสามารถทดสอบระบบโหวตและ UI ต่อได้ครับ!", isSystem: true, command };
                room.messages.push(fallbackMsg);
                io.to(roomId).emit('chat-message', fallbackMsg);
                
                setTimeout(() => {
                    io.to(roomId).emit('update-votes', {
                        votes: room.votes,
                        totalParticipants: room.participants,
                        totalVoted: 0
                    });
                }, 500);
            }
        } else {
            // Mock AI Processing
            if (room.state < 5) {
                room.state++;
                setTimeout(() => {
                    const aiMsg = { sender: 'AI', text: aiQuestions[room.state], isSystem: true };
                    room.messages.push(aiMsg);
                    io.to(roomId).emit('chat-message', aiMsg);
                }, 1000);
            } else if (room.state === 5) {
                // Final Decision
                room.state++;
                setTimeout(() => {
                    let aiResponse = "จัดไปครับ! นี่คือรายชื่อร้านอาหารทั้ง 5 ร้านที่ผมคัดมาให้ตามเงื่อนไข (กดปุ่ม Let's Spin เพื่อสุ่มจาก List นี้ได้เลยครับ!)";
                    let command = {
                        type: 'RESULT_LIST',
                        data: [
                            { id: 901, name: "ส้มตำนัว", food_category: "อาหารอีสาน", price_range: "100-200" },
                            { id: 902, name: "เจ๊โอว", food_category: "ข้าวต้ม/ยำ", price_range: "200-500" },
                            { id: 903, name: "Shabu Shi", food_category: "ชาบู", price_range: "over_200" },
                            { id: 904, name: "ตี๋น้อย", food_category: "สุกี้", price_range: "100-200" },
                            { id: 905, name: "ก๋วยเตี๋ยวเรือ ป.ประทีป", food_category: "ก๋วยเตี๋ยว", price_range: "under_100" }
                        ]
                    };
                    const aiMsg = { sender: 'AI', text: aiResponse, isSystem: true, command };
                    room.messages.push(aiMsg);
                    io.to(roomId).emit('chat-message', aiMsg);
                }, 1500);
            }
        }
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
        
        io.to(roomId).emit('update-votes', {
            votes: room.votes,
            totalParticipants: room.participants,
            totalVoted: Object.keys(room.userVotes).length
        });
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
            userVotes: room.userVotes
        };
        
        const isTie = winners.length > 1;
        const msgText = isTie 
            ? `🏆 สรุปผลโหวตแล้วครับ! (เนื่องจากคะแนนเท่ากัน ระบบจึงทำการสุ่มชี้ขาดให้) ผู้ชนะคือร้าน: **${winningRestaurant.name}**`
            : `🏆 สรุปผลโหวตแล้วครับ! ผู้ชนะคือร้าน: **${winningRestaurant.name}**`;
            
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
