// services/aiService.js
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { performWebSearchRAG } = require('./searchService');
require('dotenv').config();

const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Execute Web Search and synthesize using selected AI provider.
 */
async function executeRAGSearch(dimensions, aiProvider, aiPassword, progressCallback = () => {}) {
    progressCallback("🛸 บอทกำลังกระโดดท่องอินเทอร์เน็ต ไปส่องรีวิวและข้อมูลสดๆ บนโลกออนไลน์");
    
    const location = dimensions.location || "";
    const category = dimensions.category || "";
    const budget = dimensions.budget ? `ราคา ${dimensions.budget}` : "";
    const vibe = dimensions.vibe ? `บรรยากาศ ${dimensions.vibe}` : "";
    const req = dimensions.specific_req ? `เงื่อนไข: ${dimensions.specific_req}` : "";
    
    // Use AI generated query if available, fallback to manual concat
    const searchQuery = dimensions.optimized_search_query || `รีวิว แนะนำ ร้านอาหาร ${category} ${vibe} ${req} ย่าน ${location} ${budget} pantip wongnai`.trim();
    const rawSearchResults = await performWebSearchRAG(searchQuery);

    progressCallback(`🧠 ข้อมูลมาแล้ว! กำลังคัดกรอง 5 ร้านที่ดีที่สุดด้วย ${aiProvider.toUpperCase()}`);

    const sysPrompt = `คุณคือสุดยอด AI กรรมการตัดสินร้านอาหาร 
หน้าที่ของคุณคืออ่านข้อมูลรีวิวที่ได้จากการค้นหา แล้วประเมินคะแนน "Match Score" (เต็ม 100) ให้กับทุกร้านที่เจอ
เกณฑ์การให้คะแนน:
- หมวดหมู่อาหารตรงกับ "${category}": +50 คะแนน
- พิกัด/ทำเลตรงกับ "${location}": +30 คะแนน
- เงื่อนไขพิเศษ/บรรยากาศ/งบตรงกับ "${budget} ${vibe} ${req}": +20 คะแนน

คำสั่งสำคัญ:
1. ประเมินคะแนนให้ทุกร้านที่เจอในข้อมูล
2. จัดเรียงลำดับร้านจากคะแนนมากไปน้อย (Descending)
3. หากร้านไหนได้คะแนนเรื่องพิกัด/ทำเล = 0 (คืออยู่นอกพื้นที่ที่กำหนดไปไกลมาก) ให้คัดทิ้งทันที ห้ามนำมาใส่เด็ดขาด
4. หากไม่มีร้านไหนเลยที่ผ่านเกณฑ์ (พิกัดผิดทั้งหมด) ให้ตอบกลับเป็น Array ว่างๆ คือ [] เท่านั้น ห้ามมั่วชื่อร้านอื่นมาเด็ดขาด
5. ตัดเอาเฉพาะ 5 ร้านแรกที่คะแนนสูงสุดเท่านั้น (Top 5) ส่วนอันดับที่ 6 เป็นต้นไปให้โยนทิ้งไปเลย
6. ตอบกลับมาในรูปแบบ JSON Array เท่านั้น ไม่ต้องแสดงคะแนน Match Score ในผลลัพธ์ ตัวอย่างรูปแบบที่ต้องการ:
[{"id": 1, "name": "ชื่อร้าน", "food_category": "หมวดหมู่อาหาร"}]
ห้ามมีข้อความอธิบายอื่นใดรวมอยู่ด้วย นอกเหนือจาก JSON Array เด็ดขาด!`;

    let finalMessage = "";

    try {
        if (aiProvider === 'gemini') {
            const validPassword = process.env.VIP_PASSWORD || "1234";
            if (aiPassword !== validPassword) {
                return { status: 'error', message: 'รหัสผ่าน VIP ไม่ถูกต้อง! ❌' };
            }
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
            const result = await model.generateContent(`${sysPrompt}\n\nข้อมูลจากการค้นหา:\n${rawSearchResults}`);
            finalMessage = result.response.text();
        } else {
            // Default to Groq
            const response2 = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: sysPrompt },
                    { role: "user", content: `ข้อมูลจากการค้นหา:\n${rawSearchResults}\n\nสรุป 5 ร้านออกมาเป็น JSON Array ตามคำสั่งได้เลย` }
                ],
                response_format: { type: "json_object" }
            });
            finalMessage = response2.choices[0].message.content;
        }

        let parsedRestaurants = [];
        try {
            const parsed = JSON.parse(finalMessage);
            if (Array.isArray(parsed)) {
                parsedRestaurants = parsed;
            } else if (parsed.restaurants && Array.isArray(parsed.restaurants)) {
                parsedRestaurants = parsed.restaurants;
            } else {
                parsedRestaurants = Object.values(parsed).find(v => Array.isArray(v)) || [];
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
        }

        if (parsedRestaurants.length > 0) {
            parsedRestaurants = parsedRestaurants.map((r, idx) => ({
                id: idx + 1,
                name: r.name || "Unknown",
                food_category: r.food_category || category
            })).slice(0, 5);

            return {
                status: 'result_list',
                message: "นี่คือร้านเด็ดที่ผ่านการคัดกรองมาแล้วครับ! เชิญไปสุ่มวงล้อได้เลย!",
                data: parsedRestaurants
            };
        } else {
            return {
                status: 'error',
                message: "หาแล้วหาอีก... ก็ไม่เจอร้านที่ตรงกับพิกัดหรือเงื่อนไขของคุณเลยครับ 😭 ลองขยับพิกัดให้กว้างขึ้น หรือลดเงื่อนไขลงนิดนึงน้า"
            };
        }
    } catch (e) {
        console.error("RAG Execute Error:", e);
        return { status: 'error', message: "ระบบค้นหามีปัญหา! 💥 ลองอัญเชิญใหม่อีกทีนะครับ" };
    }
}

/**
 * Main ReAct Loop for generating conversational AI response with Tools.
 */
async function generateReActResponse(chatHistoryText, progressCallback = () => {}) {
    progressCallback("🔮 บอทตื่นแล้ว... กำลังแอบอ่านบริบทแชท 10 บรรทัดล่าสุดของพวกคุณ");

    const systemPrompt = `คุณคือ AI ผู้เชี่ยวชาญด้านอาหารชื่อ Meal Roulette หน้าที่ของคุณคือวิเคราะห์แชทกลุ่มล่าสุดเพื่อหาความต้องการในการเลือกร้านอาหาร
ให้ตอบเป็นภาษาไทยด้วยน้ำเสียง "น่ารัก ออดอ้อน เป็นมิตร กวนนิดๆ แต่อย่าดุดันเด็ดขาด"
คุณต้องพยายามสกัดข้อมูล 5 มิติให้ได้มากที่สุด:
1. location (พิกัด) [จำเป็นต้องมี]
2. category (หมวดหมู่อาหาร/เครื่องดื่ม) [จำเป็นต้องมี]
3. budget (งบประมาณ) [ถ้ามี]
4. vibe (บรรยากาศ) [ถ้ามี]
5. specific_req (เงื่อนไขพิเศษ เช่น ระยะทาง ที่จอดรถ) [ถ้ามี]

กฎเหล็กสำหรับการตรวจสอบพิกัด (Location):
- ห้ามปล่อยผ่านพิกัดที่กำกวม เช่น "ใกล้ออฟฟิศ", "ใกล้บ้าน" โดยเด็ดขาด ให้ใช้ function "request_missing_info" ถามกลับไปว่า "ออฟฟิศอยู่แถวไหน/ย่านอะไรคะ พิมพ์บอกเค้าหน่อยน้า"
- หากผู้ใช้ใส่ชื่อสถานที่ที่ไม่มีอยู่จริงบนโลก หรือเป็นคำกวนๆ (เช่น ดาวอังคาร, เมืองบาดาล, โลกมนุษย์) ให้ใช้ function "request_missing_info" ตอบกลับแบบกวนๆ แต่น่ารักว่า "โธ่ๆ ที่นั่นเค้ายังไม่เปิดสาขาน้าา ขอพิกัดจริงบนโลกมนุษย์หน่อยสิเตง"

กฎเหล็กสำหรับการตรวจสอบหมวดหมู่ (Category):
- ไม่ว่าผู้ใช้จะพิมพ์ชื่อเมนูเฉพาะเจาะจง (เช่น ข้าวแกง, อาหารตามสั่ง, ก๋วยเตี๋ยว, ข้าวมันไก่) หรือ หมวดหมู่กว้างๆ ให้ถือว่านั่นคือ "หมวดหมู่อาหาร (Category)" ที่ถูกต้องสมบูรณ์แล้ว ห้ามถามหาหมวดหมู่อีก!

หากมิติที่ "จำเป็น" ยังไม่ครบ หรือผิดกฎ ให้ใช้ function "request_missing_info" เพื่อทวงถาม โดยพูดอ้างอิงข้อมูลที่มีอยู่แล้ว เช่น "พิกัดมีแล้ว แถวสยาม แต่ยังขาดหมวดหมู่อาหารเลยนะครับ..."
หากข้อมูล "จำเป็น" ครบถ้วนและผ่านกฎแล้ว ให้ใช้ function "confirm_search" ทันที ห้ามใช้ฟังก์ชันอื่นเด็ดขาด! เพื่อสรุปข้อมูลและให้ผู้ใช้ยืนยัน โดยคุณต้องแต่งประโยค 'optimized_search_query' สำหรับดึงข้อมูลรีวิวให้ฉลาดที่สุด เช่น "รีวิว แนะนำ ร้าน [หมวดหมู่] ย่าน [พิกัด] [บรรยากาศ] [เงื่อนไข] [งบประมาณ] pantip wongnai bkkmenu" เพื่อล็อกเป้ากระทู้รีวิวคุณภาพสูง`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `[ประวัติแชทล่าสุด 10 บรรทัด]\n${chatHistoryText}\n\nวิเคราะห์และสรุปผลเพื่อยืนยัน หรือขอข้อมูลเพิ่มได้เลย!` }
    ];

    const tools = [
        {
            type: "function",
            function: {
                name: "confirm_search",
                description: "เรียกใช้เมื่อมีข้อมูลพิกัด(location)และหมวดหมู่อาหาร(category)ครบถ้วน เพื่อส่งหน้าต่างให้ผู้ใช้ยืนยันและเลือก AI",
                parameters: {
                    type: "object",
                    properties: {
                        location: { type: "string", description: "พิกัดหรือทำเล เช่น หาดใหญ่, สยาม, ลาดพร้าว" },
                        category: { type: "string", description: "หมวดหมู่อาหาร เช่น ชาบู, อาหารญี่ปุ่น, ส้มตำ" },
                        budget: { type: "string", description: "งบประมาณ (ถ้ามี) เช่น ราคาถูก, ไม่เกิน 500" },
                        vibe: { type: "string", description: "บรรยากาศ (ถ้ามี) เช่น ถ่ายรูปสวย, เดท" },
                        specific_req: { type: "string", description: "เงื่อนไขพิเศษ (ถ้ามี) เช่น มีที่จอดรถ" },
                        optimized_search_query: { type: "string", description: "ประโยคค้นหาที่ฉลาดที่สุดเพื่อดึงรีวิว เช่น 'รีวิว แนะนำ ร้านชาบู สยาม มีที่จอดรถ pantip wongnai bkkmenu'" }
                    },
                    required: ["location", "category", "optimized_search_query"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "request_missing_info",
                description: "เรียกใช้เมื่อข้อมูลพิกัดหรือหมวดหมู่อาหารไม่ชัดเจนในแชท เพื่อขอข้อมูลเพิ่มเติม",
                parameters: {
                    type: "object",
                    properties: {
                        missing_fields: {
                            type: "array",
                            items: { type: "string", enum: ["location", "category", "budget", "vibe", "specific_req"] },
                            description: "ระบุสิ่งที่ขาดหายไป"
                        },
                        bot_message: {
                            type: "string",
                            description: "ข้อความที่จะให้บอทพูดเพื่อขอข้อมูล ต้องมีน้ำเสียงน่ารัก เป็นมิตร อ้างอิงสิ่งที่รู้แล้ว เช่น 'พิกัดสยามน่าสนใจมาก! แต่ยังไม่รู้เลยว่าอยากกินแนวไหน ซุปร้อนๆดีไหมนะ?' (ห้ามใช้ตัวอักษรภาษาอื่นนอกจากไทยและอังกฤษ ห้ามใช้อักษรแปลกๆเด็ดขาด)"
                        }
                    },
                    required: ["missing_fields", "bot_message"]
                }
            }
        }
    ];

    try {
        console.log("[AIService] Calling Groq Step 1 (Reasoning)...");
        const response1 = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        });

        const responseMessage = response1.choices[0].message;

        // If Groq decides to use a tool
        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);

            if (toolCall.function.name === 'request_missing_info') {
                console.log("[AIService] Groq requested missing info:", args);
                return {
                    status: 'missing_info',
                    missing_fields: args.missing_fields,
                    message: args.bot_message
                };
            }

            if (toolCall.function.name === 'confirm_search') {
                console.log("[AIService] Groq confirmed search details:", args);
                return {
                    status: 'confirm_search',
                    dimensions: args
                };
            }
        }

        // If Groq didn't use any tool (just replied normally)
        return {
            status: 'success',
            message: responseMessage.content
        };

    } catch (e) {
        console.error("[AIService] Error:", e);
        return {
            status: 'error',
            message: "อ้าว ระบบสมองกลช็อต! 💥 ลองอัญเชิญใหม่อีกทีนะครับ"
        };
    }
}

module.exports = {
    generateReActResponse,
    executeRAGSearch
};
