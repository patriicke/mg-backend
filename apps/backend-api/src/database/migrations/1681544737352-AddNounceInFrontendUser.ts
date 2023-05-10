import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNounceInFrontendUser1681544737352
  implements MigrationInterface
{
  tableName = 'frontend_user';
  columns = [
    new TableColumn({
      name: 'nonce',
      type: 'varchar',
      isNullable: true,
      length: '100'
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
