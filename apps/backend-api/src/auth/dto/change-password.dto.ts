import { IsNotEmpty } from 'class-validator';

import { ChangePasswordAdminDto } from './change-password-admin.dto';

/**
 * change password data transfer object
 */
export class ChangePasswordDto extends ChangePasswordAdminDto {
  @IsNotEmpty()
  oldPassword: string;
}
