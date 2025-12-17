import { describe, it, expect } from '@jest/globals';
import { isValidNonEmptyString, isValidString } from '../../src/utils/validation.js';

describe('validation', () => {
  describe('isValidNonEmptyString', () => {
    it('should return true for non-empty string', () => {
      expect(isValidNonEmptyString('hello')).toBe(true);
      expect(isValidNonEmptyString('test string')).toBe(true);
      expect(isValidNonEmptyString('a')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidNonEmptyString('')).toBe(false);
    });

    it('should return false for string with only whitespace', () => {
      expect(isValidNonEmptyString('   ')).toBe(false);
      expect(isValidNonEmptyString('\t')).toBe(false);
      expect(isValidNonEmptyString('\n')).toBe(false);
      expect(isValidNonEmptyString(' \t \n ')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidNonEmptyString(null)).toBe(false);
      expect(isValidNonEmptyString(undefined)).toBe(false);
      expect(isValidNonEmptyString(123)).toBe(false);
      expect(isValidNonEmptyString(0)).toBe(false);
      expect(isValidNonEmptyString(true)).toBe(false);
      expect(isValidNonEmptyString(false)).toBe(false);
      expect(isValidNonEmptyString({})).toBe(false);
      expect(isValidNonEmptyString([])).toBe(false);
    });

    it('should return true for string with leading/trailing whitespace but content', () => {
      expect(isValidNonEmptyString('  hello  ')).toBe(true);
      expect(isValidNonEmptyString('\ttest\n')).toBe(true);
    });
  });

  describe('isValidString', () => {
    it('should return true for any string', () => {
      expect(isValidString('hello')).toBe(true);
      expect(isValidString('')).toBe(true);
      expect(isValidString('   ')).toBe(true);
      expect(isValidString('test string')).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(isValidString(null)).toBe(false);
      expect(isValidString(undefined)).toBe(false);
      expect(isValidString(123)).toBe(false);
      expect(isValidString(0)).toBe(false);
      expect(isValidString(true)).toBe(false);
      expect(isValidString(false)).toBe(false);
      expect(isValidString({})).toBe(false);
      expect(isValidString([])).toBe(false);
    });
  });
});
