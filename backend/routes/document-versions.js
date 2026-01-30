const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Setup file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Initialize document versioning table
db.run(`
  CREATE TABLE IF NOT EXISTS document_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documentId INTEGER NOT NULL,
    versionNumber INTEGER NOT NULL,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    uploadedBy INTEGER,
    uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    fileSize INTEGER,
    FOREIGN KEY(documentId) REFERENCES documents(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS document_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documentId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    comment TEXT NOT NULL,
    commentedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(documentId) REFERENCES documents(id)
  )
`);

// Get all versions of a document
router.get('/document/:documentId/versions', auth(), (req, res) => {
  db.all(
    `SELECT dv.*, u.name as uploadedByName 
     FROM document_versions dv
     LEFT JOIN users u ON dv.uploadedBy = u.id
     WHERE dv.documentId = ?
     ORDER BY dv.versionNumber DESC`,
    [req.params.documentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Upload new version of document
router.post('/document/:documentId/upload-version', auth(), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const uploadedBy = req.user.id;
  const comments = req.body.comments || '';

  // Get the current highest version number
  db.get(
    'SELECT MAX(versionNumber) as maxVersion FROM document_versions WHERE documentId = ?',
    [req.params.documentId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      const versionNumber = (row?.maxVersion || 0) + 1;

      db.run(
        `INSERT INTO document_versions (documentId, versionNumber, fileName, filePath, uploadedBy, comments, fileSize)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.params.documentId, versionNumber, req.file.originalname, req.file.path, uploadedBy, comments, req.file.size],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ 
            id: this.lastID, 
            versionNumber,
            message: `Version ${versionNumber} uploaded successfully` 
          });
        }
      );
    }
  );
});

// Get document comments
router.get('/document/:documentId/comments', (req, res) => {
  db.all(
    `SELECT dc.*, u.name as userName 
     FROM document_comments dc
     LEFT JOIN users u ON dc.userId = u.id
     WHERE dc.documentId = ?
     ORDER BY dc.commentedAt DESC`,
    [req.params.documentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Add comment to document
router.post('/document/:documentId/comment', auth(), (req, res) => {
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  db.run(
    'INSERT INTO document_comments (documentId, userId, comment) VALUES (?, ?, ?)',
    [req.params.documentId, userId, comment],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Comment added' });
    }
  );
});

// Delete document version
router.delete('/:versionId', (req, res) => {
  db.run(
    'DELETE FROM document_versions WHERE id = ?',
    [req.params.versionId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Version deleted' });
    }
  );
});

// Revert to specific version
router.post('/:versionId/revert', auth(), (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT * FROM document_versions WHERE id = ?',
    [req.params.versionId],
    (err, version) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!version) return res.status(404).json({ error: 'Version not found' });

      // Get max version to create new version
      db.get(
        'SELECT MAX(versionNumber) as maxVersion FROM document_versions WHERE documentId = ?',
        [version.documentId],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });

          const newVersionNumber = (row?.maxVersion || 0) + 1;

          db.run(
            `INSERT INTO document_versions (documentId, versionNumber, fileName, filePath, uploadedBy, comments, fileSize)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [version.documentId, newVersionNumber, version.fileName, version.filePath, userId, `Reverted to version ${version.versionNumber}`, version.fileSize],
            function(err) {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ message: `Reverted to version ${version.versionNumber}. Created new version ${newVersionNumber}` });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
