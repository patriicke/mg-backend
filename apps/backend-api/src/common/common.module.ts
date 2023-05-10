import { Module } from '@nestjs/common';
import { ExcelService } from '@app/modules/excel';

@Module({
  exports: [ExcelService],
  providers: [ExcelService]
})
export class CommonModule {}
