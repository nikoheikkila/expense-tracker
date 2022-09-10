import 'reflect-metadata';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { z } from 'zod';
import { Validator } from '../../../../lib/validation.js';

const nanoIdPattern = new RegExp('[A-Za-z0-9_-]{21}');

const expenseSchema = z.object({
	id: z.string().regex(nanoIdPattern, {
		message: `Expense ID must match regular expression: ${nanoIdPattern}`,
	}),
	name: z.string().min(1, 'Expense name must not be empty'),
	price: z.number().gte(0, 'Expense price must be greater than zero'),
	updatedAt: z.date().optional(),
	createdAt: z.date().optional(),
});

@Entity()
class BaseEntity {
	@PrimaryColumn({ type: 'varchar', length: 21 })
	id: string;
	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}

@Entity({ name: 'expenses' })
class Expense extends BaseEntity {
	@Column({ type: 'varchar', length: 255 })
	name: string;
	@Column({ type: 'integer' })
	price: number;
	@UpdateDateColumn({ type: 'timestamp', default: new Date(Date.now()) })
	public static make(values: Partial<Expense>): Expense {
		return Object.assign(
			new Expense(),
			Validator.withSchema(expenseSchema).parseObject(values),
		);
	}
}

export default Expense;
