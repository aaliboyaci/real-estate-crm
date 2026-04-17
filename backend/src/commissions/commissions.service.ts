import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { Commission, CommissionDocument } from './schemas/commission.schema';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/schemas/transaction.schema';
import { calculateCommission } from './helpers/commission-calculator';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(
    @InjectModel(Commission.name)
    private readonly commissionModel: Model<CommissionDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  @OnEvent('transaction.completed')
  async handleTransactionCompleted(payload: {
    transactionId: string;
  }): Promise<void> {
    const { transactionId } = payload;

    // Idempotency: skip if commission already exists
    const existing = await this.commissionModel
      .findById(transactionId)
      .exec()
      .then(() =>
        this.commissionModel
          .findOne()
          .where('transaction')
          .equals(new Types.ObjectId(transactionId))
          .exec(),
      );

    if (existing) {
      this.logger.warn(
        `Commission already exists for transaction ${transactionId}`,
      );
      return;
    }

    const transaction = await this.transactionModel
      .findById(transactionId)
      .exec();

    if (!transaction) {
      this.logger.error(`Transaction ${transactionId} not found`);
      return;
    }

    const result = calculateCommission({
      serviceFeeCents: transaction.serviceFeeCents,
      listingAgentId: transaction.listingAgent.toString(),
      sellingAgentId: transaction.sellingAgent.toString(),
    });

    const now = new Date();
    const doc = new this.commissionModel({
      transaction: new Types.ObjectId(transactionId),
      totalServiceFeeCents: transaction.serviceFeeCents,
      agencyAmountCents: result.agencyAmountCents,
      agencyPercentage: result.agencyPercentage,
      agentBreakdowns: result.agentBreakdowns.map((b) => ({
        agent: new Types.ObjectId(b.agentId),
        role: b.role,
        amountCents: b.amountCents,
        percentage: b.percentage,
      })),
      calculatedAt: now,
    });
    await doc.save();

    // Update embedded snapshot on transaction
    const listingBreakdown = result.agentBreakdowns.find(
      (b) => b.role === 'listing' || b.role === 'both',
    );
    const sellingBreakdown = result.agentBreakdowns.find(
      (b) => b.role === 'selling',
    );

    await this.transactionModel.findByIdAndUpdate(transactionId, {
      commissionSummary: {
        agencyCents: result.agencyAmountCents,
        listingAgentCents: listingBreakdown?.amountCents ?? 0,
        sellingAgentCents: sellingBreakdown?.amountCents ?? 0,
        calculatedAt: now,
      },
    });

    this.logger.log(
      `Commission calculated for transaction ${transactionId}`,
    );
  }

  async findByTransaction(
    transactionId: string,
  ): Promise<CommissionDocument | null> {
    return this.commissionModel
      .findOne()
      .where('transaction')
      .equals(new Types.ObjectId(transactionId))
      .populate('agentBreakdowns.agent', 'firstName lastName email')
      .exec();
  }

  async findByAgent(agentId: string): Promise<CommissionDocument[]> {
    return this.commissionModel
      .find()
      .where('agentBreakdowns.agent')
      .equals(new Types.ObjectId(agentId))
      .populate('transaction')
      .populate('agentBreakdowns.agent', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<CommissionDocument[]> {
    return this.commissionModel
      .find()
      .populate('transaction', 'propertyAddress type serviceFeeCents')
      .populate('agentBreakdowns.agent', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
