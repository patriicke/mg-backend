import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DefaultProfileImages } from './get-default-profile-images';
import { FrontendUserRepository } from '@app/modules/frontend-user';

@QueryHandler(DefaultProfileImages)
export class DefaultProfileImagesHandler
  implements IQueryHandler<DefaultProfileImages>
{
  constructor(private repository: FrontendUserRepository) {}
  async execute() {
    return this.repository.getDefaultProfileImages();
  }
}
