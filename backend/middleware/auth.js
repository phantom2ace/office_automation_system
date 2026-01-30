// backend/middleware/auth.js
const db = require("../database");

module.exports = function(requiredRole) {
  return (req, res, next) => {
    const userId = req.headers.userid;
    const role = req.headers.role;
    
    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }
    
    if (requiredRole && !role) {
      return res.status(401).json({ message: "Role is required for this resource" });
    }

    // Verify user exists in database
    db.get(
      "SELECT id, role, department FROM users WHERE id = ? AND status = 'Active'",
      [userId],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: "Internal server error" });
        }
        
        if (!user) {
          return res.status(404).json({ message: "User not found or inactive" });
        }
        
        if (requiredRole && user.role !== requiredRole && user.role !== "Admin") {
          return res.status(403).json({ 
            message: `Access denied. Required role: ${requiredRole}`, 
            requiredRole: requiredRole 
          });
        }
        
        // Attach user information to the request
        req.user = {
          id: user.id,
          role: user.role,
          department: user.department
        };
        
        next();
      }
    );
  };
};