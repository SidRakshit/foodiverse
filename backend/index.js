const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const listingsRoutes = require("./routes/listings");
const leaderboardRoutes = require("./routes/leaderboard");
const recipeRoutes = require("./routes/recipes");
const { sseHandler } = require("./events");
const jakeRoutes = require("./routes/jake");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/listings", listingsRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/recipes", recipeRoutes);
app.use("/jake", jakeRoutes);




app.get("/", (req, res) => {
  res.send("Foodiverse backend is running...");
});

// Server-Sent Events endpoint
app.get("/events", sseHandler);

// Test DB route
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

