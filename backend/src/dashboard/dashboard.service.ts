import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/schemas/transaction.schema';
import {
  Commission,
  CommissionDocument,
} from '../commissions/schemas/commission.schema';
import { TransactionStage } from '../transactions/enums/transaction-stage.enum';
import { getAllStages } from '../transactions/helpers/stage-machine';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Commission.name)
    private readonly commissionModel: Model<CommissionDocument>,
  ) {}

  async getStats() {
    const [stageCounts, totalTransactions, agencyRevenue, topAgents] =
      await Promise.all([
        this.getStageCounts(),
        this.transactionModel.countDocuments().exec(),
        this.getAgencyRevenue(),
        this.getTopAgents(5),
      ]);

    const activeTransactions = totalTransactions - (stageCounts.completed ?? 0);

    return {
      totalTransactions,
      activeTransactions,
      agencyRevenueCents: agencyRevenue,
      stageCounts,
      topAgents,
    };
  }

  async getPipeline() {
    const stages = getAllStages();
    const pipeline = await Promise.all(
      stages.map(async (stage) => {
        const transactions = await this.transactionModel
          .find()
          .where('currentStage')
          .equals(stage)
          .populate('listingAgent', 'firstName lastName')
          .populate('sellingAgent', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(50)
          .exec();

        return {
          stage,
          count: transactions.length,
          transactions,
        };
      }),
    );

    return pipeline;
  }

  private async getStageCounts(): Promise<Record<string, number>> {
    const result = await this.transactionModel.aggregate([
      { $group: { _id: '$currentStage', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {};
    for (const stage of getAllStages()) {
      counts[stage] = 0;
    }
    for (const row of result) {
      counts[row._id] = row.count;
    }
    return counts;
  }

  private async getAgencyRevenue(): Promise<number> {
    const result = await this.commissionModel.aggregate([
      { $group: { _id: null, total: { $sum: '$agencyAmountCents' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  private async getTopAgents(limit: number) {
    const result = await this.commissionModel.aggregate([
      { $unwind: '$agentBreakdowns' },
      {
        $group: {
          _id: '$agentBreakdowns.agent',
          totalEarningsCents: { $sum: '$agentBreakdowns.amountCents' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalEarningsCents: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $project: {
          _id: 0,
          agentId: '$_id',
          firstName: '$agent.firstName',
          lastName: '$agent.lastName',
          email: '$agent.email',
          totalEarningsCents: 1,
          transactionCount: 1,
        },
      },
    ]);

    return result;
  }
}
