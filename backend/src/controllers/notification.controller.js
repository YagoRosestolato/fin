const notificationService = require('../services/notification.service');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await notificationService.getAll(req.user.id, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, markRead, markAllRead };
