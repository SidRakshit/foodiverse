import { Pool } from "pg";

let pool;

// Create a singleton pool for serverless functions
export default function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Optimize for serverless
      max: 1, // Limit concurrent connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}
