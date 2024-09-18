const ErrorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode ? res.statusCode : 500;
  let message = err.message;

  if (err.name === "CastError") {
    message = `Resource not found. Invalid: ${err.path}`;
    statusCode = 404;
  }
  if (err.name === "ValidationError") {
    message = "Validation Failed";
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default ErrorHandler;
