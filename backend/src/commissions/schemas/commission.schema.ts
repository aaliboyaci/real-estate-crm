import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../transactions/schemas/transaction.schema';
import { Agent } from '../../agents/schemas/agent.schema';

export type CommissionDocument = HydratedDocument<Commission>;

@Schema({ _id: false })
export class AgentBreakdownEntry {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Agent.name,
    required: true,
  })
  agent: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['listing', 'selling', 'both'] })
  role: string;

  @Prop({ required: true })
  amountCents: number;

  @Prop({ required: true })
  percentage: number;
}

export const AgentBreakdownEntrySchema =
  SchemaFactory.createForClass(AgentBreakdownEntry);

@Schema({ timestamps: true })
export class Commission {
  @ApiProperty({ description: 'Transaction ObjectId' })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Transaction.name,
    required: true,
  })
  transaction: MongooseSchema.Types.ObjectId;

  @ApiProperty({ example: 900000 })
  @Prop({ required: true })
  totalServiceFeeCents: number;

  @ApiProperty({ example: 450000 })
  @Prop({ required: true })
  agencyAmountCents: number;

  @ApiProperty({ example: 50 })
  @Prop({ required: true })
  agencyPercentage: number;

  @Prop({ type: [AgentBreakdownEntrySchema], required: true })
  agentBreakdowns: AgentBreakdownEntry[];

  @Prop({ required: true })
  calculatedAt: Date;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);

CommissionSchema.index({ transaction: 1 }, { unique: true });
CommissionSchema.index({ 'agentBreakdowns.agent': 1 });
