import { z, Schema } from 'zod';

type AnyRecord = Record<any, any>;

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

	private parse<T extends AnyRecord>(schema: z.ZodTypeAny, object: T): T {
		const result = schema.safeParse(object);

		if (!result.success) {
			throw result.error;
		}

		return result.data;
	}
}
