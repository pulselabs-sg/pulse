// Production note: Replace with Upstash Redis for distributed serverless environments.
const rateLimitCache = new Map();

export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const userData = rateLimitCache.get(ip) || { count: 0, startTime: now, totalUsage: 0 };

  if (now - userData.startTime > windowMs) {
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count++;
  }

  userData.totalUsage++; // Lifetime MVP counter
  rateLimitCache.set(ip, userData);

  return {
    success: userData.count <= limit,
    totalUsage: userData.totalUsage,
  };
}