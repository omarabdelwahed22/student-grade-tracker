const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

exports.register = async (req, res, next) => {
  try {
    const { email, password, role, name, studentId } = req.body;

    const normalizedName = name ? name.trim() : '';
    const normalizedStudentId = studentId ? studentId.trim().toUpperCase() : undefined;
    const studentIdRegex = /^\d{9}$/;

    if (!normalizedName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (role === 'student' && !normalizedStudentId) {
      return res.status(400).json({ message: 'studentId is required for students' });
    }

    if (normalizedStudentId && !studentIdRegex.test(normalizedStudentId)) {
      return res.status(400).json({ message: 'studentId must be exactly 9 digits' });
    }

    if (normalizedStudentId) {
      const existingStudentId = await User.findOne({ studentId: normalizedStudentId });
      if (existingStudentId) {
        return res.status(409).json({ message: 'studentId must be unique' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hash,
      role,
      name: normalizedName,
      studentId: normalizedStudentId
    });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        studentId: user.studentId
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        studentId: user.studentId
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        studentId: user.studentId
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
