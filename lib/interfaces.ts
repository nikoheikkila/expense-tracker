import { z } from 'zod';

export interface BaseModel {
	id?: number | undefined;
}

export const expenseSchema = z.object({
	id: z.number().gte(1).optional(),
	name: z.string().min(1, { message: 'Expense name must not be empty' }),
	price: z.number().gte(0, { message: 'Expense price must be greater than zero' }),
	created: z.date().default(() => new Date()),
});

export type Expense = z.infer<typeof expenseSchema>;
