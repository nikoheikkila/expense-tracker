type Predicate<T> = (item: T) => boolean;

export interface Repository<T> {
	add(...items: T[]): Promise<void>;
	list(): Promise<T[]>;
	findBy(predicate: Predicate<T>): Promise<T[]>;
}

export class InMemoryRepository<T> implements Repository<T> {
	private items: T[];
	constructor() {
		this.items = [];
	}
	public async add(...items: T[]): Promise<void> {
		this.items.push(...items);
	}

	public async list(): Promise<T[]> {
		return this.items;
	}

	public async findBy(predicate: Predicate<T>): Promise<T[]> {
		return this.items.filter(predicate);
	}
}
