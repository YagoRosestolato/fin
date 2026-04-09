const authService = require('../services/auth.service');
const config = require('../config');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.login(req.body, ip, userAgent);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token não fornecido' });
    }
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', tokens.accessToken, ACCESS_COOKIE_OPTIONS);
    res.json({ success: true, accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(refreshToken, req.user.id);
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Logout realizado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };
