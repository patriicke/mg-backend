import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex
} from 'typeorm';

export class AddFirstNameAndLastNameUserTable1658128879988
  implements MigrationInterface
{
  tableName = 'user';
  columns = [
    new TableColumn({
      name: 'lastName',
      type: 'varchar',
      isNullable: true,
      length: '32'
    })
  ];

  index: TableIndex = new TableIndex({
    name: 'user_last_name_index',
    columnNames: ['lastName']
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "name" TO "firstName"`
    );
    await queryRunner.addColumns(this.tableName, this.columns);
    await queryRunner.createIndex(this.tableName, this.index);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "firstName" TO "name"`
    );
    await queryRunner.dropIndex(this.tableName, this.index);
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
