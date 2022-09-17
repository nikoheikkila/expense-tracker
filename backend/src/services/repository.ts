import collect, { Collection } from 'collect.js';
import { DataSource, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import AppDataSource from '@backend/config';
import { Operator } from '@lib/interfaces';
import Expense from '@backend/domain/entities/Expense';

export interface IRepository<T> {
	transacting<R>(operation: () => R): Promise<R>;
	get(...ids: string[]): Promise<T[]>;
	add(...items: Partial<T>[]): Promise<T[]>;
	list(): Promise<T[]>;
	findBy(key: string, operator: Operator, value: unknown): Promise<T[]>;
	update(id: string, mutation: Partial<T>): Promise<T>;
	delete(...ids: string[]): Promise<void>;
	clear(): Promise<void>;
}

export class InMemoryRepository<T> implements IRepository<T> {
	private items: Collection<T>;

	constructor(...items: T[]) {
		this.items = collect(items);
	}

	public async transacting<R>(operation: () => R): Promise<R> {
		return operation();
	}

	public async get(...ids: string[]): Promise<T[]> {
		return this.items.whereIn('id', ids).all();
	}

	public async add(...items: T[]): Promise<T[]> {
		const insertedItems: T[] = [];

		for (const item of items) {
			const newItem = {
				...item,
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

	public async update(id: string, mutation: Partial<T>): Promise<T> {
		return this.items
			.where('id', id)
			.transform((item) => ({ ...item, ...mutation }))
			.firstOrFail();
	}

	public async delete(...ids: string[]): Promise<void> {
		this.items = this.items.whereNotIn('id', ids);
	}

	public async clear(): Promise<void> {
		this.items = collect();
	}
}

// Stryker disable all
export class ExpenseRepository implements IRepository<Expense> {
	private readonly dataSource: DataSource;
	private readonly repository: Repository<Expense>;
	private readonly tableName: string = 'expenses';

	constructor(dataSource: DataSource) {
		this.dataSource = dataSource;
		this.repository = dataSource.getRepository(Expense);
	}

	public async transacting<R>(operation: () => R): Promise<R> {
		const runner = this.dataSource.createQueryRunner();

		await runner.connect();
		await runner.startTransaction();

		try {
			const result = operation();
			await runner.commitTransaction();

			return result;
		} catch (error: unknown) {
			await runner.rollbackTransaction();

			throw error;
		} finally {
			await runner.release();
		}
	}

	private get query(): SelectQueryBuilder<Expense> {
		return this.repository.createQueryBuilder(this.tableName);
	}

	public async get(...ids: string[]): Promise<Expense[]> {
		return this.query.whereInIds(ids).getMany();
	}
	public async add(...items: Expense[]): Promise<Expense[]> {
		const { raw } = await this.query
			.insert()
			.into(this.tableName)
			.values(items)
			.returning(['id', 'name', 'price'])
			.execute();

		return raw;
	}
	public async list(): Promise<Expense[]> {
		return this.query.getMany();
	}
	public async findBy(key: string, operator: Operator, value: unknown): Promise<Expense[]> {
		return this.query.where(`${this.tableName}.${key} ${operator} :value`, { value }).getMany();
	}
	public async update(id: string, mutation: Partial<Expense>): Promise<Expense> {
		const result = await this.query
			.update(this.tableName)
			.set(mutation)
			.where('id = :id', { id })
			.returning(['id', 'name', 'price'])
			.execute();

		return this.parseUpdateResult(result);
	}
	private parseUpdateResult(result: UpdateResult): Expense {
		const { raw } = result;

		return Array.isArray(raw) && raw.length > 0 ? raw.pop() : raw;
	}

	public async delete(...ids: string[]): Promise<void> {
		await this.query.delete().whereInIds(ids).execute();
	}
	public async clear(): Promise<void> {
		return;
	}
}

export class ExpenseRepositoryFactory {
	public static withInMemoryDatabase(): InMemoryRepository<Expense> {
		return new InMemoryRepository<Expense>();
	}

	public static withSQLDatabase(): ExpenseRepository {
		return new ExpenseRepository(AppDataSource);
	}
}
