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

        it('returns values sorted from best to worst match', () => {
            const { values } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions: ['taste', 'test', 'tst', 'completely different'],
            });
            // Exact match must come first; completely different must come last
            expect(values[0]).toBe('test');
            expect(values[values.length - 1]).toBe('completely different');
        });

        it('indices map each returned value back to its position in allSuggestions', () => {
            const allSuggestions = ['banana', 'test', 'testing', 'tset'];
            const { values, indices } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
            });
            for (let i = 0; i < values.length; i++) {
                expect(values[i]).toBe(allSuggestions[indices[i]]);
            }
        });

        it('exact code match ranks first regardless of description length', () => {
            // Integration-level regression: the same scenario that exposed the underlying
            // _getLevenshteinSimilarityDistance bug, exercised through _fuzzySuggestions.
            const exactMatch = 'CODE001 - A very long description that should not penalise the score';
            const { values } = _fuzzySuggestions({
                inputValue: 'CODE001',
                allSuggestions: ['CODE009 - Short', exactMatch],
            });
            expect(values[0]).toBe(exactMatch);
        });

        it('returns an empty result for an empty suggestion list', () => {
            const { values, indices } = _fuzzySuggestions({ inputValue: 'test', allSuggestions: [] });
            expect(values).toEqual([]);
            expect(indices).toEqual([]);
        });
    });

    describe('_getLevenshteinSimilarityDistance', () => {
        it('should return 0 for exact match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'test')).toBe(0);
        });

        it('returns 0 when input is an exact prefix of the target', () => {
            // With semi-global alignment the trailing characters in the target are free,
            // so "test" matching the start of "testing" scores identically to an exact match.
            expect(_getLevenshteinSimilarityDistance('test', 'testing')).toBe(0);
            expect(_getLevenshteinSimilarityDistance('CODE001', 'CODE001 - some description')).toBe(0);
        });

        it('should do simple fuzzy match', () => {
            expect(_getLevenshteinSimilarityDistance('test', 'tst')).toBeLessThan(
                _getLevenshteinSimilarityDistance('test', 'tt')
            );
        });

        it('should return a max distance for non-matching strings', () => {
            // 'exerci' (first 6 of 'exercise', after swap) shares no chars with 'banana'
            // → all 6 cells in the final row equal 6, so minDist = 6, secondaryScore = 0
            expect(_getLevenshteinSimilarityDistance('banana', 'exercise')).toBe(6);
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

        it('score increases monotonically with edit distance', () => {
            const oneEdit = _getLevenshteinSimilarityDistance('test', 'text');
            const twoEdits = _getLevenshteinSimilarityDistance('test', 'txxt');
            const threeEdits = _getLevenshteinSimilarityDistance('test', 'xxxt');
            expect(oneEdit).toBeLessThan(twoEdits);
            expect(twoEdits).toBeLessThan(threeEdits);
        });

        it('prefix match of target scores better than a non-prefix match with the same edit distance', () => {
            // "a" is a prefix of "ab" (0 edits) but not of "ba" (1 edit to reach "a").
            expect(_getLevenshteinSimilarityDistance('a', 'ab')).toBeLessThan(
                _getLevenshteinSimilarityDistance('a', 'ba')
            );
        });

        it('exact code match scores 0 regardless of description length', () => {
            // Key property introduced by the semi-global alignment fix: the length of the
            // trailing description must not penalise an otherwise-perfect code prefix match.
            const code = 'CODE001';
            const descriptions = [
                'Short',
                'Medium length description',
                'A moderately long description with several words in it',
                'A very very very long description that spans many many characters here and keeps going',
            ];
            for (const desc of descriptions) {
                expect(_getLevenshteinSimilarityDistance(code, `${code} - ${desc}`)).toBe(0);
            }
        });

        it('an exact code match with a long description beats a near-code match with a short description', () => {
            // Regression for: Rich Select fuzzy search selects wrong value when formatValue returns
            // longer display strings. The correct value had an exact code match but its formatted
            // string was longer, inflating the raw distance and making it lose to a shorter-formatted
            // near-match.
            const searchTerm = 'CODE001';
            const correctFormatted = 'CODE001 - A very long description that should not penalise the score';
            const wrongFormatted = 'CODE009 - Short'; // short description, different code

            expect(_getLevenshteinSimilarityDistance(searchTerm, correctFormatted)).toBeLessThan(
                _getLevenshteinSimilarityDistance(searchTerm, wrongFormatted)
            );
        });
    });
});
