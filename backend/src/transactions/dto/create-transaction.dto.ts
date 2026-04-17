import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Calle Gran Via 28, Madrid' })
  @IsString()
  @IsNotEmpty()
  propertyAddress: string;

  @ApiProperty({ enum: ['sale', 'rental'], example: 'sale' })
  @IsEnum(['sale', 'rental'])
  type: string;

  @ApiProperty({ example: 30000000, description: 'Property price in cents' })
  @IsInt()
  @Min(1)
  propertyPriceCents: number;

  @ApiProperty({
    example: 900000,
    description: 'Total service fee in cents',
  })
  @IsInt()
  @Min(1)
  serviceFeeCents: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  listingAgent: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  sellingAgent: string;
}
