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
            expect(values).toEqual(['test', 'taste', 'tst', 'completely different']);
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

        it('returns the exact prefix match when filterByPercentageOfBestMatch is set (AG-15499)', () => {
            // Regression: the percentage filter incorrectly removed the best match when it
            // scored 0 (exact prefix). It now correctly keeps only the exact prefix match and
            // trims the unrelated 'ag*' suggestions entirely.
            const allSuggestions = [
                'agTextCellEditor',
                'agTooltipComponent',
                'agNumberCellEditor',
                'agDateCellEditor',
                'agDateStringCellEditor',
                'agCheckboxCellEditor',
                'agSelectCellEditor',
                'agLargeTextCellEditor',
                'agTextColumnFilter',
                'agTextColumnFloatingFilter',
                'agNumberColumnFilter',
                'agNumberColumnFloatingFilter',
                'agDateColumnFilter',
                'agDateInput',
                'agDateColumnFloatingFilter',
                'agReadOnlyFloatingFilter',
                'agDragAndDropImage',
                'agAnimateShowChangeCellRenderer',
                'agAnimateSlideCellRenderer',
                'agGroupCellRenderer',
                'agCheckboxCellRenderer',
                'agColumnHeader',
                'agColumnGroupHeader',
                'agLoadingOverlay',
                'agNoRowsOverlay',
                'agSkeletonCellRenderer',
                'noFilter1',
            ];
            // 'zz' and 'vv' share no characters with 'noFilter' — they score at the maximum
            // possible distance (sourceLength = 8) so hideIrrelevant trims them because
            // 8 is not < max(2, 8). The ag* strings are long enough that their thresholds
            // are higher, so they survive hideIrrelevant.
            const irrelevant = ['zz', 'vv'];
            const allSuggestionsWithIrrelevant = [...allSuggestions, ...irrelevant];

            // hideIrrelevant trims 'zz'/'vv'; without filterByPercentageOfBestMatch all
            // remaining 27 suggestions are returned.
            const hideOnly = _fuzzySuggestions({
                inputValue: 'noFilter',
                allSuggestions: allSuggestionsWithIrrelevant,
                hideIrrelevant: true,
            });
            expect(hideOnly.values[0]).toBe('noFilter1');
            expect(hideOnly.values).not.toContain('zz');
            expect(hideOnly.values).not.toContain('vv');
            expect(hideOnly.values.length).toBe(allSuggestions.length);

            // filterByPercentageOfBestMatch with bestMatch = 0 keeps only exact prefix
            // matches (limit = 0 / 0.8 = 0). The ag* strings all score > 0 so they are
            // trimmed, leaving only 'noFilter1' regardless of hideIrrelevant.
            const withPercentFilter = _fuzzySuggestions({
                inputValue: 'noFilter',
                allSuggestions: allSuggestionsWithIrrelevant,
                hideIrrelevant: true,
                filterByPercentageOfBestMatch: 0.8,
            });
            expect(withPercentFilter.values).toEqual(['noFilter1']);

            const withPercentFilterNoHide = _fuzzySuggestions({
                inputValue: 'noFilter',
                allSuggestions: allSuggestionsWithIrrelevant,
                hideIrrelevant: false,
                filterByPercentageOfBestMatch: 0.8,
            });
            expect(withPercentFilterNoHide.values).toEqual(['noFilter1']);
        });

        it('filterByPercentageOfBestMatch trims far-off matches', () => {
            // 'zzzzzzzzz' shares no characters with 'abc' so its score is much higher than
            // 'abx'/'aby'. The filter keeps only suggestions within bestMatch / 0.8 of the
            // best score, which excludes 'zzzzzzzzz'.
            const allSuggestions = ['abx', 'aby', 'zzzzzzzzz'];
            const withFilter = _fuzzySuggestions({
                inputValue: 'abc',
                allSuggestions,
                filterByPercentageOfBestMatch: 0.8,
            });
            const withoutFilter = _fuzzySuggestions({ inputValue: 'abc', allSuggestions });
            expect(withoutFilter.values).toContain('zzzzzzzzz');
            expect(withFilter.values).not.toContain('zzzzzzzzz');
        });

        it('a higher percentage keeps fewer matches than a lower one', () => {
            // Scores for input "abcd":
            //   "abce"  ≈ 0.091  (1 edit, strong secondary score from shared "abc" prefix)
            //   "abyz"  ≈ 0.286  (2 edits, weaker secondary score)
            //   "wxyz"  = 4.0    (4 edits, no shared characters)
            //
            // limit = bestMatch / percentage, so a higher percentage produces a tighter limit:
            //   0.50 → limit ≈ 0.182  → only "abce" passes          (1 result)
            //   0.25 → limit ≈ 0.364  → "abce" and "abyz" pass      (2 results)
            //   0.02 → limit ≈ 4.55   → all three pass              (3 results)
            const allSuggestions = ['abce', 'abyz', 'wxyz'];
            const strict = _fuzzySuggestions({
                inputValue: 'abcd',
                allSuggestions,
                filterByPercentageOfBestMatch: 0.5,
            });
            const medium = _fuzzySuggestions({
                inputValue: 'abcd',
                allSuggestions,
                filterByPercentageOfBestMatch: 0.25,
            });
            const lenient = _fuzzySuggestions({
                inputValue: 'abcd',
                allSuggestions,
                filterByPercentageOfBestMatch: 0.02,
            });

            expect(strict.values).toEqual(['abce']);
            expect(medium.values).toEqual(['abce', 'abyz']);
            expect(lenient.values).toEqual(['abce', 'abyz', 'wxyz']);
        });

        it('higher percentage is stricter', () => {
            const allSuggestions = [
                'agTextCellEditor',
                'agTooltipComponent',
                'agNumberCellEditor',
                'agDateCellEditor',
                'agDateStringCellEditor',
                'agCheckboxCellEditor',
                'agSelectCellEditor',
                'agLargeTextCellEditor',
                'agTextColumnFilter',
                'agTextColumnFloatingFilter',
                'agNumberColumnFilter',
                'agNumberColumnFloatingFilter',
                'agDateColumnFilter',
                'agDateInput',
                'agDateColumnFloatingFilter',
                'agReadOnlyFloatingFilter',
                'agDragAndDropImage',
                'agAnimateShowChangeCellRenderer',
                'agAnimateSlideCellRenderer',
                'agGroupCellRenderer',
                'agCheckboxCellRenderer',
                'agColumnHeader',
                'agColumnGroupHeader',
                'agLoadingOverlay',
                'agNoRowsOverlay',
                'agSkeletonCellRenderer',
                'noFilter1',
            ];

            const fiftyPercent = _fuzzySuggestions({
                inputValue: 'agCell',
                allSuggestions,
                filterByPercentageOfBestMatch: 0.5,
            });

            expect(fiftyPercent.values).toEqual([
                'agSelectCellEditor',
                'agColumnHeader',
                'agColumnGroupHeader',
                'agSkeletonCellRenderer',
                'agCheckboxCellEditor',
                'agCheckboxCellRenderer',
            ]);

            const ninetyPercent = _fuzzySuggestions({
                inputValue: 'agCell',
                allSuggestions,
                filterByPercentageOfBestMatch: 0.9,
            });
            expect(ninetyPercent.values).toEqual(['agSelectCellEditor']);
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

        it('an exact code match with different description lengths respects input order', () => {
            const searchTerm = 'CODE001';
            const longDescription = 'CODE001 - A long description';
            const longerDescription = 'CODE001 - A very long description';
            const shortDescription = 'CODE001 - Short';
            const wrongFormatted = 'CODE111 - Wrong';

            expect(
                _fuzzySuggestions({
                    inputValue: searchTerm,
                    allSuggestions: [longDescription, shortDescription, wrongFormatted, longerDescription],
                }).values
            ).toEqual([longDescription, shortDescription, longerDescription, wrongFormatted]);

            expect(
                _fuzzySuggestions({
                    inputValue: searchTerm,
                    allSuggestions: [longerDescription, longDescription, wrongFormatted, shortDescription],
                }).values
            ).toEqual([longerDescription, longDescription, shortDescription, wrongFormatted]);
        });
    });
});
