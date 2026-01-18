const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./database");

const app = express();

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
