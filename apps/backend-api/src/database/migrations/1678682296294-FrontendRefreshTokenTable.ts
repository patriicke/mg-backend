import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex
} from 'typeorm';

export class FrontendRefreshTokenTable1678682296294
  implements MigrationInterface
{
  foreignKeysArray = [
    {
      table: 'frontend_user',
      field: 'userId',
      reference: 'id'
    }
  ];
  indexFields = ['browser', 'os'];
  tableName = 'fe_refresh_token';
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
            name: 'ip',
            type: 'varchar',
            isNullable: true,
            length: '50'
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true
          },
          {
            name: 'browser',
            type: 'varchar',
            isNullable: true,
            length: '200'
          },
          {
            name: 'os',
            type: 'varchar',
            isNullable: true,
            length: '200'
          },
          {
            name: 'isRevoked',
            type: 'boolean',
            default: false
          },
          {
            name: 'expires',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      false
    );

    for (const foreignKey of this.foreignKeysArray) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: foreignKey.field,
          type: 'int'
        })
      );

      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          columnNames: [foreignKey.field],
          referencedColumnNames: [foreignKey.reference],
          referencedTableName: foreignKey.table,
          onDelete: 'CASCADE'
        })
      );
    }
    for (const field of this.indexFields) {
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: `IDX_FE_REFRESH_TOKEN_${field.toUpperCase()}`,
          columnNames: [field]
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    for (const key of this.foreignKeysArray) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf(key.field) !== -1
      );
      await queryRunner.dropForeignKey(this.tableName, foreignKey);
      await queryRunner.dropColumn(this.tableName, key.field);
    }
    for (const field of this.indexFields) {
      const index = `IDX_FE_REFRESH_TOKEN_${field.toUpperCase()}`;
      const keyIndex = await table.indices.find(
        (fk) => fk.name.indexOf(index) !== -1
      );
      await queryRunner.dropIndex(this.tableName, keyIndex);
    }
    await queryRunner.dropTable(this.tableName);
  }
}
