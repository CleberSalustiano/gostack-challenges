import {MigrationInterface, QueryRunner, Table} from "typeorm";

export default class CreateTransaction1654732521616 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void>{
        await queryRunner.createTable(
            new Table ({
                name: "transaction",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "title",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "type",
                        type: "varchar",
                        isNullable: false,   
                    },
                    {
                        name: "value",
                        type: "int",
                        isNullable: false,   
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                      },
                      {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                      },
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("transaction")
    }

}
