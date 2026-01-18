const nodemailer = require('nodemailer');

// Configure your SMTP settings here
// For testing, using Gmail SMTP (requires app-specific password)
// Or use Mailtrap, Sendgrid, or any other SMTP service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Function to send email
async function sendEmail(to, subject, htmlContent, textContent = '') {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'office-automation@company.com',
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // fallback to plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Function to send task assignment email
async function sendTaskAssignmentEmail(assigneeName, assigneeEmail, taskTitle, taskDescription, assignedBy) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">New Task Assigned to You</h2>
      <p>Hi <strong>${assigneeName}</strong>,</p>
      <p>You have been assigned a new task:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">${taskTitle}</h3>
        <p><strong>Description:</strong> ${taskDescription}</p>
        <p><strong>Assigned by:</strong> ${assignedBy}</p>
        <p><strong>Assigned on:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Please log in to the office automation system to view and update the task status.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  return await sendEmail(assigneeEmail, `New Task Assignment: ${taskTitle}`, htmlContent);
}

// Function to send help desk ticket response email
async function sendTicketResponseEmail(requesterName, requesterEmail, ticketId, ticketTitle, response, respondedBy) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Help Desk Ticket Update</h2>
      <p>Hi <strong>${requesterName}</strong>,</p>
      <p>There's an update on your help desk ticket:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> #${ticketId}</p>
        <h3 style="margin-top: 0; color: #333;">${ticketTitle}</h3>
        <p><strong>Update:</strong></p>
        <p>${response}</p>
        <p><strong>Updated by:</strong> ${respondedBy}</p>
        <p><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Log in to view the full ticket details and provide any additional information if needed.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  return await sendEmail(requesterEmail, `Help Desk Update - Ticket #${ticketId}`, htmlContent);
}

// Function to send leave request email
async function sendLeaveRequestEmail(requesterName, requesterEmail, leaveType, startDate, endDate, managerName, managerEmail) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Leave Request Submitted</h2>
      <p>Hi <strong>${managerName}</strong>,</p>
      <p><strong>${requesterName}</strong> has submitted a leave request for your approval:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Leave Type:</strong> ${leaveType}</p>
        <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Please log in to the office automation system to approve or reject this leave request.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  return await sendEmail(managerEmail, `Leave Request from ${requesterName}`, htmlContent);
}

// Function to send approval request email
async function sendApprovalRequestEmail(approverName, approverEmail, requestType, requestDetails, requesterName) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Approval Request</h2>
      <p>Hi <strong>${approverName}</strong>,</p>
      <p><strong>${requesterName}</strong> has requested your approval:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">${requestType}</h3>
        <p>${requestDetails}</p>
        <p><strong>Requested on:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Please log in to the office automation system to review and approve or reject this request.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  return await sendEmail(approverEmail, `Approval Request: ${requestType}`, htmlContent);
}

// Function to send reminder email
async function sendReminderEmail(recipientName, recipientEmail, reminderText, dueDate) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Reminder</h2>
      <p>Hi <strong>${recipientName}</strong>,</p>
      <p>This is a reminder:</p>
      <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">${reminderText}</p>
        ${dueDate ? `<p style="margin: 10px 0 0 0; color: #666;"><strong>Due:</strong> ${new Date(dueDate).toLocaleString()}</p>` : ''}
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  return await sendEmail(recipientEmail, 'Reminder', htmlContent);
}

module.exports = {
  sendEmail,
  sendTaskAssignmentEmail,
  sendTicketResponseEmail,
  sendLeaveRequestEmail,
  sendApprovalRequestEmail,
  sendReminderEmail
};
