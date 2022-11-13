import { z } from "zod";

export enum Operator {
	SAME = "===",
	EQUAL = "=",
	NOT_SAME = "!==",
	NOT_EQUAL = "!=",
	NOT_EQUAL_TO = "<>",
	GREATER = ">",
	LESS = "<",
	GREATER_OR_EQUAL = ">=",
	LESS_OR_EQUAL = "<=",
}

const operatorPattern = new RegExp(`^(${Object.values(Operator).join("|")})$`);

export const querySchema = z.object({
	key: z.string().min(1, "Query key must not be empty"),
	operator: z
		.string()
		.min(1, "Query operator must not be empty")
		.regex(operatorPattern, `Query operator must match regular expression: ${operatorPattern.toString()}`),
	value: z.unknown(),
});
