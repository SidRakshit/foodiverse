const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Identify food from image URL
async function identifyFoodFromImage(imageUrl) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Identify the food item in this picture. Reply with just the food name.";
    const result = await model.generateContent([
      prompt,
      { image: { url: imageUrl } }
    ]);

    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini error:", err);
    return null;
  }
}

module.exports = { identifyFoodFromImage };
