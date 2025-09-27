const express = require("express");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware for JWT auth
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/suggest", authMiddleware, async (req, res) => {
  try {
    const { food_item } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    Create a quick recipe and nutrition facts for this food item: ${food_item}.
    Format response as JSON with keys:
    {
      "recipeTitle": "...",
      "ingredients": ["..."],
      "steps": ["..."],
      "nutrition": {
        "calories": "...",
        "protein": "...",
        "carbs": "...",
        "fat": "..."
      }
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // fallback if Gemini doesn't return valid JSON
      data = { recipeTitle: "Suggestion unavailable", ingredients: [], steps: [], nutrition: {} };
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recipe generation failed" });
  }
});

module.exports = router;
