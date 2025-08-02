# Notakok - File Management System

A full-stack web application for managing, storing, and sharing files, built with the MERN stack.

## Features

- Secure user authentication (Register, Login, Email Verification, Password Reset).
- Hierarchical folder system.
- File and folder management (Create, Upload, Rename, Move, Delete).
- Collaboration: Share folders with other users with viewer/editor roles.
- Password protection for folders.
- Grid and List view with sorting and filtering capabilities.
- Details panel for selected items.

## Tech Stack

**Backend:**
- Node.js, Express.js
- MongoDB, Mongoose
- JSON Web Tokens (JWT) for authentication
- Bcrypt.js for password hashing
- Nodemailer for sending emails
- Multer for file uploads

**Frontend:**
- React.js (with Vite)
- React Router for navigation
- Axios for API requests
- TailwindCSS for styling
- `react-hot-toast` for notifications
- `lucide-react` for icons

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mariam168/notakok.git
    cd notakok
    ```

2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    # Create a .env file and add your variables (MONGO_URI, JWT_SECRET, etc.)
    node index.js
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../client
    npm install
    # Create a .env file and add REACT_APP_API_BASE_URL
    npm start
    ```

The application will be available at `http://localhost:5173`.