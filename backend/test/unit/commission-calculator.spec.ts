import {
  calculateCommission,
  CommissionInput,
  CommissionResult,
} from '../../src/commissions/helpers/commission-calculator';

describe('Commission Calculator', () => {
  const AGENT_A = '507f1f77bcf86cd799439011';
  const AGENT_B = '507f1f77bcf86cd799439012';

  describe('Scenario 1: Same agent (listing === selling)', () => {
    it('should give 50% to agency and 50% to agent for 10000 cents', () => {
      const result = calculateCommission({
        serviceFeeCents: 10000,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_A,
      });

      expect(result.agencyAmountCents).toBe(5000);
      expect(result.agencyPercentage).toBe(50);
      expect(result.agentBreakdowns).toHaveLength(1);
      expect(result.agentBreakdowns[0].amountCents).toBe(5000);
      expect(result.agentBreakdowns[0].percentage).toBe(50);
      expect(result.agentBreakdowns[0].role).toBe('both');
      expect(result.agentBreakdowns[0].agentId).toBe(AGENT_A);
    });

    it('should handle large amounts (EUR 9,000 = 900000 cents)', () => {
      const result = calculateCommission({
        serviceFeeCents: 900000,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_A,
      });

      expect(result.agencyAmountCents).toBe(450000);
      expect(result.agentBreakdowns[0].amountCents).toBe(450000);
    });

    it('should handle 1 cent (minimum possible)', () => {
      const result = calculateCommission({
        serviceFeeCents: 1,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_A,
      });

      // 1 * 0.5 = 0.5 -> rounds to 1, agent pool = 0
      expect(result.agencyAmountCents + result.agentBreakdowns[0].amountCents).toBe(1);
    });

    it('should handle odd service fee (99999 cents)', () => {
      const result = calculateCommission({
        serviceFeeCents: 99999,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_A,
      });

      const total =
        result.agencyAmountCents + result.agentBreakdowns[0].amountCents;
      expect(total).toBe(99999);
    });

    it('should set role to "both"', () => {
      const result = calculateCommission({
        serviceFeeCents: 10000,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_A,
      });

      expect(result.agentBreakdowns[0].role).toBe('both');
    });
  });

  describe('Scenario 2: Different agents', () => {
    it('should split 50% agency, 25% listing, 25% selling for 10000 cents', () => {
      const result = calculateCommission({
        serviceFeeCents: 10000,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_B,
      });

      expect(result.agencyAmountCents).toBe(5000);
      expect(result.agentBreakdowns).toHaveLength(2);

      const listing = result.agentBreakdowns.find((b) => b.role === 'listing')!;
      const selling = result.agentBreakdowns.find((b) => b.role === 'selling')!;

      expect(listing.amountCents).toBe(2500);
      expect(listing.percentage).toBe(25);
      expect(listing.agentId).toBe(AGENT_A);

      expect(selling.amountCents).toBe(2500);
      expect(selling.percentage).toBe(25);
      expect(selling.agentId).toBe(AGENT_B);
    });

    it('should handle odd total (10001 cents) — no cent lost', () => {
      const result = calculateCommission({
        serviceFeeCents: 10001,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_B,
      });

      const listing = result.agentBreakdowns.find((b) => b.role === 'listing')!;
      const selling = result.agentBreakdowns.find((b) => b.role === 'selling')!;

      const total =
        result.agencyAmountCents + listing.amountCents + selling.amountCents;
      expect(total).toBe(10001);
    });

    it('should handle 3 cents — extreme edge case', () => {
      const result = calculateCommission({
        serviceFeeCents: 3,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_B,
      });

      const listing = result.agentBreakdowns.find((b) => b.role === 'listing')!;
      const selling = result.agentBreakdowns.find((b) => b.role === 'selling')!;

      const total =
        result.agencyAmountCents + listing.amountCents + selling.amountCents;
      expect(total).toBe(3);
    });

    it('should handle 999 cents — sum preserved', () => {
      const result = calculateCommission({
        serviceFeeCents: 999,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_B,
      });

      const listing = result.agentBreakdowns.find((b) => b.role === 'listing')!;
      const selling = result.agentBreakdowns.find((b) => b.role === 'selling')!;

      const total =
        result.agencyAmountCents + listing.amountCents + selling.amountCents;
      expect(total).toBe(999);
    });

    it('should set correct roles', () => {
      const result = calculateCommission({
        serviceFeeCents: 10000,
        listingAgentId: AGENT_A,
        sellingAgentId: AGENT_B,
      });

      expect(result.agentBreakdowns[0].role).toBe('listing');
      expect(result.agentBreakdowns[1].role).toBe('selling');
    });
  });

  describe('Input validation', () => {
    it('should throw for serviceFeeCents = 0', () => {
      expect(() =>
        calculateCommission({
          serviceFeeCents: 0,
          listingAgentId: AGENT_A,
          sellingAgentId: AGENT_B,
        }),
      ).toThrow('serviceFeeCents must be a positive integer');
    });

    it('should throw for negative serviceFeeCents', () => {
      expect(() =>
        calculateCommission({
          serviceFeeCents: -100,
          listingAgentId: AGENT_A,
          sellingAgentId: AGENT_B,
        }),
      ).toThrow('serviceFeeCents must be a positive integer');
    });

    it('should throw for non-integer serviceFeeCents', () => {
      expect(() =>
        calculateCommission({
          serviceFeeCents: 1.5,
          listingAgentId: AGENT_A,
          sellingAgentId: AGENT_B,
        }),
      ).toThrow('serviceFeeCents must be a positive integer');
    });
  });

  describe('Invariant: cent-perfect totals (property-based)', () => {
    it('should never lose a cent across 100 random inputs (same agent)', () => {
      for (let i = 0; i < 100; i++) {
        const serviceFeeCents = Math.floor(Math.random() * 1_000_000) + 1;
        const result = calculateCommission({
          serviceFeeCents,
          listingAgentId: AGENT_A,
          sellingAgentId: AGENT_A,
        });

        const total =
          result.agencyAmountCents +
          result.agentBreakdowns.reduce((sum, b) => sum + b.amountCents, 0);

        expect(total).toBe(serviceFeeCents);
      }
    });

    it('should never lose a cent across 100 random inputs (different agents)', () => {
      for (let i = 0; i < 100; i++) {
        const serviceFeeCents = Math.floor(Math.random() * 1_000_000) + 1;
        const result = calculateCommission({
          serviceFeeCents,
          listingAgentId: AGENT_A,
          sellingAgentId: AGENT_B,
        });

        const total =
          result.agencyAmountCents +
          result.agentBreakdowns.reduce((sum, b) => sum + b.amountCents, 0);

        expect(total).toBe(serviceFeeCents);
      }
    });

    it('should never produce negative breakdown amounts', () => {
      for (let i = 0; i < 100; i++) {
        const serviceFeeCents = Math.floor(Math.random() * 1_000_000) + 1;
        const isSame = Math.random() > 0.5;
        const result = calculateCommission({
          serviceFeeCents,
          listingAgentId: AGENT_A,
          sellingAgentId: isSame ? AGENT_A : AGENT_B,
        });

        expect(result.agencyAmountCents).toBeGreaterThanOrEqual(0);
        for (const breakdown of result.agentBreakdowns) {
          expect(breakdown.amountCents).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});
