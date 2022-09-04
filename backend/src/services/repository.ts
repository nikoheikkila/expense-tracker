import collect, { Collection } from 'collect.js';
import knex, { Knex } from 'knex';
import config from '../../config';

export interface Repository<T> {
	get(...ids: number[]): Promise<T[]>;
	add(...items: T[]): Promise<T[]>;
	list(): Promise<T[]>;
	findBy(key: string, operator: Operator, value: unknown): Promise<T[]>;
	update(id: number, mutation: Partial<T>): Promise<T>;
	delete(...ids: number[]): Promise<void>;
	clear(): Promise<void>;
}

export class InMemoryRepository<T> implements Repository<T> {
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
		return this.items.where(key, operator, value).all();
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
export class SQLRepository<T> implements Repository<T> {
	constructor(private readonly connection: Knex, private readonly table: string) {}

	private get query(): Knex.QueryBuilder {
		return this.connection(this.table);
	}

	public async get(id: number): Promise<T[]> {
		return this.query.where({ id }).first();
	}
	public async add(...items: T[]): Promise<T[]> {
		return this.query.insert(items).returning('*');
	}
	public async list(): Promise<T[]> {
		return this.query.select('*');
	}
	public async findBy(key: string, operator: Operator, value: unknown): Promise<T[]> {
		return this.query.where(key as any, operator, value as any).select('*');
	}
	public async update(id: number, mutation: Partial<T>): Promise<T> {
		return this.query.update(mutation).where({ id }).returning('*').first();
	}
	public async delete(...ids: number[]): Promise<void> {
		return this.query.whereIn('id', ids).delete();
	}
	public async clear(): Promise<void> {
		return this.query.truncate();
	}
}

export class RepositoryFactory {
	public static create<T>(driver?: string) {
		driver = driver ?? process.env.DB_DRIVER;
		switch (driver) {
			case 'sql':
				return this.createSQLRepository<T>();
			case 'memory':
				return this.createInMemoryRepository<T>();
			default:
				throw new Error(`Unknown database driver: ${driver}`);
		}
	}

	private static createInMemoryRepository<T>(): InMemoryRepository<T> {
		return new InMemoryRepository<T>();
	}

	private static createSQLRepository<T>(): SQLRepository<T> {
		const table = 'expenses';
		const { database } = config();
		const connection = knex(database);

		return new SQLRepository<T>(connection, table);
	}
}
