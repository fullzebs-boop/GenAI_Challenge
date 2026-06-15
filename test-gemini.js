require('dotenv').config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log("Fetching url...");
    const res = await fetch(url);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
test();
