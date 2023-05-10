import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBatchIdInTransactionTable1680283553907
  implements MigrationInterface
{
  tableName = 'transaction';
  columns = [
    new TableColumn({
      name: 'batchWithdrawalId',
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
