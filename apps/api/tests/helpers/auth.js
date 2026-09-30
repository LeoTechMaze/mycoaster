const jwt = require('jsonwebtoken');

function generateToken(payload = {}) {
  const { id, email, ...rest } = payload;
  return jwt.sign(
    { sub: id || 'test-user-id', email: email || 'test@example.com', ...rest },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = { generateToken };
