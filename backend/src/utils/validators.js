const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve ter letras maiúsculas, minúsculas e números'
  ),
  salary: z.number().min(0).optional().default(0),
  savingsGoal: z.number().min(0).max(100).optional().default(20),
  paymentDay: z.number().min(1).max(31).optional().default(5),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

const transactionSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  amount: z.coerce.number().positive(),
  type: z.enum(['DEBIT', 'PIX', 'CREDIT', 'INSTALLMENT']),
  category: z.string().max(50).optional().or(z.literal('')),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  notes: z.string().max(500).optional().or(z.literal('')),
  // Aceita tanto "2024-01-15" quanto "2024-01-15T00:00:00.000Z"
  date: z.string().optional(),
  referenceMonth: z.coerce.number().min(1).max(12),
  referenceYear: z.coerce.number().min(2020).max(2100),
  isFixed: z.boolean().optional().default(false),
  installments: z.coerce.number().min(1).max(120).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  salary: z.coerce.number().min(0).optional(),
  savingsGoal: z.coerce.number().min(0).max(100).optional(),
  safetyAmount: z.coerce.number().min(0).optional(),
  paymentDay: z.coerce.number().min(1).max(31).optional(),
});

const filterSchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
  category: z.string().optional(),
  type: z.enum(['DEBIT', 'PIX', 'CREDIT', 'INSTALLMENT']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

module.exports = {
  registerSchema,
  loginSchema,
  transactionSchema,
  updateUserSchema,
  filterSchema,
};
