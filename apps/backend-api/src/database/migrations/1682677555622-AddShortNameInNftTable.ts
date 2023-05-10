import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddShortNameInNftTable1682677555622 implements MigrationInterface {
  tableName = 'nft';
  columns = [
    new TableColumn({
      name: 'shortName',
      type: 'varchar',
      isNullable: true,
      length: '50'
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
