import { DefaultProfileImage } from '@app/modules/frontend-user';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultProfilePicSeeder1681056896600
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(DefaultProfileImage)
      .values([
        {
          image: 'default-pic-1.png'
        },
        {
          image: 'default-pic-2.png'
        },
        {
          image: 'default-pic-3.png'
        },
        {
          image: 'default-pic-4.png'
        }
      ])
      .orIgnore()
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(DefaultProfileImage).delete({});
  }
}
