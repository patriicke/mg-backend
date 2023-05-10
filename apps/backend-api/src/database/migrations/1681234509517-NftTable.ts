import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class NftTable1681234509517 implements MigrationInterface {
  tableName = 'nft';
  indexFields = ['chain', 'name', 'collectionName', 'slug'];

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
            name: 'tokenId',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'nftContractAddress',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'contractType',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'chain',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'collectionName',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'numSales',
            type: 'numeric',
            isNullable: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'imageUrl',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'lastSaleTotalPrice',
            type: 'numeric',
            isNullable: true
          },
          {
            name: 'lastSaleDecimals',
            type: 'numeric',
            isNullable: true
          },
          {
            name: 'lastSaleUsdPrice',
            type: 'numeric',
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
    for (const field of this.indexFields) {
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: `IDX_Nft_${field.toUpperCase()}`,
          columnNames: [field]
        })
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);

    for (const field of this.indexFields) {
      const index = `IDX_Nft_${field.toUpperCase()}`;
      const keyIndex = table.indices.find(
        (fk) => fk.name.indexOf(index) !== -1
      );
      await queryRunner.dropIndex(this.tableName, keyIndex);
    }
    await queryRunner.dropTable(this.tableName);
  }
}
