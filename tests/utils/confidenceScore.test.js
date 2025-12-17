import { describe, it, expect } from '@jest/globals';
import {
  calculateConfidence,
  mapGoogleLocationTypeToAccuracy,
} from '../../src/utils/confidenceScore.js';

describe('confidenceScore', () => {
  describe('mapGoogleLocationTypeToAccuracy', () => {
    it('should map ROOFTOP to 1.0', () => {
      expect(mapGoogleLocationTypeToAccuracy('ROOFTOP')).toBe(1.0);
    });

    it('should map RANGE_INTERPOLATED to 0.85', () => {
      expect(mapGoogleLocationTypeToAccuracy('RANGE_INTERPOLATED')).toBe(0.85);
    });

    it('should map GEOMETRIC_CENTER to 0.7', () => {
      expect(mapGoogleLocationTypeToAccuracy('GEOMETRIC_CENTER')).toBe(0.7);
    });

    it('should map APPROXIMATE to 0.5', () => {
      expect(mapGoogleLocationTypeToAccuracy('APPROXIMATE')).toBe(0.5);
    });

    it('should return default value for unknown types', () => {
      expect(mapGoogleLocationTypeToAccuracy('UNKNOWN')).toBe(0.3);
      expect(mapGoogleLocationTypeToAccuracy('')).toBe(0.3);
    });
  });

  describe('calculateConfidence', () => {
    it('should return high confidence for perfect match', () => {
      const result = calculateConfidence({
        hasAllComponents: true,
        googleAccuracy: 1.0,
        isExactMatch: true,
        componentMatchRatio: 1.0,
      });
      expect(result).toBeGreaterThan(0.9);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should return lower confidence for missing components', () => {
      const result = calculateConfidence({
        hasAllComponents: false,
        googleAccuracy: 1.0,
        isExactMatch: true,
        componentMatchRatio: 0.5,
      });
      expect(result).toBeLessThan(0.9);
    });

    it('should return lower confidence for approximate location', () => {
      const result = calculateConfidence({
        hasAllComponents: true,
        googleAccuracy: 0.5,
        isExactMatch: false,
        componentMatchRatio: 0.8,
      });
      expect(result).toBeLessThan(0.8);
    });

    it('should return confidence between 0 and 1', () => {
      const result = calculateConfidence({
        hasAllComponents: false,
        googleAccuracy: 0.3,
        isExactMatch: false,
        componentMatchRatio: 0.2,
      });
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle all components present but not exact match', () => {
      const result = calculateConfidence({
        hasAllComponents: true,
        googleAccuracy: 0.85,
        isExactMatch: false,
        componentMatchRatio: 0.9,
      });
      expect(result).toBeGreaterThan(0.7);
    });
  });
});
