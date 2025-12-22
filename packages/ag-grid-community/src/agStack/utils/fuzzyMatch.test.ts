import { _fuzzySuggestions, _getLevenshteinSimilarityDistance } from './fuzzyMatch';

describe('fuzzyMatch.ts', () => {
    describe('_fuzzySuggestions', () => {
        it("shouldn't filter out exact matches", () => {
            const suggestions = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions: ['test', 'tst', 'tst str'],
                hideIrrelevant: true,
            });
            expect(suggestions.values).toEqual(['test', 'tst', 'tst str']);
        });
    });

    describe('_getLevenshteinSimilarityDistance', () => {
        it('should return 0 for exact match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'test')).toBe(0);
        });

        it('should do simple fuzzy match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'tst')).toBeLessThan(
                _getLevenshteinSimilarityDistance('test', 'tt')
            );
        });

        it('should return a max distance for non-matching strings', () => {
            expect(_getLevenshteinSimilarityDistance('banana', 'exercise')).toBe(8);
        });

        it('should handle different case', () => {
            expect(_getLevenshteinSimilarityDistance('Test', 'tst')).toBeGreaterThan(
                _getLevenshteinSimilarityDistance('test', 'tst')
            );
        });

        it('should return lower score for matching substrings', () => {
            expect(_getLevenshteinSimilarityDistance('test string', 'tst str')).toBeLessThan(
                _getLevenshteinSimilarityDistance('test string', 'absolutely different')
            );
        });

        it('favours matches at the start of the string', () => {
            const input = `${'a'.repeat(20)}abcd efgj`;
            expect(_getLevenshteinSimilarityDistance(input, 'abcd')).toBeLessThan(
                _getLevenshteinSimilarityDistance(input, 'efgj')
            );
        });

        it('favours consecutive matches', () => {
            expect(_getLevenshteinSimilarityDistance(' 12345', '12345')).toBeLessThan(
                _getLevenshteinSimilarityDistance('123_45', '12345')
            );
        });
    });
});
