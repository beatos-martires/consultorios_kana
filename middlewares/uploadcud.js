const multer = require("multer");
const path = require("path");
const fs = require("fs");

const destino = path.join(__dirname, "..", "uploads", "cud");

fs.mkdirSync(destino, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destino);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombreBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const nombreFinal = `${Date.now()}-${nombreBase}${extension}`;
    cb(null, nombreFinal);
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Solo se permiten archivos PDF."));
  }
  cb(null, true);
}

const uploadCud = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = uploadCud;