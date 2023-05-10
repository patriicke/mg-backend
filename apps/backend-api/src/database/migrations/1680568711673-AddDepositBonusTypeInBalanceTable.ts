import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepositBonusTypeInBalanceTable1680568711673
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE balance_type_enum ADD VALUE  'deposit_bonus'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE balance_type_enum DROP VALUE 'deposit_bonus'
            `);
  }
}
