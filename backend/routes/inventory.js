const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Get inventory items
router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM inventory ORDER BY item",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add inventory item
router.post("/add", auth("Manager"), (req, res) => {
  const { item, category, quantity, minQuantity, unitPrice, supplier, location } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO inventory (item, category, quantity, minQuantity, unitPrice, supplier, location, updatedBy, lastUpdated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [item, category, quantity, minQuantity, unitPrice, supplier, location, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Log transaction
      db.run(
        `INSERT INTO inventory_transactions (inventoryId, transactionType, quantity, reason, processedBy, createdAt)
         VALUES (?, 'Initial Stock', ?, 'Initial entry', ?, datetime('now'))`,
        [this.lastID, quantity, userId]
      );

      res.json({ message: "Item added", itemId: this.lastID });
    }
  );
});

// Update inventory (stock adjustment)
router.post("/adjust/:id", auth("Manager"), (req, res) => {
  const { quantity, reason } = req.body;
  const userId = req.user.id;

  db.get("SELECT quantity FROM inventory WHERE id = ?", [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Item not found" });

    const newQuantity = row.quantity + quantity;

    db.run(
      "UPDATE inventory SET quantity = ?, lastUpdated = datetime('now'), updatedBy = ? WHERE id = ?",
      [newQuantity, userId, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Log transaction
        db.run(
          `INSERT INTO inventory_transactions (inventoryId, transactionType, quantity, reason, processedBy, createdAt)
           VALUES (?, 'Adjustment', ?, ?, ?, datetime('now'))`,
          [req.params.id, quantity, reason, userId]
        );

        res.json({ message: "Inventory updated", newQuantity });
      }
    );
  });
});

// Get low stock items
router.get("/low-stock", auth("Manager"), (req, res) => {
  db.all(
    "SELECT * FROM inventory WHERE quantity <= minQuantity OR quantity < 10",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get inventory transactions
router.get("/:id/transactions", auth("Manager"), (req, res) => {
  db.all(
    `SELECT it.*, u.name as processedByName
     FROM inventory_transactions it
     JOIN users u ON it.processedBy = u.id
     WHERE it.inventoryId = ?
     ORDER BY it.createdAt DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get inventory analytics
router.get("/analytics/summary", auth("Manager"), (req, res) => {
  const analytics = {};

  db.get("SELECT COUNT(*) as count FROM inventory", (err, row) => {
    analytics.totalItems = row?.count || 0;

    db.get("SELECT COUNT(*) as count FROM inventory WHERE quantity <= minQuantity", (err, row) => {
      analytics.lowStockItems = row?.count || 0;

      db.get("SELECT SUM(quantity * unitPrice) as value FROM inventory", (err, row) => {
        analytics.totalValue = row?.value || 0;

        db.all(
          "SELECT category, COUNT(*) as count, SUM(quantity) as total FROM inventory GROUP BY category",
          (err, rows) => {
            analytics.byCategory = rows || [];
            res.json(analytics);
          }
        );
      });
    });
  });
});

module.exports = router;
