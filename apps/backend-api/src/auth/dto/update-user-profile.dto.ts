import { OmitType } from '@nestjs/swagger';
import { UpdateUserDto } from '../../auth/dto/update-user.dto';

/**
 * update user profile transfer object
 */
export class UpdateUserProfileDto extends OmitType(UpdateUserDto, [
  'status',
  'roleId'
] as const) {}
