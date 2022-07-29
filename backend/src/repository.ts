export interface Repository<T> {
	add(...items: T[]): Promise<void>;
	list(): Promise<T[]>;
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
}
