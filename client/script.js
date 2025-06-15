const socket = io("http://localhost:5000");
let userId;

document.getElementById("loginBtn").onclick = async () => {
  const username = document.getElementById("username").value;

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();
  userId = data.user._id;
  socket.emit("login", { userId });

  document.getElementById("chat").classList.remove("hidden");
};

document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    socket.emit("send-message", {
      content: e.target.value,
      room: "general",
      private: false,
    });
    e.target.value = "";
  } else {
    socket.emit("typing", "general");
  }
});

socket.on("new-message", msg => {
  const msgBox = document.getElementById("messages");
  msgBox.innerHTML += `<div><strong>${msg.sender}</strong>: ${msg.content}</div>`;
  msgBox.scrollTop = msgBox.scrollHeight;
});

socket.on("typing", userId => {
  console.log(`${userId} is typing...`);
});
