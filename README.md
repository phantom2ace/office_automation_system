# Office Automation System (OAS)

A comprehensive Office Automation System designed to streamline business operations including Task Management, Messaging, HR/Leaves, Finance, Inventory, and CRM.

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Real-time Communication:** Socket.io
- **Database:** SQLite (Local file-based database)
- **Authentication:** Custom Token-based Auth

## 🛠️ Setup & Installation

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed (v14+ recommended).
2.  **Clone/Download:** Navigate to the project folder.
3.  **Install Dependencies:**
    ```bash
    cd backend
    npm install
    ```
4.  **Start the Server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.
5.  **Access the App:** Open `frontend/index.html` (or `http://localhost:3000/index.html` if served statically) in your browser.

## ⚠️ Hosting Considerations

### SQLite & Serverless (Vercel, Netlify, etc.)
This project uses **SQLite**, which stores data in a local file (`office.db`).
- **Do NOT** host the backend on Vercel, Netlify Functions, or AWS Lambda directly if you need data persistence. These platforms have ephemeral file systems, meaning your database will be **reset/deleted** every time the server restarts or goes to sleep.
- **Recommended Hosting:** Use a VPS (DigitalOcean, Linode) or a Platform-as-a-Service that supports persistent disk storage (Render, Railway, Heroku with caveats).
- **For Vercel:** You would need to migrate the database from SQLite to a cloud database like **PostgreSQL (Supabase, Neon)** or **MySQL (PlanetScale)**.

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Admin, Manager, Employee roles.
- **Real-time Messaging:** Chat with colleagues instantly using Socket.io.
- **CRM / Sales:** Manage leads, customers, and deals with a Kanban board.
- **HR & Leaves:** Leave requests, approvals, and employee management.
- **Finance & Inventory:** Track expenses and stock levels.
- **Knowledge Base:** Internal FAQs and SOPs.
- **Audit Logs:** Track system changes for security.
