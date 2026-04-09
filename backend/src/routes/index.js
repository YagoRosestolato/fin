const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/transactions', require('./transaction.routes'));
router.use('/users', require('./user.routes'));
router.use('/notifications', require('./notification.routes'));

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
