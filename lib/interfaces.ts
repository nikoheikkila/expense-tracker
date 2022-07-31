import { z } from 'zod';

export const expenseSchema = z.object({
	id: z.number().gte(1).optional(),
	name: z.string().min(1, { message: 'Expense name must not be empty' }),
	price: z.number().gte(0, { message: 'Expense price must be greater than zero' }),
	created: z
		.date()
		.default(() => new Date())
		.optional(),
});

export type Expense = z.infer<typeof expenseSchema>;
