import { MigrationInterface, QueryRunner, Table } from "typeorm";

const table = "expenses";

export class AddExpensesTable1662832294921 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: table,
				columns: [
					{ name: "id", type: "varchar", length: "21", isPrimary: true },
					{ name: "name", type: "varchar", length: "255" },
					{ name: "price", type: "integer" },
					{ name: "updated_at", type: "timestamp" },
					{ name: "created_at", type: "timestamp" },
				],
			}),
			true,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(table, true);
	}
}
