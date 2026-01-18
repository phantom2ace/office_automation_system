const express = require('express');
const router = express.Router();

// Only needed for server-side operations
router.get('/user-profile/:userId', (req, res) => {
  // Still needed if you have additional user profile data
});

// Add this endpoint for Firebase token generation if needed
router.post('/firebase-token', (req, res) => {
  const { userId } = req.body;
  
  // Generate custom token for Firebase Auth
  admin.auth().createCustomToken(userId)
    .then((customToken) => {
      res.json({ token: customToken });
    })
    .catch((error) => {
      console.error('Error creating custom token:', error);
      res.status(500).json({ error: 'Failed to generate token' });
    });
});

module.exports = router;