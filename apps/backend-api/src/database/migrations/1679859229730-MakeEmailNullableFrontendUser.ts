import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEmailNullableFrontendUser1679859229730
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" ALTER COLUMN "email" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "frontend_user" ALTER COLUMN "email" SET NOT NULL`
    );
  }
}
