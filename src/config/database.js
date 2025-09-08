// Simple database connection module
const connectDatabase = async () => {
  console.log('Database connection skipped (development mode)');
  return Promise.resolve();
};

module.exports = {
  connectDatabase
}; 