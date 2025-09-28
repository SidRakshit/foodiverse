import getPool from "../../../../lib/db.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const pool = getPool();

  try {
    const listing = await pool.query("SELECT * FROM listings WHERE id=$1", [id]);
    
    if (listing.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    if (listing.rows[0].status !== "available") {
      return res.status(400).json({ error: "Listing already claimed" });
    }

    // Delete the item instead of just marking as claimed
    await pool.query("DELETE FROM listings WHERE id=$1", [id]);
    
    // Award points to the original poster
    await pool.query("UPDATE users SET points = points + 10 WHERE id=$1", [
      listing.rows[0].user_id,
    ]);
    
    res.json({ 
      message: "Item claimed and removed successfully, points awarded to original poster" 
    });
  } catch (err) {
    console.error("Error claiming item:", err);
    res.status(500).json({ error: "Server error" });
  }
}
