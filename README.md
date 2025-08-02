# Notakok - Full-Stack File Management System

A modern, secure web application for storing, organizing, and sharing your files, built with the MERN stack. This project features a rich user interface inspired by services like Google Drive, with a focus on performance and usability.

*(Tip: Add a high-quality screenshot or GIF of your application here!)*

---

## ✨ Core Features

- **Secure Authentication:** Complete user lifecycle management including registration with email verification (via Nodemailer), JWT-based login, and password reset functionality.
- **Hierarchical File System:** Intuitive interface for creating and navigating through nested folders.
- **Rich File Management:** Full CRUD operations for files and folders (Create, Upload, Rename, Move, Soft Delete/Restore).
- **Dual Layout System:** Users can instantly switch between a visual **Grid View** and a detailed **List View**.
- **Advanced Controls:** Sort content by name, date, or size, and filter by file type (images, documents, etc.).
- **Collaboration:** Share folders with other registered users and assign `viewer` or `editor` roles.
- **Enhanced Security:** Protect sensitive folders with individual passwords.
- **Interactive Dashboard:** A beautiful UI with a details panel that provides properties for any selected item.

---

## 🛠️ Tech Stack & Architecture

### **Backend**
- **Runtime/Framework:** Node.js, Express.js
- **Database:** MongoDB with Mongoose for elegant object data modeling.
- **Authentication:** JSON Web Tokens (JWT) for stateless sessions and `bcrypt.js` for secure password hashing.
- **File Handling:** `Multer` for efficient handling of multipart/form-data (file uploads).
- **API:** A well-structured RESTful API with a modular controller/service architecture.

### **Frontend**
- **Library/Framework:** React.js (bootstrapped with Vite for a fast development experience).
- **Routing:** `React Router` for declarative, client-side routing.
- **Styling:** `TailwindCSS` for a utility-first, modern design system.
- **API Communication:** `Axios` with a centralized service layer for clean and reusable API requests.
- **User Feedback:** `react-hot-toast` for professional, non-blocking notifications.
- **Icons:** `lucide-react` for a beautiful and consistent icon set.

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB installed and running locally on its default port.
- A Gmail account with an **App Password** enabled for sending emails (Google no longer supports less secure apps).

### 1. Clone the Repository
```bash
git clone https://github.com/mariam186/notakok.git
cd notakok
```

### 2. Setup the Backend
Navigate to the server directory and install dependencies.
```bash
cd server
npm install
```
Next, create your local environment file by copying the example:
```bash
cp .env.example .env
```
Now, open the new `.env` file and fill in your variables (your MongoDB connection string, a strong JWT secret, and your Gmail credentials).

Finally, start the backend server:
```bash
node index.js
```
The server will be running on `http://localhost:5000`.

### 3. Setup the Frontend
Open a **new terminal window** and navigate to the client directory.
```bash
cd client
npm install
```
Next, create your local environment file:
```bash
cp .env.example .env
```
The `VITE_API_BASE_URL` variable inside is already configured for local development.

Finally, start the React development server:
```bash
npm start
```
The application will be running at `http://localhost:5173`.