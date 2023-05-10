import { DataSource } from 'typeorm';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { BaseRepository } from '@app/common-module';

import { PermissionEntity } from '../permission/entities/permission.entity';
import { Permission } from '../permission/serializer/permission.serializer';
import { RoutePayloadInterface } from '../config/permission-config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionRepository extends BaseRepository<
  PermissionEntity,
  Permission
> {
  constructor(private dataSource: DataSource) {
    super(PermissionEntity, dataSource.createEntityManager());
  }
  async syncPermission(
    permissionsList: RoutePayloadInterface[]
  ): Promise<void> {
    const constraintName = await this.query(
      `SELECT conname FROM pg_constraint WHERE conrelid = 'permission'::regclass AND contype = 'u';`
    );
    await this.createQueryBuilder('permission')
      .insert()
      .into(PermissionEntity)
      .values(permissionsList)
      .orUpdate(['path', 'method'], constraintName[0].conname)
      .execute();
  }

  transform(model: PermissionEntity, transformOption = {}): Permission {
    return plainToClass(
      Permission,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: PermissionEntity[],
    transformOption = {}
  ): Permission[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
