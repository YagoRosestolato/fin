const router = require('express').Router();
const ctrl = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { transactionSchema, filterSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', validate(filterSchema, 'query'), ctrl.findAll);
router.post('/', validate(transactionSchema), ctrl.create);
router.get('/categories', ctrl.getCategories);
router.post('/import-csv', ctrl.importCSV);
router.get('/:id', ctrl.findOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
