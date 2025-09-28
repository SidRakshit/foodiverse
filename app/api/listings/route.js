import getPool from "../../lib/db.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment_id = searchParams.get('apartment_id');
    const building_id = searchParams.get('building_id');
    
    const pool = getPool();
    
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
      quantity: 1,
      addedBy: row.owner_name || 'Unknown',
      dateAdded: new Date(row.created_at),
      expirationDate: row.days_to_expiry ? 
        new Date(Date.now() + (row.days_to_expiry * 24 * 60 * 60 * 1000)) : 
        undefined,
      category: 'other',
      status: row.status || 'available',
      photo_url: row.photo_url,
      apartment_number: row.apartment_number,
      building_number: row.building_number,
      building_id: row.building_id,
      user_id: row.user_id
    }));

    return Response.json(fridgeItems);
  } catch (err) {
    console.error("Error fetching fridge items:", err);
    return Response.json(
      { error: "Failed to fetch fridge items" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      item_name,
      photo_url,
      apartment_number,
      building_number,
      days_to_expiry,
      quantity = 1,
      category = 'other'
    } = body;
    
    if (!item_name) {
      return Response.json({ error: "item_name is required" }, { status: 400 });
    }
    
    const pool = getPool();
    
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
      parseInt(building_number) || 1,
      item_name,
      photo_url,
      apartment_number,
      building_number,
      days_to_expiry,
    ]);

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

    return Response.json(newItem);
  } catch (err) {
    console.error("Error adding fridge item:", err);
    return Response.json(
      { error: "Failed to add fridge item" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}