const User = require("../models/user.model")

exports.dashboard = async (req, res) => {
  try {
    // You can pass user data or any dashboard-specific data here
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user // Assuming you have user data from middleware
    });
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

exports.profile = async (req, res) => {
  try {
    res.render('profile', {
      title: 'Profile',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" })
  }
}

exports.settings = async (req, res) => {
  try {
    res.render('settings', {
      title: 'Settings',
      user: req.user
    });
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}
