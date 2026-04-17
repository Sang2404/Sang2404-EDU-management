const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the client SDK easily accessible this way usually
    // but we can try to find the correct naming.
    // Actually, let's just try the most common ones.
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`Model ${m} works!`);
        } catch (e) {
            console.log(`Model ${m} failed: ${e.message}`);
        }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
