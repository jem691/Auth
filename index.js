const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// MongoDB Atlas কানেকশন (ফ্রী টিয়ার)
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mongodb.net/authdb?retryWrites=true&w=majority');

// User মডেল
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  subscription: { type: String, default: 'Free' },
  expiry: Date,
  hwid: String
});
const User = mongoose.model('User', UserSchema);

// লগিন এন্ডপয়েন্ট
app.get('/api/login', async (req, res) => {
  const { username, pass, hwid } = req.query;

  try {
    const user = await User.findOne({ username, password: pass });
    
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // HWID চেক
    if (user.hwid && user.hwid !== hwid) {
      return res.json({ success: false, message: "Device not authorized" });
    }

    // প্রথম লগিনে HWID সেট
    if (!user.hwid) {
      user.hwid = hwid;
      await user.save();
    }

    res.json({
      success: true,
      code: 68,
      message: "Logged in!",
      username: user.username,
      subscription: user.subscription,
      expiry: user.expiry || ""
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
