const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    const token = generateToken(user)
    // res.status(201).redirect('/admin/user/dashboard')
    res.status(201).json({
      message: "User created & logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    if (!email) return res.status(400).json({ message: "Email is required" })
    if (!password) return res.status(400).json({ message: "Password is required" })

    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ message: "User does not exist" })
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if(!isMatch) return res.status(400).json({message: "Invalid Password"})

    const token = generateToken(existingUser)
    // res.status(201).redirect('/admin/user/dashboard')
    res.status(201).json({
      message: "User Logged In Successfully",
      user: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

