const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");
const pool = require("../db");

const router = express.Router();

/* ---------- setup ---------- */
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image uploads allowed"));
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

/* ---------- helpers ---------- */
async function identifyFoodFromFile(filePath) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Identify the food item in this picture. Reply with just the food name.";
  const image = fs.readFileSync(filePath);
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: image.toString("base64"), mimeType: "image/jpeg" } },
  ]);
  return result.response.text().trim();
}

/* ---------- routes ---------- */

// Create listing from JSON body (manual item_name)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { item_name, photo_url, location } = req.body;
    const q = `INSERT INTO listings (user_id, item_name, photo_url, location)
               VALUES ($1,$2,$3,$4) RETURNING *`;
    const result = await pool.query(q, [req.user.id, item_name, photo_url, location]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create listing from uploaded photo (Gemini + Supabase Storage)
router.post("/photo", authMiddleware, upload.single("photo"), async (req, res) => {
  const tmpPath = req.file.path;
  try {
    const location = req.body.location || "Unknown";

    // 1) Gemini detect item name
    const item_name = (await identifyFoodFromFile(tmpPath)) || "Unknown Item";

    // 2) Upload image bytes to Supabase Storage (bucket: photos)
    const storagePath = `${req.user.id}/${Date.now()}_${req.file.originalname}`;
    const fileBuffer = fs.readFileSync(tmpPath);
    const { error: upErr } = await supabase
      .storage
      .from("photos")
      .upload(storagePath, fileBuffer, { contentType: req.file.mimetype, upsert: true });
    if (upErr) throw upErr;

    // 3) Get public URL
    const { data: pub } = supabase.storage.from("photos").getPublicUrl(storagePath);
    const photoUrl = pub.publicUrl;

    // 4) Save listing
    const q = `INSERT INTO listings (user_id, item_name, photo_url, location)
               VALUES ($1,$2,$3,$4) RETURNING *`;
    const result = await pool.query(q, [req.user.id, item_name, photoUrl, location]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload or Gemini failed" });
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
});

// Get available listings
router.get("/", async (req, res) => {
  try {
    const sql = `SELECT l.id, l.item_name, l.photo_url, l.location, l.status,
                        u.id AS owner_id, COALESCE(u.name, u.email) AS owner_name
                 FROM listings l
                 JOIN users u ON l.user_id = u.id
                 WHERE l.status = 'available'`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error("Listings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Claim
router.put("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await pool.query("SELECT * FROM listings WHERE id=$1", [id]);
    if (listing.rows.length === 0) return res.status(404).json({ error: "Listing not found" });
    if (listing.rows[0].status !== "available")
      return res.status(400).json({ error: "Listing already claimed/completed" });

    await pool.query("UPDATE listings SET status='claimed' WHERE id=$1", [id]);
    res.json({ message: "Listing claimed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Complete (award points)
router.put("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await pool.query("SELECT * FROM listings WHERE id=$1", [id]);
    if (listing.rows.length === 0) return res.status(404).json({ error: "Listing not found" });
    if (listing.rows[0].status !== "claimed")
      return res.status(400).json({ error: "Listing must be claimed first" });

    await pool.query("UPDATE listings SET status='completed' WHERE id=$1", [id]);
    await pool.query("UPDATE users SET points = points + 10 WHERE id=$1", [listing.rows[0].user_id]);
    res.json({ message: "Transaction completed, points awarded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
