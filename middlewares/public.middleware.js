const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (decoded.type !== 'public') {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Invalid token type'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      status: false,
      responseCode: 401,
      message: 'Invalid or expired token'
    });
  }
};