import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReferralColumnsInFrontendUsers1679633153808
  implements MigrationInterface
{
  tableName = 'frontend_user';
  columns = [
    new TableColumn({
      name: 'referralCode',
      type: 'varchar',
      isNullable: true,
      length: '100'
    }),
    new TableColumn({
      name: 'referralId',
      type: 'int',
      isNullable: true
    }),
    new TableColumn({
      name: 'referralPoints',
      type: 'numeric',
      default: 0,
      isNullable: true
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
