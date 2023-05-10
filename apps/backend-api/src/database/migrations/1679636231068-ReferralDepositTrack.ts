import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ReferralDepositTrack1679636231068 implements MigrationInterface {
  tableName = 'referral_deposit_track';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true
          },
          {
            name: 'referralUserId',
            type: 'int',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      false
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
