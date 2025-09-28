import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware for JWT auth
function authMiddleware(request) {
  const token = request.headers.get("authorization");
  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export async function POST(request) {

  try {
    // Check authentication
    authMiddleware(request);

    const { food_item } = await request.json();

    if (!food_item) {
      return Response.json({ error: 'food_item is required' }, { status: 400 });
    }

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
      data = { 
        recipeTitle: "Suggestion unavailable", 
        ingredients: [], 
        steps: [], 
        nutrition: {} 
      };
    }

    return Response.json(data);
  } catch (err) {
    console.error("Recipe generation error:", err);
    if (err.message === "No token provided" || err.message === "Invalid token") {
      return Response.json({ error: err.message }, { status: 401 });
    }
    return Response.json({ error: "Recipe generation failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    }
  });
}
