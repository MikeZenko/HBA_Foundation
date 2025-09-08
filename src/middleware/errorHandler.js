const notFound = (req, res, next) => {
  res.status(404).json({ 
    message: `Not found - ${req.originalUrl}`,
    error: 'Not Found' 
  });
};

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof Error)) {
    error = new Error(err);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong!'
  });
};

module.exports = {
  notFound,
  errorConverter,
  errorHandler
}; 