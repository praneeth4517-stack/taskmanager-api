// Simple API-key authentication middleware.
// The key is read from the API_KEY environment variable so it can differ
// between the staging and production deployments (see docker-compose files).

const DEFAULT_KEY = "dev-local-key";

function apiKeyAuth(req, res, next) {
  const expectedKey = process.env.API_KEY || DEFAULT_KEY;
  const providedKey = req.header("x-api-key");

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid API key" });
  }

  return next();
}

module.exports = apiKeyAuth;
