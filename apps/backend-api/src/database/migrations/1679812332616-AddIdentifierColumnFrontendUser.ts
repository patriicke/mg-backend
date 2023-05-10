import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIdentifierColumnFrontendUser1679812332616
  implements MigrationInterface
{
  tableName = 'frontend_user';
  columns = [
    new TableColumn({
      name: 'identifier',
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
