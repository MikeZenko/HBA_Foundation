const createInitialAdmin = async () => {
  console.log('Initial admin creation skipped (development mode)');
  return Promise.resolve();
};

module.exports = {
  createInitialAdmin
}; 