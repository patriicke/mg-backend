import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhantomWalletAddressFrontendUser1680084760794
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" ADD "phantomAddress" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //remove field phantomAddress
    await queryRunner.query(
      `ALTER TABLE "frontend_user" DROP COLUMN "phantomAddress"`
    );
  }
}
