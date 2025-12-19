const Notification = require('../models/notificationModel');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { recipient: req.user.id };
    
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
