import getPool from "../../lib/db.js";

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

  const { id } = req.query;
  const pool = getPool();

  try {
    if (req.method === 'DELETE') {
      // Delete fridge food item
      const checkQuery = "SELECT * FROM listings WHERE id = $1";
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      const deleteQuery = "DELETE FROM listings WHERE id = $1 RETURNING *";
      const result = await pool.query(deleteQuery, [id]);
      
      res.json({ message: "Item deleted successfully", item: result.rows[0] });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error("Error in listings/[id] API:", err);
    res.status(500).json({ error: "Server error" });
  }
}
