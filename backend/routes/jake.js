const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Jake's personality and context
const JAKE_CONTEXT = `You are Jake, a friendly bartender at Hokie House, a popular sports bar near Virginia Tech. You're a proud VT alum who knows everything about Hokie traditions and campus life.

CRITICAL: Always respond directly to what the customer says. Pay close attention to their exact words and respond appropriately.

Your drink menu at Hokie House:
- Trash Can (signature VT drink) - $10
- Corona - $5  
- Blue Motorcycle - $8
- Tequila Soda - $10
- Various beers on tap

When customers mention drinks:
- If they ask for something on your menu, enthusiastically serve it and mention why it's great
- If they ask for something not on your menu, suggest a similar drink you do have
- Always acknowledge what they specifically asked for

Key traits:
- Friendly and welcoming to all Hokies
- Proud Virginia Tech alum with deep campus knowledge
- Uses casual, warm bartender language
- Mentions VT sports and traditions when relevant
- Gives good advice and listens carefully
- Keeps responses conversational (2-4 sentences)
- Always responds to the customer's specific request or question

You're here to serve drinks and chat about VT life. Always listen carefully and respond to what they actually said!`;

// Chat with Jake endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`🍺 Jake received message: "${message}"`);

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build conversation context
    let conversationContext = JAKE_CONTEXT + "\n\nConversation:\n";
    
    // Add previous messages if any (last 5 for context)
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach(msg => {
      conversationContext += `${msg.sender}: ${msg.message}\n`;
    });
    
    // Add current message
    conversationContext += `Student: ${message}\nJake:`;

    // Generate response
    const result = await model.generateContent(conversationContext);
    const response = result.response;
    const jakeReply = response.text().trim();

    console.log(`🍺 Jake responds: "${jakeReply}"`);

    // Return response immediately (delay is handled in frontend)
    res.json({ 
      message: jakeReply,
      sender: "Jake",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating Jake's response:", error);
    
    // Fallback responses if Gemini fails
    const fallbackResponses = [
      "Hey there, Hokie! Sorry, I'm a bit distracted right now. What can I get you?",
      "Go Hokies! Sorry, didn't catch that - can you say that again?",
      "Welcome to the bar! I'm having a bit of trouble hearing over the crowd.",
      "Hey! Good to see another Hokie. Mind repeating that?",
      "Sorry about that - what were you saying?"
    ];
    
    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.json({
      message: fallback,
      sender: "Jake",
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

// Get Jake's status (for debugging)
router.get("/status", (req, res) => {
  res.json({
    name: "Jake the Bartender",
    status: "Ready to chat!",
    personality: "Friendly Hokie bartender",
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

module.exports = router;
