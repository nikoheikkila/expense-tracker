import collect, { Collection } from 'collect.js';

export type Predicate<T> = (item: T) => boolean;
export type Mutation<T> = (item?: T | undefined) => T;

export interface Repository<T> {
	get(id: number): Promise<T | null>;
	add(...items: T[]): Promise<T[]>;
	list(): Promise<T[]>;
	findBy(predicate: Predicate<T>): Promise<T[]>;
	update(id: number, mutation: Mutation<T>): Promise<T>;
	delete(...ids: number[]): Promise<void>;
	clear(): Promise<void>;
}

export class InMemoryRepository<T> implements Repository<T> {
	private items: Collection<T>;

	constructor(...items: T[]) {
		this.items = collect(items);
	}

	public async get(id: number): Promise<T | null> {
		return this.items.where('id', id).first();
	}

	public async add(...items: T[]): Promise<T[]> {
		const newItems: T[] = [];

		for (const item of items) {
			const id = this.items.count() + 1;
			const newItem = {
				...item,
				id,
				created: new Date(),
			};

			newItems.push(newItem);
			this.items.push(newItem);
		}

		return newItems;
	}

	public async list(): Promise<T[]> {
		return this.items.all();
	}

	public async findBy(predicate: Predicate<T>): Promise<T[]> {
		return this.items.filter(predicate).all();
	}

	public async update(id: number, mutation: Mutation<T>): Promise<T> {
		const [row] = await this.add(mutation());
		return row;
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
	get(id: number): Promise<any> {
		throw new Error('Method not implemented.');
	}
	add(...items: T[]): Promise<T[]> {
		throw new Error('Method not implemented.');
	}
	list(): Promise<T[]> {
		return Promise.resolve([] as T[]);
	}
	findBy(predicate: Predicate<T>): Promise<T[]> {
		throw new Error('Method not implemented.');
	}
	update(id: number, mutation: Mutation<T>): Promise<T> {
		throw new Error('Method not implemented.');
	}
	delete(...ids: number[]): Promise<void> {
		throw new Error('Method not implemented.');
	}
	clear(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}

export class RepositoryFactory {
	public static create<T>() {
		const driver = process.env.DB_DRIVER || 'memory';
		switch (driver) {
			case 'sql':
				return new SQLRepository<T>();
			case 'memory':
				return new InMemoryRepository<T>();
			default:
				throw new Error(`Unknown database driver: ${driver}`);
		}
	}
}
