import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStage } from '../enums/transaction-stage.enum';

export class AdvanceStageDto {
  @ApiProperty({
    enum: TransactionStage,
    example: TransactionStage.EARNEST_MONEY,
    description: 'Target stage to transition to',
  })
  @IsEnum(TransactionStage)
  targetStage: TransactionStage;

  @ApiPropertyOptional({
    example: 'Earnest money deposit received',
    description: 'Optional note for the stage transition',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
