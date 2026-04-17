import { TransactionStage } from '../enums/transaction-stage.enum';

/**
 * Strictly linear stage transitions for real estate transactions.
 * No stage skipping, no backward transitions, `completed` is terminal.
 *
 * Real-world rationale: you cannot issue a title deed before earnest money
 * is received, and a completed transaction cannot be reopened.
 */
const VALID_TRANSITIONS: Record<TransactionStage, TransactionStage[]> = {
  [TransactionStage.AGREEMENT]: [TransactionStage.EARNEST_MONEY],
  [TransactionStage.EARNEST_MONEY]: [TransactionStage.TITLE_DEED],
  [TransactionStage.TITLE_DEED]: [TransactionStage.COMPLETED],
  [TransactionStage.COMPLETED]: [],
};

const STAGE_ORDER: TransactionStage[] = [
  TransactionStage.AGREEMENT,
  TransactionStage.EARNEST_MONEY,
  TransactionStage.TITLE_DEED,
  TransactionStage.COMPLETED,
];

export function canTransition(
  from: TransactionStage,
  to: TransactionStage,
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStage(
  current: TransactionStage,
): TransactionStage | null {
  const allowed = VALID_TRANSITIONS[current];
  return allowed.length === 1 ? allowed[0] : null;
}

export function getStageOrder(stage: TransactionStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function getAllStages(): TransactionStage[] {
  return [...STAGE_ORDER];
}
