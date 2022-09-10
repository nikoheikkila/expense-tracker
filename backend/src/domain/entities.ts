import 'reflect-metadata';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { z } from 'zod';
import { Validator } from '../../../lib/validation';

const expenseSchema = z.object({
	id: z.number().gte(1, 'ID must be greater or equal to 1').optional(),
	name: z.string().min(1, 'Expense name must not be empty'),
	price: z.number().gte(0, 'Expense price must be greater than zero'),
	created: z.date().optional(),
});

@Entity()
export class Expense {
	@PrimaryGeneratedColumn({ type: 'integer' })
	id: number;
	@Column({ type: 'varchar', length: 255 })
	name: string;
	@Column({ type: 'integer' })
	price: number;
	@CreateDateColumn({ type: 'timestamp', default: new Date(Date.now()) })
	created: Date;

	public static make(values: Partial<Expense>): Expense {
		return Object.assign(
			new Expense(),
			Validator.withSchema(expenseSchema).parseObject(values),
		);
	}
}
