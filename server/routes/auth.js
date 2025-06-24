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
/*const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const users = req.body.users;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: "Provide array of users" });
  }
  try {
    const created = [];
    for (let u of users) {
      const { username, password } = u;
      if (!username || !password) continue;
      if (!(await User.findOne({ username }))) {
        const usr = await User.create({ username, password });
        created.push(usr);
      }
    }
    res.status(201).json({ message: "Users registered", users: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }
  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({ username, password });
    } else if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
*/