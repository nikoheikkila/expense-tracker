import { z, Schema } from 'zod';

export class Validator {
	private readonly schema: Schema;

	private constructor(schema: Schema) {
		this.schema = schema;
	}

	public static withSchema(schema: Schema): Validator {
		return new Validator(schema);
	}

	public parseObject<T extends object>(object: T): T {
		return this.schema.parse(object);
	}

	public parseArray<T extends object>(array: T[]): T[] {
		return z.array(this.schema).min(1, { message: 'Input data must not be empty' }).parse(array);
	}
}
