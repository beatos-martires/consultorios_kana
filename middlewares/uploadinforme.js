const multer = require("multer");
const path = require("path");
const fs = require("fs");

const destino = path.join(__dirname, "..", "uploads", "informes");

fs.mkdirSync(destino, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destino);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${Date.now()}-${base}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Solo se permiten archivos PDF."));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});