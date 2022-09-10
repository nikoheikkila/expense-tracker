import 'reflect-metadata';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { z } from 'zod';
import { Validator } from '../../../lib/validation';

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
export class Expense {
	@PrimaryColumn({ type: 'varchar', length: 21 })
	id: string;
	@Column({ type: 'varchar', length: 255 })
	name: string;
	@Column({ type: 'integer' })
	price: number;
	@UpdateDateColumn({ type: 'timestamp', default: new Date(Date.now()) })
	updatedAt: Date;
	@CreateDateColumn({ type: 'timestamp', default: new Date(Date.now()) })
	createdAt: Date;

	public static make(values: Partial<Expense>): Expense {
		return Object.assign(
			new Expense(),
			Validator.withSchema(expenseSchema).parseObject(values),
		);
	}
}
