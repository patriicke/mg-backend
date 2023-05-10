import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGameTypeInGameTable1679905274808 implements MigrationInterface {
  tableName = 'game';
  columns = [
    new TableColumn({
      name: 'type',
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
