import IndexedMap from '../../../lib/map';

export type Predicate<T> = (item: T) => boolean;
export type Mutation<T> = (item?: T | undefined) => T;

export interface Repository<T> {
	get(id: number): Promise<T | null>;
	add(...items: T[]): Promise<T[]>;
	list(): Promise<T[]>;
	findBy(predicate: Predicate<T>): Promise<T[]>;
	update(id: number, mutation: Mutation<T>): Promise<T>;
	delete(...ids: number[]): Promise<boolean>;
	clear(): Promise<void>;
}

export class InMemoryRepository<T> implements Repository<T> {
	private items: IndexedMap<T>;

	constructor() {
		this.items = new IndexedMap();
	}

	public async get(id: number): Promise<T | null> {
		return this.items.get(id) || null;
	}

	public async add(...items: T[]): Promise<T[]> {
		const toInsert = items
			.map((item, index) => {
				const id = this.items.getNextKey() + index;
				return { ...item, id };
			})
			.map((item) => ({ ...item, created: new Date() }));

		this.items.add(...toInsert);

		return toInsert;
	}

	public async list(): Promise<T[]> {
		return [...this.items.values()];
	}

	public async findBy(predicate: Predicate<T>): Promise<T[]> {
		return this.list().then((values) => values.filter(predicate));
	}

	public async update(id: number, mutation: Mutation<T>): Promise<T> {
		const item = mutation(this.items.get(id));
		this.items.set(id, item);

		return item;
	}

	public async delete(...ids: number[]): Promise<boolean> {
		return this.items.delete(...ids);
	}

	public async clear(): Promise<void> {
		this.items.clear();
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
	delete(...ids: number[]): Promise<boolean> {
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
