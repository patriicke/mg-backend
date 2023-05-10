import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDistributionColumn1679857315982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" DROP COLUMN "distributionAddress"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" ADD "distributionAddress" jsonb NOT NULL DEFAULT '{}'`
    );
  }
}
