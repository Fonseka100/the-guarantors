import { describe, it, expect } from '@jest/globals';
import {
  normalizeStreet,
  normalizeCity,
  normalizeState,
  normalizeZipCode,
  normalizeNumber,
} from '../../src/utils/addressNormalizer.js';

describe('addressNormalizer', () => {
  describe('normalizeStreet', () => {
    it('should normalize street name with abbreviations', () => {
      expect(normalizeStreet('main street')).toBe('Main St');
      expect(normalizeStreet('oak avenue')).toBe('Oak Ave');
      expect(normalizeStreet('parkway drive')).toBe('Parkway Dr');
      expect(normalizeStreet('first boulevard')).toBe('First Blvd');
    });

    it('should handle already normalized streets', () => {
      expect(normalizeStreet('Main Street')).toBe('Main St');
      expect(normalizeStreet('Oak Avenue')).toBe('Oak Ave');
    });

    it('should handle empty or null input', () => {
      expect(normalizeStreet('')).toBe('');
      expect(normalizeStreet(null)).toBe('');
      expect(normalizeStreet(undefined)).toBe('');
    });

    it('should capitalize words correctly', () => {
      expect(normalizeStreet('washington street')).toBe('Washington St');
      expect(normalizeStreet('new york avenue')).toBe('New York Ave');
    });
  });

  describe('normalizeCity', () => {
    it('should normalize city name to title case', () => {
      expect(normalizeCity('new york')).toBe('New York');
      expect(normalizeCity('los angeles')).toBe('Los Angeles');
      expect(normalizeCity('san francisco')).toBe('San Francisco');
    });

    it('should handle regular city names', () => {
      expect(normalizeCity('chicago')).toBe('Chicago');
      expect(normalizeCity('boston')).toBe('Boston');
      expect(normalizeCity('seattle')).toBe('Seattle');
    });

    it('should handle empty or null input', () => {
      expect(normalizeCity('')).toBe('');
      expect(normalizeCity(null)).toBe('');
      expect(normalizeCity(undefined)).toBe('');
    });
  });

  describe('normalizeState', () => {
    it('should convert full state name to abbreviation', () => {
      expect(normalizeState('california')).toBe('CA');
      expect(normalizeState('new york')).toBe('NY');
      expect(normalizeState('texas')).toBe('TX');
      expect(normalizeState('florida')).toBe('FL');
    });

    it('should handle already abbreviated states', () => {
      expect(normalizeState('ca')).toBe('CA');
      expect(normalizeState('NY')).toBe('NY');
      expect(normalizeState('tx')).toBe('TX');
    });

    it('should handle empty or null input', () => {
      expect(normalizeState('')).toBe('');
      expect(normalizeState(null)).toBe('');
      expect(normalizeState(undefined)).toBe('');
    });

    it('should handle multi-word states', () => {
      expect(normalizeState('new hampshire')).toBe('NH');
      expect(normalizeState('north carolina')).toBe('NC');
      expect(normalizeState('south dakota')).toBe('SD');
    });
  });

  describe('normalizeZipCode', () => {
    it('should extract first 5 digits', () => {
      expect(normalizeZipCode('94043')).toBe('94043');
      expect(normalizeZipCode('94043-1234')).toBe('94043');
      expect(normalizeZipCode('10001')).toBe('10001');
    });

    it('should remove non-digit characters', () => {
      expect(normalizeZipCode('94043-1234')).toBe('94043');
      expect(normalizeZipCode('10001-0001')).toBe('10001');
    });

    it('should handle short zip codes', () => {
      expect(normalizeZipCode('123')).toBe('123');
      expect(normalizeZipCode('12')).toBe('12');
    });

    it('should handle empty or null input', () => {
      expect(normalizeZipCode('')).toBe('');
      expect(normalizeZipCode(null)).toBe('');
      expect(normalizeZipCode(undefined)).toBe('');
    });
  });

  describe('normalizeNumber', () => {
    it('should trim street numbers', () => {
      expect(normalizeNumber('1600')).toBe('1600');
      expect(normalizeNumber('  123  ')).toBe('123');
      expect(normalizeNumber('42')).toBe('42');
    });

    it('should handle empty or null input', () => {
      expect(normalizeNumber('')).toBe('');
      expect(normalizeNumber(null)).toBe('');
      expect(normalizeNumber(undefined)).toBe('');
    });
  });
});
