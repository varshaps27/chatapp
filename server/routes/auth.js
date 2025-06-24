const express = require("express");
const router = express.Router();
const User = require("../models/User");


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "All fields required" });

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username, password });
  } else if (user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.status(200).json({ user });
});

module.exports = router;
