class IndexedMap<T> extends Map<number, T> {
	public add(value: T): this {
		return this.set(this.getNextKey(), value);
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
