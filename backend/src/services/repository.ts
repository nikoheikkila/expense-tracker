import collect, { Collection } from 'collect.js';
import { Expense } from '../domain/entities';
import { AppDataSource } from '../../config';
import { EntityTarget, Repository, SelectQueryBuilder } from 'typeorm';
import { Operator } from '../../../lib/interfaces';

export interface IRepository<T> {
	get(...ids: number[]): Promise<T[]>;
	add(...items: Partial<T>[]): Promise<T[]>;
	list(): Promise<T[]>;
	findBy(key: string, operator: Operator, value: unknown): Promise<T[]>;
	update(id: number, mutation: Partial<T>): Promise<T>;
	delete(...ids: number[]): Promise<void>;
	clear(): Promise<void>;
}

export class InMemoryRepository<T> implements IRepository<T> {
	private items: Collection<T>;

	constructor(...items: T[]) {
		this.items = collect(items);
	}

	public async get(...ids: number[]): Promise<T[]> {
		return this.items.whereIn('id', ids).all();
	}

	public async add(...items: T[]): Promise<T[]> {
		const insertedItems: T[] = [];

		for (const item of items) {
			const id = this.items.count() + 1;
			const newItem = {
				...item,
				id,
				created: new Date(),
			};

			insertedItems.push(newItem);
			this.items.push(newItem);
		}

		return insertedItems;
	}

	public async list(): Promise<T[]> {
		return this.items.all();
	}

	public async findBy(key: string, operator: Operator, value: unknown): Promise<T[]> {
		return this.items.where(key, operator as any, value).all();
	}

	public async update(id: number, mutation: Partial<T>): Promise<T> {
		return this.items
			.where('id', id)
			.transform((item) => ({ ...item, ...mutation }))
			.firstOrFail();
	}

	public async delete(...ids: number[]): Promise<void> {
		this.items = this.items.whereNotIn('id', ids);
	}

	public async clear(): Promise<void> {
		this.items = collect();
	}
}

// Stryker disable all
export class ExpenseRepository implements IRepository<Expense> {
	private readonly repository: Repository<Expense>;
	private readonly tableName: string = 'expense';

	constructor(repository: Repository<Expense>) {
		this.repository = repository;
	}

	private get query(): SelectQueryBuilder<Expense> {
		return this.repository.createQueryBuilder(this.tableName);
	}

	public async get(...ids: number[]): Promise<Expense[]> {
		return this.query.whereInIds(ids).getMany();
	}
	public async add(...items: Expense[]): Promise<Expense[]> {
		const result = await this.query
			.insert()
			.into(this.tableName)
			.values(items)
			.returning(['id', 'name', 'price'])
			.execute();

		return result.raw;
	}
	public async list(): Promise<Expense[]> {
		return this.query.getMany();
	}
	public async findBy(key: string, operator: Operator, value: unknown): Promise<Expense[]> {
		return this.query.where(`${this.tableName}.${key} ${operator} :value`, { value }).getMany();
	}
	public async update(id: number, mutation: Partial<Expense>): Promise<Expense> {
		const result = await this.query
			.update(this.tableName)
			.set(mutation)
			.where('id = :id', { id })
			.returning(['id', 'name', 'price'])
			.execute();

		return result.raw[0];
	}
	public async delete(...ids: number[]): Promise<void> {
		await this.query.delete().whereInIds(ids).execute();
	}
	public async clear(): Promise<void> {
		return;
	}
}

export class RepositoryFactory {
	public static withInMemoryDatabase<T>(): InMemoryRepository<T> {
		return new InMemoryRepository<T>();
	}

	public static withSQLDatabase(entity: EntityTarget<Expense>): ExpenseRepository {
		const repository = AppDataSource.getRepository<Expense>(entity);
		return new ExpenseRepository(repository);
	}
}
