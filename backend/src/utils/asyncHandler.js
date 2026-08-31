// Wraps an async route/controller handler so rejected promises are passed
// to Express's error middleware instead of needing a try/catch in every one.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
