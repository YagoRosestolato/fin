const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateUserSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/profile', ctrl.getProfile);
router.put('/profile', validate(updateUserSchema), ctrl.updateProfile);
router.get('/summary', ctrl.getSummary);
router.get('/savings-history', ctrl.getSavingsHistory);
router.get('/daily-spending', ctrl.getDailySpending);
router.post('/monthly-config', ctrl.upsertMonthlyConfig);
router.get('/monthly-config', ctrl.getMonthlyConfig);
router.delete('/account', ctrl.deleteAccount);

module.exports = router;
