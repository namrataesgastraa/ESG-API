const { User } = require('../models');
const bcrypt = require('bcryptjs');
const Validator = require('../utils/validator');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/jwt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const requiredError = Validator.required(['email', 'password'], req.body);
    if (requiredError) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: requiredError
      });
    }

    if (!Validator.isEmail(email)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Invalid email format'
      });
    }

    const user = await User.findOne({
      where: { email, is_delete: false }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Invalid credential'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: false,
        responseCode: 403,
        message: 'Invalid credential'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Invalid credential'
      });
    }

    await user.update({ last_login_at: new Date() });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userData = user.toJSON();
    delete userData.password;
    delete userData.createdAt;
    delete userData.updatedAt;
    delete userData.created_by;
    delete userData.updated_by;
    delete userData.is_delete;
    delete userData.last_login_at;

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: 'Internal server error'
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET,
      { algorithms: ['HS256'] }
    );

    const user = await User.findByPk(decoded.id);

    if (!user || user.is_delete) {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Invalid refresh token'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: false,
        responseCode: 403,
        message: 'User is inactive'
      });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: false,
        responseCode: 401,
        message: 'Invalid or expired refresh token'
      });
    }
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: 'Internal server error'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId, is_delete: false }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'User not found'
      });
    }

    const userData = user.toJSON();

    delete userData.password;
    delete userData.createdAt;
    delete userData.updatedAt;
    delete userData.created_by;
    delete userData.updated_by;
    delete userData.is_delete;
    delete userData.last_login_at;

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Profile fetched successfully',
      data: userData
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: 'Internal server error'
    });
  }
};