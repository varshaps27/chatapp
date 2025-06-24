require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

mongoose.connect(process.env.MONGO_URI, {
  tls: true,
  tlsInsecure: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

let onlineUsers = {};
let users = {};

io.on("connection", (socket) => {
  socket.on("login", ({ userId, username }) => {
    users[socket.id] = { userId, username };
    io.emit("userList", Object.values(users)); 
  
  });
  

  socket.on("privateMessage", ({ toUsername, message, fromUsername }) => {
    const targetSocket = Object.entries(users).find(([_, u]) => u.username === toUsername);
    if (targetSocket) {
      const targetSocketId = targetSocket[0];
      io.to(targetSocketId).emit("receivePrivateMessage", {
        fromUsername,
        message,
        timestamp: new Date(),
      });
    }
  });

  socket.on("joinRoom", async ({ roomId, username }) => {
    socket.join(roomId);
    onlineUsers[socket.id] = username;

    const history = await Message.find({ roomId }).sort({ timestamp: 1 });
    socket.emit("chatHistory", history);

    io.to(roomId).emit("userJoined", `${username} joined ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, message, username }) => {
    const msgData = { roomId, sender: username, content: message };
    await Message.create(msgData);
    io.to(roomId).emit("receiveMessage", msgData);
  });

  socket.on("typing", ({ roomId, username }) => {
    socket.broadcast.to(roomId).emit("typing", username);
  });

  socket.on("disconnect", () => {
    const user = onlineUsers[socket.id];
    delete users[socket.id];
    io.emit("userList", Object.values(users));
    delete onlineUsers[socket.id];
    console.log("🔴 Disconnected:", user);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
/*require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");


mongoose.connect(process.env.MONGO_URI || "mongodb+srv://psvarsha27082005:pXFmFpp1fh40D0gb@cluster0.yck3upb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => console.log("✅ MongoDB Connected"))
  .catch(console.error);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    io.to(roomId).emit("userJoined", `${username} joined "${roomId}"`);
    console.log(`${username} → ${roomId}`);
  });

  socket.on("sendMessage", ({ roomId, username, message }) => {
    console.log(`📨 Message from ${username} in ${roomId}: ${message}`);
    io.to(roomId).emit("receiveMessage", {
      username,
      message,
      timestamp: new Date(),
    });
});

  socket.on("typing", ({ roomId, username }) => {
    socket.broadcast.to(roomId).emit("typing", username);
  });

  socket.on("disconnect", () => console.log(`🔴 Disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
*/