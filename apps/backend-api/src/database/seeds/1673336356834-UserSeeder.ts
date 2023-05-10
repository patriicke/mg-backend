import { MigrationInterface, QueryRunner } from 'typeorm';

import { UserEntity } from '../../auth/entity/user.entity';
import { UserStatusEnum } from '../../auth/user-status.enum';
import { RoleEntity } from '../../role/entities/role.entity';

export class UserSeeder1673336356834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const role = await queryRunner.manager.getRepository(RoleEntity).findOne({
      where: {
        name: 'Super Admin'
      }
    });

    if (!role) {
      return;
    }
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values([
        {
          email: 'admin@truthy.com',
          password:
            '$2b$10$O9BWip02GuE14bDPfBomQebCjwKQyuUfkulhvBB1UoizOeKxGG8Fu', // Truthy@123
          salt: '$2b$10$O9BWip02GuE14bDPfBomQe',
          firstName: 'monorepo',
          lastName: 'service',
          status: UserStatusEnum.ACTIVE,
          roleId: role.id
        }
      ])
      .orIgnore()
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(UserEntity).delete({});
  }
}
