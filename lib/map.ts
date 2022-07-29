class IndexedMap<T> extends Map<number, T> {
	public add(value: T): this {
		const nextKey = this.size === 0 ? 1 : Math.max(...this.keys()) + 1;

		return this.set(nextKey, value);
	}
}

export default IndexedMap;
