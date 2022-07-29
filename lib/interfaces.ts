export interface BaseModel {
	id: number;
}

export interface Expense extends BaseModel {
	readonly name: string;
	readonly price: number;
	readonly created: Date;
}
