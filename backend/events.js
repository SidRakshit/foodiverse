const clients = new Set();

function sseHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const client = { res };
  clients.add(client);

  // Send initial ping
  res.write(`event: ping\n`);
  res.write(`data: {"ts": ${Date.now()}}\n\n`);

  const keepAlive = setInterval(() => {
    try {
      res.write(`event: ping\n`);
      res.write(`data: {"ts": ${Date.now()}}\n\n`);
    } catch (e) {
      clearInterval(keepAlive);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    clients.delete(client);
  });
}

function broadcast(eventName, data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  for (const { res } of clients) {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // If client is closed, it will be cleaned up on next close event
    }
  }
}

module.exports = { sseHandler, broadcast };


