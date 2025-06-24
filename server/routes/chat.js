const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ room: roomId }).populate('sender');
  res.json(messages);
});

module.exports = router;
