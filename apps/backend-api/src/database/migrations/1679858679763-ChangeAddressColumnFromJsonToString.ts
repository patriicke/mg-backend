import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAddressColumnFromJsonToString1679858679763
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" DROP COLUMN "address"`
    );
    await queryRunner.query(
      `ALTER TABLE "frontend_user" ADD "address" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" DROP COLUMN "address"`
    );
    await queryRunner.query(`ALTER TABLE "frontend_user" ADD "address" jsonb`);
  }
}
