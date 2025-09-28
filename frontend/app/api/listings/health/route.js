import getPool from "../../../lib/db.js";

export async function GET() {
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    return Response.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Health check failed:", err);
    return Response.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 503 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
