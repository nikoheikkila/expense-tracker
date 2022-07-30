import IndexedMap from '../../lib/map';

export type Predicate<T> = (item: T) => boolean;
export type Mutation<T> = (item?: T | undefined) => T;

export interface Repository<T> {
	get(id: number): Promise<T | null>;
	add(...items: T[]): Promise<void>;
	list(): Promise<T[]>;
	findBy(predicate: Predicate<T>): Promise<T[]>;
	update(id: number, mutation: Mutation<T>): Promise<void>;
	delete(...ids: number[]): Promise<void>;
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

	public async add(...items: T[]): Promise<void> {
		this.items.add(...items);
	}

	public async list(): Promise<T[]> {
		return [...this.items.values()];
	}

	public async findBy(predicate: Predicate<T>): Promise<T[]> {
		return this.list().then((values) => values.filter(predicate));
	}

	public async update(id: number, mutation: Mutation<T>): Promise<void> {
		const item = this.items.get(id);
		this.items.set(id, mutation(item));
	}

	public async delete(...ids: number[]): Promise<void> {
		this.items.delete(...ids);
	}

	public async clear(): Promise<void> {
		this.items.clear();
	}
}
