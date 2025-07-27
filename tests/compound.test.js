import { describe, it, expect } from 'vitest';
import { calculateCompoundInterest } from '../compound';

describe('calculateCompoundInterest', () => {
    it('should calculate correctly with one 1-year monthly contribution period', () => {
        const formData = {
            startAmount: 1000,
            contributionTiming: 'end',
            contributions: [{
                duration: 1, // 1 year
                amount: 100, // monthly
                frequency: 12,
                interestRate: 12, // 12% annually
                compoundingFrequency: 12 // monthly compounding
            }]
        };

        const result = calculateCompoundInterest(formData);
        const lastYear = result.yearlyData[result.yearlyData.length - 1];

        expect(result.yearlyData.length).toBe(2); // Year 0 and Year 1
        expect(result.totalContributions).toBe(1200);
        expect(result.finalBalance).toBeGreaterThan(2200); // Because of interest
    });

    it('should calculate correctly with contribution at the beginning of the period', () => {
        const formData = {
            startAmount: 1000,
            contributionTiming: 'beginning',
            contributions: [{
                duration: 1,
                amount: 100,
                frequency: 12,
                interestRate: 12,
                compoundingFrequency: 12
            }]
        };

        const result = calculateCompoundInterest(formData);
        expect(result.totalContributions).toBe(1200);
        expect(result.finalBalance).toBeGreaterThan(2200);
    });

    it('should return just the start amount if no contributions are made', () => {
        const formData = {
            startAmount: 1000,
            contributionTiming: 'end',
            contributions: [{
                duration: 0,
                amount: 0,
                frequency: 12,
                interestRate: 0,
                compoundingFrequency: 12
            }]
        };

        const result = calculateCompoundInterest(formData);
        expect(result.finalBalance).toBe(1000);
        expect(result.totalContributions).toBe(0);
    });
});

