import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export async function POST(request) {

  try {
    const { message, conversationHistory = [] } = await request.json();
    
    if (!message || !message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    console.log(`🍺 Jake received message: "${message}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    return Response.json({ 
      message: jakeReply,
      sender: "Jake",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating Jake's response:", error);
    
    const fallbackResponses = [
      "Hey there, Hokie! Sorry, I'm a bit distracted right now. What can I get you?",
      "Go Hokies! Sorry, didn't catch that - can you say that again?",
      "Welcome to the bar! I'm having a bit of trouble hearing over the crowd.",
      "Hey! Good to see another Hokie. Mind repeating that?",
      "Sorry about that - what were you saying?"
    ];
    
    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return Response.json({
      message: fallback,
      sender: "Jake",
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    }
  });
}
