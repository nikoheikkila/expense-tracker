import { BaseModel } from '../../lib/interfaces';
import IndexedMap from '../../lib/map';

export type Predicate<T> = (item: T) => boolean;
type Mutation<T> = (item: T) => T;

export interface Repository<T extends BaseModel> {
	get(id: number): Promise<T>;
	add(...items: T[]): Promise<void>;
	list(): Promise<T[]>;
	findBy(predicate: Predicate<T>): Promise<T[]>;
	update(id: number, mutation: Mutation<T>): Promise<void>;
	delete(...ids: number[]): Promise<void>;
	clear(): Promise<void>;
}

class RepositoryError extends Error {}

export class InMemoryRepository<T extends BaseModel> implements Repository<T> {
	private items: IndexedMap<T>;

	constructor() {
		this.items = new IndexedMap();
	}

	public async get(id: number): Promise<T> {
		const result = this.items.get(id);

		if (!result) {
			throw new RepositoryError(`Item with ID ${id} doesn't exist`);
		}

		return result;
	}

	public async add(...items: T[]): Promise<void> {
		items.forEach((item) => this.items.add(item));
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

		this.items.set(id, mutation(item));
	}

	public async delete(...ids: number[]): Promise<void> {
		ids.forEach((id) => this.items.delete(id));
	}

	public async clear(): Promise<void> {
		this.items.clear();
	}
}
