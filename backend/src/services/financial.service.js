const { PrismaClient } = require('@prisma/client');
const { getDaysInMonth } = require('date-fns');

const prisma = new PrismaClient();

const getFinancialSummary = async (userId, month, year) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });

  // Use monthly config if the user has filled it in for this month
  const monthlyConfig = await prisma.monthlyConfig.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  const hasMonthlyConfig = !!monthlyConfig;
  const salary = monthlyConfig ? monthlyConfig.salary : 0;
  const savingsGoal = monthlyConfig ? monthlyConfig.savingsGoal : user.savingsGoal;
  const paymentDay = monthlyConfig ? monthlyConfig.paymentDay : user.paymentDay;
  const savedAmount = hasMonthlyConfig ? (salary * savingsGoal) / 100 : 0;

  const transactions = await prisma.transaction.findMany({
    where: { userId, referenceMonth: month, referenceYear: year },
    orderBy: { date: 'desc' },
  });

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const availableBalance = hasMonthlyConfig ? salary - savedAmount - totalSpent : -totalSpent;

  const now = new Date();
  const isCurrentMonth = now.getMonth() + 1 === month && now.getFullYear() === year;

  let dailyBudget = 0;
  let daysRemaining = 0;

  if (isCurrentMonth && hasMonthlyConfig) {
    const today = now.getDate();

    if (today <= paymentDay) {
      daysRemaining = paymentDay - today;
    } else {
      const daysInMonth = getDaysInMonth(now);
      daysRemaining = daysInMonth - today + paymentDay;
    }

    if (daysRemaining > 0 && availableBalance > 0) {
      dailyBudget = availableBalance / daysRemaining;
    }
  }

  const spendingByCategory = transactions.reduce((acc, t) => {
    const cat = t.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const spendingByType = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {});

  return {
    salary,
    savingsGoal,
    savedAmount,
    totalSpent,
    availableBalance,
    safetyAmount: user.safetyAmount,
    isBelowSafety: hasMonthlyConfig && availableBalance < user.safetyAmount,
    dailyBudget,
    daysRemaining,
    paymentDay,
    spendingByCategory,
    spendingByType,
    transactionCount: transactions.length,
    hasMonthlyConfig,
    monthlyConfig: monthlyConfig
      ? { salary: monthlyConfig.salary, savingsGoal: monthlyConfig.savingsGoal, paymentDay: monthlyConfig.paymentDay }
      : null,
  };
};

const getMonthlySavingsHistory = async (userId) => {
  // Only months where user explicitly configured their salary
  const configs = await prisma.monthlyConfig.findMany({
    where: { userId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  const results = await Promise.all(configs.map(async (cfg) => {
    const agg = await prisma.transaction.aggregate({
      where: { userId, referenceMonth: cfg.month, referenceYear: cfg.year },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalSpent = agg._sum.amount || 0;
    const savedAmount = (cfg.salary * cfg.savingsGoal) / 100;

    return {
      month: cfg.month,
      year: cfg.year,
      salary: cfg.salary,
      savingsGoal: cfg.savingsGoal,
      paymentDay: cfg.paymentDay,
      totalSpent,
      transactionCount: agg._count.id,
      savedAmount,
      balance: cfg.salary - savedAmount - totalSpent,
    };
  }));

  return results;
};

const upsertMonthlyConfig = async (userId, { month, year, salary, savingsGoal, paymentDay }) => {
  return prisma.monthlyConfig.upsert({
    where: { userId_month_year: { userId, month, year } },
    create: { userId, month, year, salary, savingsGoal, paymentDay },
    update: { salary, savingsGoal, paymentDay },
  });
};

const getMonthlyConfig = async (userId, month, year) => {
  return prisma.monthlyConfig.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });
};

const getDailySpending = async (userId, month, year) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId, referenceMonth: month, referenceYear: year },
    select: { date: true, amount: true, name: true, category: true },
    orderBy: { date: 'asc' },
  });

  const byDay = transactions.reduce((acc, t) => {
    const day = new Date(t.date).getDate();
    if (!acc[day]) acc[day] = { day, total: 0, transactions: [] };
    acc[day].total += t.amount;
    acc[day].transactions.push(t);
    return acc;
  }, {});

  return Object.values(byDay);
};

module.exports = { getFinancialSummary, getMonthlySavingsHistory, getDailySpending, upsertMonthlyConfig, getMonthlyConfig };
