const { Pool } = require("pg");
const dns = require("dns");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      if (err) {
        console.error("DNS lookup failed:", err);
      } else {
        console.log(`Resolved ${hostname} to IPv4: ${address}`);
      }
      callback(err, address, family);
    });
  },
});

module.exports = pool;
