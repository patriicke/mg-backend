import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class FrontendUserTable1667294249107 implements MigrationInterface {
  tableName = 'frontend_user';
  indexFields = ['email', 'username'];
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
            name: 'email',
            type: 'varchar',
            isNullable: false,
            length: '200'
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
            length: '200'
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: true,
            length: '100'
          },
          {
            name: 'walletToken',
            type: 'varchar',
            isNullable: true,
            length: '255'
          },
          {
            name: 'showUsername',
            type: 'boolean',
            default: true
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'salt',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'tokenExpiry',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'status',
            type: 'boolean',
            default: true
          },
          {
            name: 'distributionAddress',
            type: 'json',
            isNullable: true
          },
          {
            name: 'address',
            type: 'json',
            isNullable: true
          },
          {
            name: 'serverHash',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'accountVerified',
            type: 'boolean',
            default: false
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
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true
          }
        ]
      }),
      false
    );

    for (const field of this.indexFields) {
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: `IDX_Frontend_User_${field.toUpperCase()}`,
          columnNames: [field]
        })
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);

    for (const field of this.indexFields) {
      const index = `IDX_Frontend_User_${field.toUpperCase()}`;
      const keyIndex = table.indices.find(
        (fk) => fk.name.indexOf(index) !== -1
      );
      await queryRunner.dropIndex(this.tableName, keyIndex);
    }
    await queryRunner.dropTable(this.tableName);
  }
}
