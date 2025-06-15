const Message = require("./models/Message");
const User = require("./models/User");

let onlineUsers = {};

function socketHandler(io) {
  io.on("connection", socket => {
    let currentUser = null;

    socket.on("login", async ({ userId }) => {
      currentUser = userId;
      onlineUsers[userId] = socket.id;
      io.emit("online-users", Object.keys(onlineUsers));
    });

    socket.on("join-room", room => {
      socket.join(room);
    });

    socket.on("typing", room => {
      socket.to(room).emit("typing", currentUser);
    });

    socket.on("send-message", async ({ content, room, toUserId, private }) => {
      const message = await Message.create({
        content,
        sender: currentUser,
        room,
        private,
        to: private ? toUserId : null,
      });

      if (private && toUserId in onlineUsers) {
        socket.to(onlineUsers[toUserId]).emit("new-message", message);
      } else {
        io.to(room).emit("new-message", message);
      }
    });

    socket.on("disconnect", () => {
      delete onlineUsers[currentUser];
      io.emit("online-users", Object.keys(onlineUsers));
    });
  });
}

module.exports = socketHandler;
