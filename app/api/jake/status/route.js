export async function GET() {
  try {
    return Response.json({
      name: "Jake the Bartender",
      status: "Ready to chat!",
      personality: "Friendly Hokie bartender",
      geminiConfigured: !!process.env.GEMINI_API_KEY
    });
  } catch (error) {
    console.error('Jake status error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    }
  });
}
