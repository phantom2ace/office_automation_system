const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", auth(), upload.single("document"), (req, res) => {
  res.json({ message: "Document uploaded" });
});

module.exports = router;
