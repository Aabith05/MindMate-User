import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";


// Optional: fallback JWT secret for development
const JWT_SECRET = process.env.JWT_SECRET || "mysecretdevkey";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const googleRegister = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user without password for Google sign-in
      user = await User.create({ email });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "Google registration/login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Google registration error:", err);
    res
      .status(500)
      .json({ message: "Server error during Google registration" });
  }
};

// ...existing code...
// ...existing code...
// ...existing code...
const login = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // require only email and password (don't require name for login)
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials (user not found)" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials (wrong password)" });
    }

    // award points + increment counters (existing logic)...
    try {
      await User.findByIdAndUpdate(user._id, {
        $inc: { "profile.totalLogins": 1, "profile.points": 2 },
        $push: {
          "profile.activities": {
            type: "login",
            title: "Successful login",
            time: new Date().toISOString(),
            points: 2,
          },
        },
      });
    } catch (e) {
      console.error("Failed to update login stats:", e);
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    const updatedUser = await User.findById(user._id).select("-password");

    res.json({ token, user: updatedUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
// ...existing code...
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current passowrd" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: "Password changed Succesfully" });
  } catch (err) {
    res.status(500).json({ message: "Missing user" });
  }
};
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

 const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: req.body },
      { new: true, select: "settings" }
    );
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ message: "Error updating settings" });
  }
};

const changeUserName = async (req, res) => {
  try {
    const { newUserName } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: newUserName,
      },
      { new: true }
    );
    res.status(200).json({message:"Username changed succeffully"});
  } catch (err) {
    res.status(500).json({ message: "Something is wrong" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("profile");
    res.json(user.profile);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile: req.body },
      { new: true, select: "profile" }
    );
    res.json(user.profile);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};




export default {
  register,
  login,
  googleRegister,
  changePassword,
  changeUserName,
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
};
