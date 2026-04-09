const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.put('/:id/read', ctrl.markRead);
router.put('/mark-all-read', ctrl.markAllRead);

module.exports = router;
