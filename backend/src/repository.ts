import { BaseModel } from '../../lib/interfaces';

export type Predicate<T> = (item: T) => boolean;
export type Mutation<T> = (item: T) => T;

export interface Repository<T extends BaseModel> {
	add(...items: T[]): Promise<void>;
	list(): Promise<T[]>;
	findBy(predicate: Predicate<T>): Promise<T[]>;
	update(id: number, mutation: Mutation<T>): Promise<void>;
}

class RepositoryError extends Error {}

export class InMemoryRepository<T extends BaseModel> implements Repository<T> {
	private items: Map<number, T>;
	constructor() {
		this.items = new Map();
	}
	public async add(...items: T[]): Promise<void> {
		items.forEach((item) => this.items.set(item.id, item));
	}

	public async list(): Promise<T[]> {
		return [...this.items.values()];
	}

	public async findBy(predicate: Predicate<T>): Promise<T[]> {
		return [...this.items.values()].filter(predicate);
	}

	public async update(id: number, mutation: Mutation<T>): Promise<void> {
		const item = this.items.get(id);

		if (!item) {
			throw new RepositoryError(`Item with ID ${id} doesn't exist`);
		}

		this.items.set(item.id, mutation(item));
	}
}
