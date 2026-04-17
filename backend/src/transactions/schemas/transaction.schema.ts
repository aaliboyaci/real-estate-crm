import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStage } from '../enums/transaction-stage.enum';
import { Agent } from '../../agents/schemas/agent.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ _id: false })
export class StageHistoryEntry {
  @Prop({ required: true, enum: TransactionStage })
  from: TransactionStage;

  @Prop({ required: true, enum: TransactionStage })
  to: TransactionStage;

  @Prop({ required: true, default: () => new Date() })
  transitionedAt: Date;

  @Prop()
  note?: string;
}

export const StageHistoryEntrySchema =
  SchemaFactory.createForClass(StageHistoryEntry);

@Schema({ _id: false })
export class CommissionSummary {
  @Prop({ required: true })
  agencyCents: number;

  @Prop({ required: true })
  listingAgentCents: number;

  @Prop({ required: true })
  sellingAgentCents: number;

  @Prop({ required: true })
  calculatedAt: Date;
}

export const CommissionSummarySchema =
  SchemaFactory.createForClass(CommissionSummary);

@Schema({ timestamps: true })
export class Transaction {
  @ApiProperty({ example: 'Calle Gran Via 28, Madrid' })
  @Prop({ required: true, trim: true })
  propertyAddress: string;

  @ApiProperty({ enum: ['sale', 'rental'], example: 'sale' })
  @Prop({ required: true, enum: ['sale', 'rental'] })
  type: string;

  @ApiProperty({ example: 30000000, description: 'Property price in cents' })
  @Prop({ required: true, min: 1 })
  propertyPriceCents: number;

  @ApiProperty({
    example: 900000,
    description: 'Total service fee (commission) in cents',
  })
  @Prop({ required: true, min: 1 })
  serviceFeeCents: number;

  @ApiProperty({ description: 'Listing agent ObjectId' })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Agent.name,
    required: true,
  })
  listingAgent: MongooseSchema.Types.ObjectId;

  @ApiProperty({ description: 'Selling agent ObjectId' })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Agent.name,
    required: true,
  })
  sellingAgent: MongooseSchema.Types.ObjectId;

  @ApiProperty({ enum: TransactionStage, example: TransactionStage.AGREEMENT })
  @Prop({
    required: true,
    enum: TransactionStage,
    default: TransactionStage.AGREEMENT,
  })
  currentStage: TransactionStage;

  @Prop({ type: [StageHistoryEntrySchema], default: [] })
  stageHistory: StageHistoryEntry[];

  @ApiPropertyOptional({ type: CommissionSummary })
  @Prop({ type: CommissionSummarySchema, default: null })
  commissionSummary: CommissionSummary | null;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ currentStage: 1, createdAt: -1 });
TransactionSchema.index({ listingAgent: 1 });
TransactionSchema.index({ sellingAgent: 1 });
