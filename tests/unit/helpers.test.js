describe('Helper Functions', () => {
  // Extract last 4 digits of card - from pos.js (line 221)
  function getCardLast4(cardNo) {
    if (!cardNo || cardNo.length < 4) return '';
    return cardNo.slice(-4);
  }

  // Generate fake token - from pos.js (line 222)
  function generateFakeToken() {
    return 'tok_' + Math.random().toString(36).substring(2, 15);
  }

  describe('Card Last 4 Extraction (POS)', () => {
    test('extracts last 4 digits from 16-digit card', () => {
      expect(getCardLast4('1234567890123456')).toBe('3456');
    });

    test('extracts last 4 digits from card with spaces', () => {
      expect(getCardLast4('1234 5678 9012 3456')).toBe('3456');
    });

    test('handles exactly 4 digits', () => {
      expect(getCardLast4('1234')).toBe('1234');
    });

    test('returns empty for card shorter than 4', () => {
      expect(getCardLast4('123')).toBe('');
    });

    test('returns empty for empty string', () => {
      expect(getCardLast4('')).toBe('');
    });

    test('returns empty for null', () => {
      expect(getCardLast4(null)).toBe('');
    });
  });

  describe('Token Generation (POS)', () => {
    test('generates token with correct prefix', () => {
      const token = generateFakeToken();
      expect(token.startsWith('tok_')).toBe(true);
    });

    test('generates token with random suffix', () => {
      const token = generateFakeToken();
      expect(token.length).toBeGreaterThan(4);
    });

    test('generates unique tokens', () => {
      const token1 = generateFakeToken();
      const token2 = generateFakeToken();
      expect(token1).not.toBe(token2);
    });

    test('token format is correct', () => {
      const token = generateFakeToken();
      expect(token).toMatch(/^tok_[a-z0-9]+$/);
    });
  });
});