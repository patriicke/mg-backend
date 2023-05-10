import { PartialType } from '@nestjs/swagger';

import { CreateDashboardDto } from '../../dashboard/dto/create-dashboard.dto';

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {}
