const Assignment = require('../models/assignmentModel');
const Course = require('../models/courseModel');
const Notification = require('../models/notificationModel');
const Student = require('../models/studentModel');

// Create assignment (Instructor only)
const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, category, maxScore, weight } = req.body;

    // Verify course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      instructor: req.user.id,
      dueDate,
      category: category || 'Homework',
      maxScore: maxScore || 100,
      weight: weight || 10
    });

    // Notify all enrolled students
    const students = await Student.find({ courses: courseId });
    const notifications = students.map(student => ({
      recipient: student.user,
      type: 'assignment',
      title: 'New Assignment',
      message: `New assignment "${title}" has been posted in ${course.name}`,
      relatedId: assignment._id,
      relatedModel: 'Assignment',
      priority: 'normal'
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await assignment.populate('course');
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments for a course
const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student || !student.courses.includes(courseId)) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
    }

    const assignments = await Assignment.find({ course: courseId })
      .sort({ dueDate: 1 })
      .populate('course');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming assignments (Student)
const getUpcomingAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const assignments = await Assignment.find({
      course: { $in: student.courses },
      dueDate: { $gte: now, $lte: oneWeekFromNow },
      status: 'pending'
    })
      .sort({ dueDate: 1 })
      .populate('course');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update assignment (Instructor only)
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(assignment, req.body);
    await assignment.save();
    await assignment.populate('course');

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete assignment (Instructor only)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getUpcomingAssignments,
  updateAssignment,
  deleteAssignment
};
