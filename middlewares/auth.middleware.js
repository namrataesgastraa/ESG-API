const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: {
        id: decoded.id,
        is_delete: false
      }
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Invalid user'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'User is inactive'
      });
    }

    req.user = user;
    req.tokenData = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      status: false,
      responseCode: 401,
      message: 'Invalid token'
    });
  }
};