const User = require('../models/userModel');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ students });
  } catch (err) {
    next(err);
  }
};

exports.getInstructors = async (req, res, next) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('-password');
    res.json({ instructors });
  } catch (err) {
    next(err);
  }
};
