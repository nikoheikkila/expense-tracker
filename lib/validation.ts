import { Schema, ZodError, ZodTypeAny } from 'zod';

type AnyRecord = Record<any, any>;

export class ValidationError extends Error {}

export class Validator {
	private readonly schema: Schema;

	private constructor(schema: Schema) {
		this.schema = schema;
	}

	public static withSchema(schema: Schema): Validator {
		return new Validator(schema);
	}

	public parseArray<T extends AnyRecord>(array: T[]): T[] {
		const schema = this.schema.array().min(1, { message: 'Input data must not be empty' });

		return this.parse(schema, array);
	}

	private parse<T extends AnyRecord>(schema: ZodTypeAny, object: T): T {
		try {
			return schema.parse(object);
		} catch (error: unknown) {
			throw new ValidationError(String(error));
		}
	}
}
