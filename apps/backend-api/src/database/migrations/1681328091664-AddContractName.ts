import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContractName1681328091664 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game" ADD "contractName" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "contractName"`);
  }
}
