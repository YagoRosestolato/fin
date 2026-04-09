// Entrypoint para Vercel Serverless
require('dotenv').config();
const app = require('../src/app');

module.exports = app;
