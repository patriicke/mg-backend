import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class DefaultPicsTable1681055419037 implements MigrationInterface {
  tableName = 'default_profile_image';

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
            name: 'image',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'status',
            type: 'boolean',
            default: true
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
