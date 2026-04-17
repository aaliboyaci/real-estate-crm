/**
 * Pure function for commission calculation.
 * Zero dependencies — easily testable, framework-agnostic.
 *
 * All amounts are in integer cents to avoid floating-point precision issues.
 * Rounding strategy ensures cent-perfect totals: the last recipient
 * receives the remainder, guaranteeing no cent is ever lost.
 *
 * INVARIANT: agencyAmount + sum(agentAmounts) === serviceFeeCents (always)
 */

export interface CommissionInput {
  serviceFeeCents: number;
  listingAgentId: string;
  sellingAgentId: string;
}

export interface AgentBreakdown {
  agentId: string;
  role: 'listing' | 'selling' | 'both';
  amountCents: number;
  percentage: number;
}

export interface CommissionResult {
  agencyAmountCents: number;
  agencyPercentage: number;
  agentBreakdowns: AgentBreakdown[];
}

export function calculateCommission(input: CommissionInput): CommissionResult {
  const { serviceFeeCents, listingAgentId, sellingAgentId } = input;

  if (!Number.isInteger(serviceFeeCents) || serviceFeeCents <= 0) {
    throw new Error(
      'serviceFeeCents must be a positive integer',
    );
  }

  // Agency always gets 50%
  const agencyAmountCents = Math.round(serviceFeeCents * 0.5);

  // Agent pool is the remainder — this ensures total is preserved
  const agentPoolCents = serviceFeeCents - agencyAmountCents;

  const isSameAgent = listingAgentId === sellingAgentId;

  if (isSameAgent) {
    return {
      agencyAmountCents,
      agencyPercentage: 50,
      agentBreakdowns: [
        {
          agentId: listingAgentId,
          role: 'both',
          amountCents: agentPoolCents,
          percentage: 50,
        },
      ],
    };
  }

  // Different agents: split the agent pool equally
  const listingAgentCents = Math.round(agentPoolCents / 2);
  // Selling agent gets the remainder to preserve the total
  const sellingAgentCents = agentPoolCents - listingAgentCents;

  return {
    agencyAmountCents,
    agencyPercentage: 50,
    agentBreakdowns: [
      {
        agentId: listingAgentId,
        role: 'listing',
        amountCents: listingAgentCents,
        percentage: 25,
      },
      {
        agentId: sellingAgentId,
        role: 'selling',
        amountCents: sellingAgentCents,
        percentage: 25,
      },
    ],
  };
}
