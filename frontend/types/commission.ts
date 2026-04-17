import type { Agent } from './agent';
import type { Transaction } from './transaction';

export interface AgentBreakdown {
  agent: Agent | string;
  role: 'listing' | 'selling' | 'both';
  amountCents: number;
  percentage: number;
}

export interface Commission {
  _id: string;
  transaction: Transaction | string;
  totalServiceFeeCents: number;
  agencyAmountCents: number;
  agencyPercentage: number;
  agentBreakdowns: AgentBreakdown[];
  calculatedAt: string;
  createdAt: string;
}
