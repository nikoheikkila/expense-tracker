import { z } from 'zod';

export enum Operator {
	SAME = '===',
	EQUAL = '=',
	NOT_SAME = '!==',
	NOT_EQUAL = '!=',
	NOT_EQUAL_TO = '<>',
	GREATER = '>',
	LESS = '<',
	GREATER_OR_EQUAL = '>=',
	LESS_OR_EQUAL = '<=',
}

const operatorPattern = new RegExp(`^(${Object.values(Operator).join('|')})$`);

export const expenseSchema = z.object({
	id: z.number().gte(1, 'ID must be greater or equal to 1').optional(),
	name: z.string().min(1, 'Expense name must not be empty'),
	price: z.number().gte(0, 'Expense price must be greater than zero'),
	created: z.date().optional(),
});

export const querySchema = z.object({
	key: z.string().min(1, 'Query key must not be empty'),
	operator: z
		.string()
		.min(1, 'Query operator must not be empty')
		.regex(
			operatorPattern,
			`Query operator must match regular expression: ${operatorPattern.toString()}`,
		),
	value: z.unknown(),
});
