const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExcelTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('image/') ||
    allowedExcelTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Image and Excel allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;