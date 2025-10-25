# Backend Server & Database Project
# Overview

This project is a backend server built with Node.js, Express, and MongoDB.
It includes user authentication using JWT and bcryptjs, environment configuration via dotenv, and request handling middleware such as cookie-parser.

# Technologies Used

- Node.js (Runtime Environment)

- Express.js (Web Framework)

- MongoDB + Mongoose (Database & ODM)

- JWT (Authentication)

- bcryptjs (Password Hashing)

- dotenv (Environment Variables)

- cookie-parser (Cookie Management)

# Setup & Run Instructions
1. Clone the Repository
git clone <your-repo-link>

2. Install Dependencies
npm install

3. Configure Environment Variables

Create a file named .env in the project root with the following:

- PORT=5000
- MONGO_URI=mongodb+srv://<your-cluster-url>
- JWT_SECRET=your_jwt_secret_key

4. Run the Server

Run in development mode (with auto-restart via nodemon):

- npm run dev


or run normally:

node server.js
