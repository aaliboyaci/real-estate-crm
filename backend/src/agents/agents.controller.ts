import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CommissionsService } from '../commissions/commissions.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly commissionsService: CommissionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  create(@Body() dto: CreateAgentDto) {
    return this.agentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all agents (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.agentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.agentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agent' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete agent' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.agentsService.remove(id);
  }

  @Get(':id/commissions')
  @ApiOperation({ summary: 'Get agent commission history' })
  getCommissions(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commissionsService.findByAgent(id);
  }
}
