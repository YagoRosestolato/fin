const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
  });

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Registro duplicado' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Registro não encontrado' });
    }
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Erro interno do servidor';

  res.status(status).json({ success: false, message });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Rota não encontrada: ${req.method} ${req.url}` });
};

module.exports = { errorHandler, notFound };
