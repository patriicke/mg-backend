import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey
} from 'typeorm';

export class TransactionTable1678598413019 implements MigrationInterface {
  tableName = 'transaction';
  foreignKeys = [{ column: 'userId', table: 'frontend_user' }];
  public async up(queryRunner: QueryRunner): Promise<void> {
    // add extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
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
            name: 'uuid',
            type: 'varchar',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'paymentId',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'depositAddress',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'memo',
            type: 'text',
            isNullable: true
          },
          {
            name: 'fiatAmount',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true
          },
          {
            name: 'payAmount',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true
          },
          {
            name: 'amountReceived',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true
          },
          {
            name: 'type',
            type: 'varchar',
            // enum: ['deposit', 'withdraw'],
            isNullable: true
          },
          {
            name: 'status',
            type: 'varchar'
          },
          {
            name: 'payment_fee',
            type: 'numeric',
            isNullable: true
          },
          {
            name: 'detail',
            type: 'json',
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
    for (const item of this.foreignKeys) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: item.column,
          type: 'int'
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
    await queryRunner.dropTable(this.tableName);
  }
}
