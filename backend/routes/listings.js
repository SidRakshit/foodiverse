const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

/* ---------- auth middleware ---------- */
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded; // { id }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ---------- routes ---------- */

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Simple database connectivity check
    await pool.query("SELECT 1");
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({ status: "unhealthy", error: "Database connection failed" });
  }
});

// Get fridge food items - filtered by apartment/building if specified
router.get("/", async (req, res) => {
  try {
    const { apartment_id, building_id } = req.query;
    
    let query = `
      SELECT 
        l.id,
        l.item_name,
        l.photo_url,
        l.apartment_number,
        l.building_number,
        l.days_to_expiry,
        l.status,
        l.created_at,
        l.building_id,
        l.user_id,
        u.name AS owner_name
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Filter by building_id if provided
    if (building_id) {
      query += ` AND l.building_id = $${paramCount}`;
      // Convert to integer if it's a string number
      const buildingIdInt = parseInt(building_id);
      params.push(isNaN(buildingIdInt) ? building_id : buildingIdInt);
      paramCount++;
    }
    
    // Filter by apartment if provided
    if (apartment_id) {
      query += ` AND l.apartment_number = $${paramCount}`;
      params.push(apartment_id);
      paramCount++;
    }
    
    query += ` ORDER BY l.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    // Transform data to match FridgeItem interface
    const fridgeItems = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.item_name,
      quantity: 1, // Default quantity
      addedBy: row.owner_name || 'Unknown',
      dateAdded: new Date(row.created_at),
      expirationDate: row.days_to_expiry ? 
        new Date(Date.now() + (row.days_to_expiry * 24 * 60 * 60 * 1000)) : 
        undefined,
      category: 'other', // Default category, could be enhanced with AI categorization
      status: row.status || 'available',
      photo_url: row.photo_url,
      apartment_number: row.apartment_number,
      building_number: row.building_number,
      building_id: row.building_id,
      user_id: row.user_id
    }));

    res.json(fridgeItems);
  } catch (err) {
    console.error("Error fetching fridge items:", err);
    res.status(500).json({ error: "Failed to fetch fridge items" });
  }
});

// Add/Update fridge food item
router.post("/", async (req, res) => {
  try {
    const {
      item_name,
      photo_url,
      apartment_number,
      building_number,
      days_to_expiry,
      quantity = 1,
      category = 'other'
    } = req.body;
    
    // Validation
    if (!item_name) {
      return res.status(400).json({ error: "item_name is required" });
    }
    
    const q = `
      INSERT INTO listings (
        user_id, 
        building_id, 
        item_name, 
        photo_url, 
        apartment_number, 
        building_number, 
        days_to_expiry,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'available') 
      RETURNING *
    `;
    
    const result = await pool.query(q, [
      1, // Default user_id when no auth
      parseInt(building_number) || 1, // Use building_number as building_id
      item_name,
      photo_url,
      apartment_number,
      building_number,
      days_to_expiry,
    ]);

    // Transform response to match FridgeItem interface
    const newItem = {
      id: result.rows[0].id.toString(),
      name: result.rows[0].item_name,
      quantity: quantity,
      addedBy: 'Player',
      dateAdded: new Date(result.rows[0].created_at),
      expirationDate: days_to_expiry ? 
        new Date(Date.now() + (days_to_expiry * 24 * 60 * 60 * 1000)) : 
        undefined,
      category: category,
      status: result.rows[0].status,
      photo_url: result.rows[0].photo_url,
      apartment_number: result.rows[0].apartment_number,
      building_number: result.rows[0].building_number,
      building_id: result.rows[0].building_id,
      user_id: result.rows[0].user_id
    };

    res.json(newItem);
  } catch (err) {
    console.error("Error adding fridge item:", err);
    res.status(500).json({ error: "Failed to add fridge item" });
  }
});

// Update fridge food item status (for claiming/completing items)
router.put("/", async (req, res) => {
  try {
    const { id, status, apartment_id, building_id, items } = req.body;
    
    // If updating a single item
    if (id && status) {
      const q = `UPDATE listings SET status = $1 WHERE id = $2 RETURNING *`;
      const result = await pool.query(q, [status, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.json({ message: `Item ${status} successfully`, item: result.rows[0] });
    }
    // If bulk updating items for a fridge
    else if (items && Array.isArray(items)) {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        const results = [];
        
        for (const item of items) {
          if (item.id) {
            // Update existing item
            const q = `
              UPDATE listings 
              SET 
                item_name = $1,
                days_to_expiry = $2,
                status = $3
              WHERE id = $4 
              RETURNING *
            `;
            const result = await client.query(q, [
              item.name,
              item.days_to_expiry,
              item.status || 'available',
              item.id
            ]);
            
            if (result.rows.length > 0) {
              results.push(result.rows[0]);
            }
          } else {
            // Insert new item
            const q = `
              INSERT INTO listings (
                user_id, 
                building_id, 
                item_name, 
                apartment_number, 
                building_number, 
                days_to_expiry,
                status
              )
              VALUES ($1, $2, $3, $4, $5, $6, 'available') 
              RETURNING *
            `;
            const result = await client.query(q, [
              1, // Default user_id
              building_id || 1,
              item.name,
              apartment_id,
              building_id,
              item.days_to_expiry
            ]);
            
            results.push(result.rows[0]);
          }
        }
        
        await client.query('COMMIT');
        res.json({ message: "Fridge updated successfully", items: results });
        
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    else {
      res.status(400).json({ error: "Invalid request. Provide either id+status or items array." });
    }
    
  } catch (err) {
    console.error("Error updating fridge:", err);
    res.status(500).json({ error: "Failed to update fridge" });
  }
});
// Delete fridge food item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists and user has permission
    const checkQuery = "SELECT * FROM listings WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    const item = checkResult.rows[0];
    
    // Allow deletion for now (no auth)
    // In production, you might want to add some basic validation
    
    const deleteQuery = "DELETE FROM listings WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [id]);
    
    res.json({ message: "Item deleted successfully", item: result.rows[0] });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Claim item - now deletes the item immediately
router.put("/:id/claim", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await pool.query("SELECT * FROM listings WHERE id=$1", [id]);
    
    if (listing.rows.length === 0)
      return res.status(404).json({ error: "Listing not found" });
    if (listing.rows[0].status !== "available")
      return res.status(400).json({ error: "Listing already claimed" });

    // Delete the item instead of just marking as claimed
    await pool.query("DELETE FROM listings WHERE id=$1", [id]);
    
    // Award points to the original poster
    await pool.query("UPDATE users SET points = points + 10 WHERE id=$1", [
      listing.rows[0].user_id,
    ]);
    
    res.json({ message: "Item claimed and removed successfully, points awarded to original poster" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
