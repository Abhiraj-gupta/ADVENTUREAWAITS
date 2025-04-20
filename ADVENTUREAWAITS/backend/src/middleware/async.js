// Async handler middleware
// Wraps async functions to handle exceptions and pass them to the error handler
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler; 