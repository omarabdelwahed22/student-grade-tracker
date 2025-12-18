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
