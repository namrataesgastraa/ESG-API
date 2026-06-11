module.exports = (req, res, next) => {
  try {

    if (!req.user || !req.user.is_superadmin) {
      return res.status(403).json({
        status: false,
        responseCode: 403,
        message: 'Access denied'
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};