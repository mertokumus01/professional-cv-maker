// Sanitizer utility tests
const {
  sanitizeString,
  sanitizeEmail,
  sanitizeURL,
  sanitizeObject,
} = require('../../src/utils/sanitizer');

describe('Sanitizer Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove XSS script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove HTML tags', () => {
      const input = '<b>Bold</b> text';
      const result = sanitizeString(input);
      expect(result).toBe('Bold text');
    });

    it('should handle normal text', () => {
      const input = 'Normal text with no HTML';
      const result = sanitizeString(input);
      expect(result).toBe('Normal text with no HTML');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });

    it('should remove event handlers', () => {
      const input = '<img src=x onerror="alert(\'XSS\')">';
      const result = sanitizeString(input);
      expect(result).not.toContain('onerror');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase email', () => {
      const result = sanitizeEmail('TEST@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });

    it('should remove whitespace', () => {
      const result = sanitizeEmail(' test@example.com ');
      expect(result).toBe('test@example.com');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(undefined)).toBe('');
    });

    it('should remove special characters', () => {
      const result = sanitizeEmail('test+tag@example.com');
      expect(result).toContain('@');
      expect(result).toContain('example');
    });
  });

  describe('sanitizeURL', () => {
    it('should parse valid URL', () => {
      const input = 'https://example.com/path';
      const result = sanitizeURL(input);
      expect(result).toContain('https://');
    });

    it('should handle invalid URL', () => {
      const result = sanitizeURL('not a url');
      expect(result).toBe('');
    });

    it('should handle javascript: protocol', () => {
      const result = sanitizeURL('javascript:alert("XSS")');
      expect(result).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize nested object strings', () => {
      const input = {
        name: '<script>alert("test")</script>John',
        email: 'john@example.com',
      };
      const result = sanitizeObject(input);
      expect(result.name).not.toContain('<script>');
    });

    it('should sanitize arrays', () => {
      const input = ['<b>Bold</b>', 'Normal'];
      const result = sanitizeObject(input);
      expect(result[0]).not.toContain('<b>');
    });

    it('should handle deeply nested objects', () => {
      const input = {
        user: {
          profile: {
            bio: '<img src=x onerror="alert()">My Bio',
          },
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.profile.bio).not.toContain('onerror');
    });

    it('should preserve numbers and booleans', () => {
      const input = {
        age: 25,
        active: true,
        score: 95.5,
      };
      const result = sanitizeObject(input);
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
      expect(result.score).toBe(95.5);
    });

    it('should handle null values', () => {
      const input = {
        name: 'John',
        middle: null,
        last: 'Doe',
      };
      const result = sanitizeObject(input);
      expect(result.middle).toBe(null);
    });
  });
});
