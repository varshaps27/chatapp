console.log("✅ Script loaded");
const socket = io("http://localhost:5000");

let username, roomId;

const loginBtn = document.getElementById("loginBtn");
const messageInput = document.getElementById("messageInput");
const loginForm = document.getElementById("loginForm");
const chatBox = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");
const typingDiv = document.getElementById("typing");
const usersDiv = document.getElementById("users");
const privateChatBox = document.getElementById("privateChat");

loginBtn.onclick = async () => {
  username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  roomId = document.getElementById("room").value.trim();

  if (!username || !password || !roomId) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  loginForm.classList.add("hidden");
  chatBox.classList.remove("hidden");

  socket.emit("joinRoom", { roomId, username });
  socket.emit("login", { username });

  console.log("✅ Logged in and joined room:", roomId);
};

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && messageInput.value.trim()) {
    const msg = messageInput.value.trim();
    socket.emit("sendMessage", { roomId, message: msg, username });
    messageInput.value = "";
  } else {
    socket.emit("typing", { roomId, username });
  }
});


socket.on("receiveMessage", (msg) => {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${msg.sender}</strong>: ${msg.content}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});


socket.on("typing", (user) => {
  typingDiv.innerText = `${user} is typing...`;
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    typingDiv.innerText = "";
  }, 2000);
});


socket.on("chatHistory", (msgs) => {
  messagesDiv.innerHTML = "";
  msgs.forEach((msg) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${msg.sender}</strong>: ${msg.content}`;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});


socket.on("userList", (userList) => {
  usersDiv.innerHTML = "";
  userList
    .filter((u) => u.username !== username)
    .forEach((u) => {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 m-1 rounded text-sm";
      btn.innerText = u.username;
      btn.onclick = () => openPrivateChat(u.username);
      usersDiv.appendChild(btn);
    });
});


function openPrivateChat(receiver) {
  const existing = document.getElementById(`private-${receiver}`);
  if (existing) return;

  const chatWindow = document.createElement("div");
  chatWindow.id = `private-${receiver}`;
  chatWindow.className = "bg-white text-black rounded p-2 m-2";
  chatWindow.innerHTML = `
    <div class="font-bold">${receiver} <button class="float-right text-red-500" onclick="closeChat('${receiver}')">x</button></div>
    <div class="messages h-32 overflow-y-scroll mb-2" id="private-msgs-${receiver}"></div>
    <input class="w-full p-1 border rounded text-black" placeholder="Type and press Enter" 
      onkeypress="sendPrivate(event, '${receiver}')" />
  `;
  privateChatBox.appendChild(chatWindow);
}


function closeChat(receiver) {
  const el = document.getElementById(`private-${receiver}`);
  if (el) el.remove();
}


function sendPrivate(e, receiver) {
  if (e.key === "Enter" && e.target.value.trim()) {
    const msg = e.target.value.trim();
    socket.emit("privateMessage", {
      toUsername: receiver,
      fromUsername: username,
      message: msg,
    });

    const container = document.getElementById(`private-msgs-${receiver}`);
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<strong>You</strong>: ${msg}`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    e.target.value = "";
  }
}

socket.on("receivePrivateMessage", (msg) => {
  openPrivateChat(msg.fromUsername);
  const container = document.getElementById(`private-msgs-${msg.fromUsername}`);
  const msgDiv = document.createElement("div");
  msgDiv.innerHTML = `<strong>${msg.fromUsername}</strong>: ${msg.message}`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
});

