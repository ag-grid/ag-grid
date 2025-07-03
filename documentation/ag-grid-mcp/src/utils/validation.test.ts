import { describe, it, expect } from 'vitest';
import { validateFramework, validateVersion, validateFeatureName } from './validation.js';

describe('Validation Utils', () => {
  describe('validateFramework', () => {
    it('should validate valid frameworks', () => {
      expect(validateFramework('react')).toBe('react');
      expect(validateFramework('angular')).toBe('angular');
      expect(validateFramework('vue')).toBe('vue');
      expect(validateFramework('vanilla')).toBe('vanilla');
    });

    it('should throw error for invalid frameworks', () => {
      expect(() => validateFramework('invalid')).toThrow('Invalid framework');
      expect(() => validateFramework('')).toThrow('Invalid framework');
      expect(() => validateFramework(null)).toThrow('Invalid framework');
    });
  });

  describe('validateVersion', () => {
    it('should validate valid version strings', () => {
      expect(validateVersion('34.0.0')).toBe('34.0.0');
      expect(validateVersion('33.2.1')).toBe('33.2.1');
      expect(validateVersion('1.0.0-beta')).toBe('1.0.0-beta');
    });

    it('should return undefined for null/undefined', () => {
      expect(validateVersion(undefined)).toBeUndefined();
      expect(validateVersion(null)).toBeUndefined();
    });

    it('should throw error for invalid version formats', () => {
      expect(() => validateVersion('invalid')).toThrow('Version must be in semantic version format');
      expect(() => validateVersion('1.0')).toThrow('Version must be in semantic version format');
      expect(() => validateVersion('1')).toThrow('Version must be in semantic version format');
    });
  });

  describe('validateFeatureName', () => {
    it('should validate valid feature names', () => {
      expect(validateFeatureName('row-selection')).toBe('row-selection');
      expect(validateFeatureName('sorting')).toBe('sorting');
      expect(validateFeatureName('filtering')).toBe('filtering');
    });

    it('should throw error for invalid feature names', () => {
      expect(() => validateFeatureName('invalid-feature')).toThrow('Unknown feature');
      expect(() => validateFeatureName('')).toThrow('Unknown feature');
      expect(() => validateFeatureName(123)).toThrow('Feature name must be a string');
    });
  });
});