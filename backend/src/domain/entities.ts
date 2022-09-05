import 'reflect-metadata';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
