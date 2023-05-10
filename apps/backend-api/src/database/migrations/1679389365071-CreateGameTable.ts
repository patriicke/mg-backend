import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey
} from 'typeorm';

export class CreateGameTable1679389365071 implements MigrationInterface {
  tableName = 'game';
  foreignKeys = [
    { column: 'userId', table: 'frontend_user' },
    { column: 'balanceId', table: 'balance' }
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
            name: 'uuid',
            type: 'varchar',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'winProbability', //percentage in decimal
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true
          },
          {
            name: 'serverHash',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'chain',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'tokenId',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'nftAddress',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'nftImage',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true
          },
          {
            name: 'betAmount',
            type: 'decimal',
            precision: 20,
            scale: 8,
            isNullable: true
          },
          {
            name: 'detail',
            type: 'json',
            isNullable: true
          },
          {
            name: 'nonce', // auto incremented
            type: 'int'
          },
          {
            name: 'status',
            type: 'varchar'
            // enum: ['win', 'lost', 'pending']
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
          type: 'int',
          isNullable: true
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
