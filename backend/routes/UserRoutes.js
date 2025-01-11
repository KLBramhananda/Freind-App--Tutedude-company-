const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Add bcrypt for password hashing
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, "your_jwt_secret", {
    expiresIn: "1h",
  });
};

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists, please try to login!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = generateToken(newUser);
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Error saving user. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email does not exist. Please check once!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare hashed passwords
    if (!isPasswordValid) {
      console.log("Password mismatch:", password, user.password); // Log the passwords for debugging
      return res.status(401).json({
        message: "Password is Incorrect! Please check once!",
      });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "An error occurred during login. Please try again.",
    });
  }
});

router.post("/friend-request", authenticateToken, async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(userId);
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }
    user.friendRequests.push(friend._id);
    await user.save();
    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending friend request" });
  }
});

router.get("/friend-requests", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friendRequests");
    res.json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friend requests" });
  }
});

router.post("/accept-request", authenticateToken, async (req, res) => {
  const { requestId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(requestId);
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }
    user.friends.push(friend._id);
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requestId
    );
    await user.save();
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting friend request" });
  }
});

router.post("/reject-request", authenticateToken, async (req, res) => {
  const { requestId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requestId
    );
    await user.save();
    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting friend request" });
  }
});

router.get("/friends", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends");
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friends" });
  }
});

router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recommendations = await User.find({
      _id: { $ne: user._id, $nin: user.friends },
    });
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

router.put("/friends/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  try {
    const friend = await User.findById(id);
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }
    friend.username = name;
    friend.age = age;
    friend.email = email;
    await friend.save();
    res.status(200).json({ message: "Friend updated successfully" });
  } catch (error) {
    console.error("Error updating friend:", error);
    res.status(500).json({ message: "Error updating friend" });
  }
});

router.delete("/friends/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.friends = user.friends.filter((friendId) => friendId.toString() !== id);
    await user.save();
    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ message: "Error deleting friend" });
  }
});

module.exports = router;
