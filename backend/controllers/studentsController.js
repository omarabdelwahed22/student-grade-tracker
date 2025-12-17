const Student = require('../models/studentModel');

exports.createStudent = async (req, res) => {
  try {
    const { name, email, grades } = req.body;
    const student = new Student({ name, email, grades });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    // Duplicate key handled by global error handler if re-thrown
    if (err && err.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    res.status(400).json({ message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    // Pagination: ?page=1&limit=20
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find().skip(skip).limit(limit).lean(),
      Student.countDocuments()
    ]);
    res.json({ data: students, meta: { total, page, limit } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid ID' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const updates = req.body;
    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid ID' });
  }
};
