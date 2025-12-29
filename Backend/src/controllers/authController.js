import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Semua field harus diisi' 
      });
    }

    // Check existing user
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        message: 'Email atau username sudah terdaftar' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'reader'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal mendaftar', 
      error: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email dan password harus diisi' 
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        message: 'Email atau password salah' 
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal login', 
      error: error.message 
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('readingHistory.novel', 'title slug cover')
      .populate('bookmarks.novel', 'title slug cover');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal mengambil data user', 
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal update profil', 
      error: error.message 
    });
  }
};
