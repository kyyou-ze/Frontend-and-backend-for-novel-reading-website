const requestCounts = new Map();

export const antiScraping = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const timeWindow = 60000; // 1 minute
  const maxRequests = 60;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter(time => now - time < timeWindow);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({ 
      message: 'Terlalu banyak request, tunggu sebentar' 
    });
  }

  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);

  // Cleanup old entries
  if (requestCounts.size > 10000) {
    const entries = Array.from(requestCounts.entries());
    const toDelete = entries.slice(0, 5000);
    toDelete.forEach(([key]) => requestCounts.delete(key));
  }

  next();
};
