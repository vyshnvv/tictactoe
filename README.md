# 🕹️ Real-Time TicTacToe Web App

A real-time, multiplayer TicTacToe game built using the **MERN stack** and **Socket.IO**. Users can register, log in, challenge other users in real-time, and track their gameplay statistics like win rate and total games played.

---

## 🚀 Features

- ✅ **User Authentication** – Sign up and log in with secure JWT tokens
- 👥 **Challenge Other Users** – See online users and initiate games
- 🔄 **Real-Time Gameplay** – Instant interaction via Socket.IO
- 📊 **Gameplay Stats** – Tracks games played, wins, and calculates win rate
- ☁️ **MongoDB Atlas** – Cloud-hosted database

---

## 🧰 Technologies Used

### Frontend
- [React.js](https://reactjs.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vyshnvv/tictactoe-web-app
cd tictactoe-web-app
```
### 2. Install Dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 3. Set Up Environment Variables
Create a .env file inside the server/ directory with the following content:

```bash
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```
Replace ```your_mongodb_atlas_connection_string``` and ```your_jwt_secret_key``` with actual values.
Use ```openssl rand -base64 32``` to create a JWT secret or provide a random string.


### 4. Build the App
From the root directory:

```bash
npm run build
```

### 5. Start Development Servers

Backend (Express + Socket.IO)
```bash
cd server
npm run dev
```

Frontend (React)
```bash
cd client
npm run dev
```


## 🌐 Live Demo

[https://tictactoe-f147.onrender.com](https://tictactoe-ptmq.onrender.com)


