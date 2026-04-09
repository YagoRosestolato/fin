const { PrismaClient } = require('@prisma/client');
const { addMonths } = require('date-fns');

const prisma = new PrismaClient();

const AI_CATEGORIES = {
  alimentação: ['mercado', 'supermercado', 'restaurante', 'lanche', 'café', 'ifood', 'pizza', 'hamburger', 'comida', 'padaria'],
  transporte: ['uber', 'táxi', '99', 'combustível', 'gasolina', 'ônibus', 'metrô', 'estacionamento', 'pedágio'],
  saúde: ['farmácia', 'remédio', 'médico', 'consulta', 'hospital', 'academia', 'plano de saúde'],
  lazer: ['cinema', 'show', 'spotify', 'netflix', 'disney', 'teatro', 'jogo', 'bar', 'balada'],
  moradia: ['aluguel', 'condomínio', 'água', 'luz', 'energia', 'internet', 'telefone', 'gás'],
  vestuário: ['roupa', 'sapato', 'tênis', 'camisa', 'calça', 'vestido'],
  educação: ['curso', 'livro', 'faculdade', 'escola', 'material'],
  tecnologia: ['celular', 'computador', 'notebook', 'software', 'aplicativo'],
};

const autoCategorizeName = (name) => {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(AI_CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) {
      return category;
    }
  }
  return null;
};

const create = async (userId, data) => {
  const { name, amount, type, category, tags, notes, date, referenceMonth, referenceYear, isFixed, installments } = data;

  const autoCategory = category || autoCategorizeName(name);
  const txDate = date ? new Date(date) : new Date();

  if (type === 'INSTALLMENT' && installments && installments > 1) {
    const parent = await prisma.transaction.create({
      data: {
        userId, name, amount, type, category: autoCategory, tags, notes,
        date: txDate, referenceMonth, referenceYear, isFixed: false,
        installments, installmentNumber: 1,
      },
    });

    const children = [];
    for (let i = 2; i <= installments; i++) {
      const nextDate = addMonths(txDate, i - 1);
      children.push({
        userId,
        name: `${name} (${i}/${installments})`,
        amount,
        type,
        category: autoCategory,
        tags: tags || [],
        notes,
        date: nextDate,
        referenceMonth: nextDate.getMonth() + 1,
        referenceYear: nextDate.getFullYear(),
        isFixed: false,
        installments,
        installmentNumber: i,
        parentId: parent.id,
      });
    }

    await prisma.transaction.createMany({ data: children });
    await prisma.transaction.update({
      where: { id: parent.id },
      data: { name: `${name} (1/${installments})` },
    });

    return parent;
  }

  if (isFixed) {
    const tx = await prisma.transaction.create({
      data: {
        userId, name, amount, type, category: autoCategory, tags: tags || [], notes,
        date: txDate, referenceMonth, referenceYear, isFixed: true,
      },
    });

    const futureMonths = 11;
    const futures = [];
    for (let i = 1; i <= futureMonths; i++) {
      const nextDate = addMonths(txDate, i);
      futures.push({
        userId,
        name,
        amount,
        type,
        category: autoCategory,
        tags: tags || [],
        notes,
        date: nextDate,
        referenceMonth: nextDate.getMonth() + 1,
        referenceYear: nextDate.getFullYear(),
        isFixed: true,
        parentId: tx.id,
      });
    }
    await prisma.transaction.createMany({ data: futures });

    return tx;
  }

  return prisma.transaction.create({
    data: {
      userId, name, amount, type, category: autoCategory, tags: tags || [], notes,
      date: txDate, referenceMonth, referenceYear, isFixed,
    },
  });
};

const findAll = async (userId, filters) => {
  const { month, year, category, type, search, page = 1, limit = 20 } = filters;

  const where = { userId };
  if (month) where.referenceMonth = month;
  if (year) where.referenceYear = year;
  if (category) where.category = category;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    transactions,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

const findById = async (id, userId) => {
  const tx = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!tx) throw Object.assign(new Error('Transação não encontrada'), { status: 404 });
  return tx;
};

const update = async (id, userId, data) => {
  await findById(id, userId);
  return prisma.transaction.update({ where: { id }, data });
};

const remove = async (id, userId, deleteAll = false) => {
  const tx = await findById(id, userId);

  if (deleteAll && (tx.isFixed || tx.installments)) {
    const rootId = tx.parentId || tx.id;
    await prisma.transaction.deleteMany({
      where: { userId, OR: [{ id: rootId }, { parentId: rootId }] },
    });
    return { deleted: 'all' };
  }

  await prisma.transaction.delete({ where: { id } });
  return { deleted: 'single' };
};

const parseAndImportCSV = async (userId, csvData) => {
  const lines = csvData.split('\n').filter(Boolean);
  const transactions = [];

  for (const line of lines.slice(1)) {
    const [date, name, amount, type] = line.split(',').map(s => s?.trim().replace(/"/g, ''));
    if (!name || !amount) continue;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) continue;

    const parsedAmount = parseFloat(amount.replace(/[R$\s.]/g, '').replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) continue;

    transactions.push({
      userId,
      name,
      amount: parsedAmount,
      type: type?.toUpperCase() === 'PIX' ? 'PIX' :
            type?.toUpperCase() === 'CREDIT' ? 'CREDIT' : 'DEBIT',
      category: autoCategorizeName(name),
      tags: [],
      date: parsedDate,
      referenceMonth: parsedDate.getMonth() + 1,
      referenceYear: parsedDate.getFullYear(),
      isFixed: false,
    });
  }

  if (transactions.length > 0) {
    await prisma.transaction.createMany({ data: transactions });
  }

  return { imported: transactions.length };
};

module.exports = { create, findAll, findById, update, remove, parseAndImportCSV, autoCategorizeName };
