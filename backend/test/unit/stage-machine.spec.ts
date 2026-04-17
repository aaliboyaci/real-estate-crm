import {
  canTransition,
  getNextStage,
  getStageOrder,
  getAllStages,
} from '../../src/transactions/helpers/stage-machine';
import { TransactionStage } from '../../src/transactions/enums/transaction-stage.enum';

describe('Stage Machine', () => {
  describe('canTransition', () => {
    // Valid transitions (strictly linear)
    it('should allow agreement → earnest_money', () => {
      expect(
        canTransition(
          TransactionStage.AGREEMENT,
          TransactionStage.EARNEST_MONEY,
        ),
      ).toBe(true);
    });

    it('should allow earnest_money → title_deed', () => {
      expect(
        canTransition(
          TransactionStage.EARNEST_MONEY,
          TransactionStage.TITLE_DEED,
        ),
      ).toBe(true);
    });

    it('should allow title_deed → completed', () => {
      expect(
        canTransition(
          TransactionStage.TITLE_DEED,
          TransactionStage.COMPLETED,
        ),
      ).toBe(true);
    });

    // Stage skipping (invalid)
    it('should NOT allow agreement → title_deed (skip)', () => {
      expect(
        canTransition(
          TransactionStage.AGREEMENT,
          TransactionStage.TITLE_DEED,
        ),
      ).toBe(false);
    });

    it('should NOT allow agreement → completed (skip)', () => {
      expect(
        canTransition(
          TransactionStage.AGREEMENT,
          TransactionStage.COMPLETED,
        ),
      ).toBe(false);
    });

    it('should NOT allow earnest_money → completed (skip)', () => {
      expect(
        canTransition(
          TransactionStage.EARNEST_MONEY,
          TransactionStage.COMPLETED,
        ),
      ).toBe(false);
    });

    // Backward transitions (invalid)
    it('should NOT allow completed → agreement (backward)', () => {
      expect(
        canTransition(
          TransactionStage.COMPLETED,
          TransactionStage.AGREEMENT,
        ),
      ).toBe(false);
    });

    it('should NOT allow earnest_money → agreement (backward)', () => {
      expect(
        canTransition(
          TransactionStage.EARNEST_MONEY,
          TransactionStage.AGREEMENT,
        ),
      ).toBe(false);
    });

    it('should NOT allow title_deed → earnest_money (backward)', () => {
      expect(
        canTransition(
          TransactionStage.TITLE_DEED,
          TransactionStage.EARNEST_MONEY,
        ),
      ).toBe(false);
    });

    // Self-transitions (invalid)
    it('should NOT allow agreement → agreement (self)', () => {
      expect(
        canTransition(
          TransactionStage.AGREEMENT,
          TransactionStage.AGREEMENT,
        ),
      ).toBe(false);
    });

    it('should NOT allow completed → completed (self at terminal)', () => {
      expect(
        canTransition(
          TransactionStage.COMPLETED,
          TransactionStage.COMPLETED,
        ),
      ).toBe(false);
    });
  });

  describe('getNextStage', () => {
    it('should return earnest_money after agreement', () => {
      expect(getNextStage(TransactionStage.AGREEMENT)).toBe(
        TransactionStage.EARNEST_MONEY,
      );
    });

    it('should return title_deed after earnest_money', () => {
      expect(getNextStage(TransactionStage.EARNEST_MONEY)).toBe(
        TransactionStage.TITLE_DEED,
      );
    });

    it('should return completed after title_deed', () => {
      expect(getNextStage(TransactionStage.TITLE_DEED)).toBe(
        TransactionStage.COMPLETED,
      );
    });

    it('should return null for completed (terminal state)', () => {
      expect(getNextStage(TransactionStage.COMPLETED)).toBeNull();
    });
  });

  describe('getStageOrder', () => {
    it('should return 0 for agreement', () => {
      expect(getStageOrder(TransactionStage.AGREEMENT)).toBe(0);
    });

    it('should return 1 for earnest_money', () => {
      expect(getStageOrder(TransactionStage.EARNEST_MONEY)).toBe(1);
    });

    it('should return 2 for title_deed', () => {
      expect(getStageOrder(TransactionStage.TITLE_DEED)).toBe(2);
    });

    it('should return 3 for completed', () => {
      expect(getStageOrder(TransactionStage.COMPLETED)).toBe(3);
    });
  });

  describe('getAllStages', () => {
    it('should return all 4 stages in order', () => {
      const stages = getAllStages();
      expect(stages).toHaveLength(4);
      expect(stages).toEqual([
        TransactionStage.AGREEMENT,
        TransactionStage.EARNEST_MONEY,
        TransactionStage.TITLE_DEED,
        TransactionStage.COMPLETED,
      ]);
    });

    it('should return a new array (not the internal reference)', () => {
      const a = getAllStages();
      const b = getAllStages();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });
});
