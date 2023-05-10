import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey
} from 'typeorm';

export class BalanceTable1678599389233 implements MigrationInterface {
  tableName = 'balance';
  foreignKeys = [
    { column: 'userId', table: 'frontend_user' }
    // { column: 'transactionId', table: 'transaction' }
  ];

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
            name: 'transactionId',
            type: 'int',
            isNullable: true
          },
          {
            name: 'amount', // can be negative and decimal too
            type: 'numeric',
            default: 0
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'game_win',
              'game_loss',
              'deposit',
              'withdraw',
              'referral_bonus'
            ],
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
