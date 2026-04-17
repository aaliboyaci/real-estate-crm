import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AdvanceStageDto } from './dto/advance-stage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { TransactionStage } from './enums/transaction-stage.enum';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions (paginated, filterable)' })
  @ApiQuery({ name: 'stage', enum: TransactionStage, required: false })
  findAll(
    @Query() query: PaginationQueryDto & { stage?: TransactionStage },
  ) {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction details' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Advance transaction stage' })
  advanceStage(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AdvanceStageDto,
  ) {
    return this.transactionsService.advanceStage(id, dto);
  }
}
