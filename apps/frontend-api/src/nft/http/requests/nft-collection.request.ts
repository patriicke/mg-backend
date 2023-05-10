import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PeriodEnum {
  HOURLY = '24h',
  WEEKLY = '7d',
  MONTHLY = '30d',
  TOTAL = 'all'
}

export enum RankingEnum {
  POPULAR = 'total_volume',
  HIGH = 'total_average_price',
  LOW = 'thirty_day_average_price',
  NEW = 'one_day_sales'
}
// key value object of RankingEnum

// export enum RankingEnum {
//   TOTAL_VOLUME = 'total_volume',
//   ONE_DAY_VOLUME = 'one_day_volume',
//   SEVEN_DAY_VOLUME = 'seven_day_volume',
//   THIRTY_DAY_VOLUME = 'thirty_day_volume',
//   TOTAL_SALES = 'total_sales',
//   ONE_DAY_SALES = 'one_day_sales',
//   SEVEN_DAY_SALES = 'seven_day_sales',
//   THIRTY_DAY_SALES = 'thirty_day_sales',
//   TOTAL_AVERAGE_PRICE = 'total_average_price',
//   ONE_DAY_AVERAGE_PRICE = 'one_day_average_price',
//   SEVEN_DAY_AVERAGE_PRICE = 'seven_day_average_price',
//   THIRTY_DAY_AVERAGE_PRICE = 'thirty_day_average_price'
// }
const rankings = Object.values(RankingEnum);
export class NftCollectionRequest {
  @ApiPropertyOptional()
  @ValidateIf((o) => o.cursor)
  @IsString()
  @IsIn(rankings, {
    message: `ranking must be one of ${rankings.join(', ')}`
  })
  ranking: RankingEnum;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.cursor)
  @IsString()
  cursor: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.limit)
  @IsNumberString()
  @Transform((value) => Number(value))
  pageSize: number;
}
