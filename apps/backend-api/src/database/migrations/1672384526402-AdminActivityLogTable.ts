import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex
} from 'typeorm';

export class AdminActivityLogTable1672384526402 implements MigrationInterface {
  tableName = 'admin_activity_log';
  foreignKeys = [{ column: 'userId', table: 'user' }];
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
            name: 'module',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'message',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'metaData',
            type: 'jsonb',
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
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `IDX_ADMIN_ACTIVITY_TYPE`,
        columnNames: ['type']
      })
    );
    for (const item of this.foreignKeys) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: item.column,
          type: 'int',
          isNullable: false
        })
      );
      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          columnNames: [item.column],
          referencedColumnNames: ['id'],
          referencedTableName: item.table
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);

    for (const item of this.foreignKeys) {
      const foreignKey = await table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf(item.column) !== -1
      );
      await queryRunner.dropForeignKey(this.tableName, foreignKey);
      await queryRunner.dropColumn(this.tableName, item.column);
    }

    const index = `IDX_ACTIVITY_TYPE`;
    const nameIndex = table.indices.find((fk) => fk.name.indexOf(index) !== -1);
    if (nameIndex) {
      await queryRunner.dropIndex(this.tableName, nameIndex);
    }

    await queryRunner.dropTable(this.tableName);
  }
}
