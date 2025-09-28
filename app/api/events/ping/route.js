// Polling-based alternative to Server-Sent Events
// Since SSE doesn't work well with serverless functions, we'll use polling

export async function GET() {
  try {
    // Simple ping response for polling-based updates
    return Response.json({
      event: 'ping',
      data: { ts: Date.now() },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Events ping error:', error);
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
