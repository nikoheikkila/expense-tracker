import { Schema, ZodTypeAny } from "zod";

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

	public parseObject<T extends AnyRecord>(object: T): T {
		return this.parse(this.schema, object);
	}

	private parse<T extends AnyRecord>(schema: ZodTypeAny, object: T): T {
		try {
			return schema.parse(object);
		} catch (error: unknown) {
			throw new ValidationError(String(error));
		}
	}
}
