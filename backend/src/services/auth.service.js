const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { id: userId, email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  const refreshToken = jwt.sign(
    { id: userId, email },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, salary, savingsGoal, paymentDay }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('E-mail já cadastrado');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, salary, savingsGoal, paymentDay },
    select: { id: true, email: true, name: true, salary: true, savingsGoal: true, paymentDay: true, createdAt: true },
  });

  const tokens = generateTokens(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  logger.info(`User registered: ${email}`);
  return { user, ...tokens };
};

const login = async ({ email, password }, ip, userAgent) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const tokens = generateTokens(user.id, user.email);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.accessLog.create({
    data: { userId: user.id, action: 'LOGIN', ip, userAgent },
  });

  const { password: _, ...safeUser } = user;
  logger.info(`User logged in: ${email}`);
  return { user: safeUser, ...tokens };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    const err = new Error('Refresh token inválido');
    err.status = 401;
    throw err;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error('Refresh token expirado');
    err.status = 401;
    throw err;
  }

  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newTokens = generateTokens(decoded.id, decoded.email);
  await prisma.refreshToken.create({
    data: {
      token: newTokens.refreshToken,
      userId: decoded.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return newTokens;
};

const logout = async (refreshToken, userId) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } });
  }
  await prisma.accessLog.create({
    data: { userId, action: 'LOGOUT' },
  });
};

module.exports = { register, login, refreshAccessToken, logout };
