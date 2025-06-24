const Message = require("../models/Message");


const getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const saveMessage = async (req, res) => {
  const { roomId, sender, content } = req.body;

  if (!roomId || !sender || !content) {
    return res.status(400).json({ error: "roomId, sender, and content are required" });
  }

  try {
    const newMessage = new Message({ roomId, sender, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
};

module.exports = {
  getMessagesByRoom,
  saveMessage,
};
