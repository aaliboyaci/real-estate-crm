import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all commissions' })
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get commission breakdown for a transaction' })
  async findByTransaction(
    @Param('transactionId', ParseObjectIdPipe) transactionId: string,
  ) {
    const commission =
      await this.commissionsService.findByTransaction(transactionId);
    if (!commission) {
      throw new NotFoundException(
        `Commission not found for transaction "${transactionId}"`,
      );
    }
    return commission;
  }
}
