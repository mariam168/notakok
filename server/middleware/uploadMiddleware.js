const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitize = (name) => name.replace(/[^a-zA-Z0-9_.-]/g, '_');

    const groupName = req.body.groupName ? `${sanitize(req.body.groupName)}-` : '';
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s/g, '_');

    const finalFilename = `${groupName}${timestamp}-${originalName}`;
    cb(null, finalFilename);
  },
});

module.exports = multer({ storage });