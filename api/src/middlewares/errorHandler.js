/**
 * Global error handler middleware.
 * Must be registered LAST in the Express app (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV === "development";

  console.error("[Error]", err);

  // Known operational errors
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      error: err.message,
      ...(isDev && { stack: err.stack }),
    });
  }

  // PostgreSQL unique violation
  if (err.code === "23505") {
    return res.status(409).json({ error: "Conflict: resource already exists" });
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({ error: "Invalid reference: related resource not found" });
  }

  // Default: 500
  return res.status(500).json({
    error: "Internal server error",
    ...(isDev && { message: err.message, stack: err.stack }),
  });
}

module.exports = errorHandler;
