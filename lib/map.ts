class IndexedMap<T> extends Map<number, T> {
	public add(...values: T[]): this {
		values.forEach((value) => this.set(this.getNextKey(), value));
		return this;
	}

	public delete(...keys: number[]): boolean {
		return keys.map((key) => super.delete(key)).every(Boolean);
	}

	private getNextKey(): number {
		if (this.isEmpty()) {
			return 1;
		}

		return Math.max(...this.keys()) + 1;
	}

	private isEmpty(): boolean {
		return this.size === 0;
	}
}

export default IndexedMap;
