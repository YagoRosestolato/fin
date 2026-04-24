const userService = require('../services/user.service');
const financialService = require('../services/financial.service');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();
    const summary = await financialService.getFinancialSummary(req.user.id, month, year);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

const getSavingsHistory = async (req, res, next) => {
  try {
    const history = await financialService.getMonthlySavingsHistory(req.user.id);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

const getDailySpending = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();
    const data = await financialService.getDailySpending(req.user.id, month, year);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const upsertMonthlyConfig = async (req, res, next) => {
  try {
    const { month, year, salary, savingsGoal, paymentDay } = req.body;
    const config = await financialService.upsertMonthlyConfig(req.user.id, {
      month: parseInt(month),
      year: parseInt(year),
      salary: parseFloat(salary),
      savingsGoal: parseFloat(savingsGoal),
      paymentDay: parseInt(paymentDay),
    });
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

const getMonthlyConfig = async (req, res, next) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    const config = await financialService.getMonthlyConfig(req.user.id, month, year);
    res.json({ success: true, data: config || null });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id);
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Conta excluída com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getSummary, getSavingsHistory, getDailySpending, upsertMonthlyConfig, getMonthlyConfig, deleteAccount };
