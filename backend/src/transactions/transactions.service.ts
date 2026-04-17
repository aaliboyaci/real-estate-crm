import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Transaction,
  TransactionDocument,
} from './schemas/transaction.schema';
import { TransactionStage } from './enums/transaction-stage.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AdvanceStageDto } from './dto/advance-stage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { canTransition } from './helpers/stage-machine';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly agentsService: AgentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTransactionDto): Promise<TransactionDocument> {
    // Validate that both agents exist
    await Promise.all([
      this.agentsService.findOne(dto.listingAgent),
      this.agentsService.findOne(dto.sellingAgent),
    ]);

    const doc = new this.transactionModel({
      propertyAddress: dto.propertyAddress,
      type: dto.type,
      propertyPriceCents: dto.propertyPriceCents,
      serviceFeeCents: dto.serviceFeeCents,
      listingAgent: new Types.ObjectId(dto.listingAgent),
      sellingAgent: new Types.ObjectId(dto.sellingAgent),
      currentStage: TransactionStage.AGREEMENT,
      stageHistory: [],
      commissionSummary: null,
    });
    return doc.save();
  }

  async findAll(
    query: PaginationQueryDto & { stage?: TransactionStage },
  ) {
    const { page, limit, stage } = query;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (stage) {
      filter.currentStage = stage;
    }

    const [items, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .populate('listingAgent', 'firstName lastName email')
        .populate('sellingAgent', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(filter).exec(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('listingAgent')
      .populate('sellingAgent')
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }
    return transaction;
  }

  async update(
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }

    if (transaction.currentStage === TransactionStage.COMPLETED) {
      throw new BadRequestException(
        'Cannot update a completed transaction',
      );
    }

    const updated = await this.transactionModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate('listingAgent')
      .populate('sellingAgent')
      .exec();

    return updated!;
  }

  async advanceStage(
    id: string,
    dto: AdvanceStageDto,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }

    if (!canTransition(transaction.currentStage, dto.targetStage)) {
      throw new BadRequestException(
        `Cannot transition from "${transaction.currentStage}" to "${dto.targetStage}"`,
      );
    }

    transaction.stageHistory.push({
      from: transaction.currentStage,
      to: dto.targetStage,
      transitionedAt: new Date(),
      note: dto.note,
    });
    transaction.currentStage = dto.targetStage;
    await transaction.save();

    if (dto.targetStage === TransactionStage.COMPLETED) {
      this.eventEmitter.emit('transaction.completed', {
        transactionId: transaction._id.toString(),
      });
    }

    return transaction.populate(['listingAgent', 'sellingAgent']);
  }

  async findByAgent(agentId: string) {
    return this.transactionModel
      .find()
      .or([
        { listingAgent: agentId } as Record<string, unknown>,
        { sellingAgent: agentId } as Record<string, unknown>,
      ])
      .populate('listingAgent', 'firstName lastName email')
      .populate('sellingAgent', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
