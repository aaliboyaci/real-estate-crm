import type { Agent } from './agent';

export type TransactionStage = 'agreement' | 'earnest_money' | 'title_deed' | 'completed';
export type TransactionType = 'sale' | 'rental';

export interface StageHistoryEntry {
  from: TransactionStage;
  to: TransactionStage;
  transitionedAt: string;
  note?: string;
}

export interface CommissionSummary {
  agencyCents: number;
  listingAgentCents: number;
  sellingAgentCents: number;
  calculatedAt: string;
}

export interface Transaction {
  _id: string;
  propertyAddress: string;
  type: TransactionType;
  propertyPriceCents: number;
  serviceFeeCents: number;
  listingAgent: Agent | string;
  sellingAgent: Agent | string;
  currentStage: TransactionStage;
  stageHistory: StageHistoryEntry[];
  commissionSummary: CommissionSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  propertyAddress: string;
  type: TransactionType;
  propertyPriceCents: number;
  serviceFeeCents: number;
  listingAgent: string;
  sellingAgent: string;
}
