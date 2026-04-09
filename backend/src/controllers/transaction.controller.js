const transactionService = require('../services/transaction.service');
const notificationService = require('../services/notification.service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const create = async (req, res, next) => {
  try {
    const tx = await transactionService.create(req.user.id, req.body);
    await notificationService.checkAndNotify(req.user.id);
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

const findAll = async (req, res, next) => {
  try {
    const result = await transactionService.findAll(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const findOne = async (req, res, next) => {
  try {
    const tx = await transactionService.findById(req.params.id, req.user.id);
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const tx = await transactionService.update(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleteAll = req.query.deleteAll === 'true';
    const result = await transactionService.remove(req.params.id, req.user.id, deleteAll);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const importCSV = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Arquivo não fornecido' });
      }
      const csvData = req.file.buffer.toString('utf-8');
      const result = await transactionService.parseAndImportCSV(req.user.id, csvData);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },
];

const getCategories = async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const cats = await prisma.transaction.findMany({
      where: { userId: req.user.id, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    res.json({ success: true, data: cats.map(c => c.category) });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, findAll, findOne, update, remove, importCSV, getCategories };
