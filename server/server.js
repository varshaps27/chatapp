require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");

const authRoutes = require("./routes/auth");
const socketHandler = require("./socket");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

socketHandler(io);

server.listen(5000, () => console.log("Server running on port 5000"));
