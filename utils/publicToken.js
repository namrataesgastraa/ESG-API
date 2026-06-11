const jwt = require('jsonwebtoken');

exports.generatePublicToken = () => {
  return jwt.sign(
    { type: 'public' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};