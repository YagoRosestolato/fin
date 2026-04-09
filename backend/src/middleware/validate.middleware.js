const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors });
    }
    req[target] = result.data;
    next();
  };
};

module.exports = { validate };
