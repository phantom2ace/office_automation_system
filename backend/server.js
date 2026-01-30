const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./database");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins their own room based on userId
  socket.on("join_room", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  // Send Message
  socket.on("send_message", (data) => {
    // data: { senderId, receiverId, content }
    const { senderId, receiverId, content } = data;
    
    // Save to Database
    db.run(
      `INSERT INTO messages (senderId, receiverId, content, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [senderId, receiverId, content],
      function (err) {
        if (err) {
          console.error("Error saving message:", err);
          return;
        }
        
        const messageId = this.lastID;
        const messageData = { ...data, id: messageId, timestamp: new Date().toISOString() };

        // Emit to Receiver
        io.to(receiverId.toString()).emit("receive_message", messageData);
        
        // Emit back to Sender (for confirmation/UI update if needed, though optimistic UI is better)
        io.to(senderId.toString()).emit("message_sent", messageData);
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const messageRoutes = require("./routes/messages");
const docRoutes = require("./routes/documents");
const analyticsRoutes = require("./routes/analytics");
const eventsRoutes = require("./routes/events");
const financeRoutes = require("./routes/finance");
const inventoryRoutes = require("./routes/inventory");
const notificationsRoutes = require("./routes/notifications");
const workflowRoutes = require("./routes/workflow");
const calendarRoutes = require("./routes/calendar");
const remindersRoutes = require("./routes/reminders");
const leavesRoutes = require("./routes/leaves");
const resourcesRoutes = require("./routes/resources");
const performanceRoutes = require("./routes/performance");
const approvalsRoutes = require("./routes/approvals");
const employeesRoutes = require("./routes/employees");
const helpDeskRoutes = require("./routes/helpdesk");
const usersRoutes = require("./routes/users");
const automationRoutes = require("./routes/automation");
const documentVersionRoutes = require("./routes/document-versions");
const payrollRoutes = require("./routes/payroll");
const salesRoutes = require("./routes/sales");
const settingsRoutes = require("./routes/settings");
const knowledgeBaseRoutes = require("./routes/knowledgebase");
const feedbackRoutes = require("./routes/feedback");

app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/leaves", leavesRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/approvals", approvalsRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/helpdesk", helpDeskRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/automation", automationRoutes.router);
app.use("/api/documents/versions", documentVersionRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/knowledge-base", knowledgeBaseRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
