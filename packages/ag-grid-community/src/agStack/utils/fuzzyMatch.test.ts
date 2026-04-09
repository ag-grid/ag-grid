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
            expect(values).toEqual(['test', 'tst', 'taste', 'completely different']);
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

        it('exact prefix match ranks first with hideIrrelevant and maxSuggestions (AG-15499)', () => {
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

            // hideIrrelevant trims 'zz'/'vv'; without maxSuggestions all
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

            // maxSuggestions: 1 keeps only the best match ('noFilter1')
            // regardless of hideIrrelevant.
            const withMaxSuggestions = _fuzzySuggestions({
                inputValue: 'noFilter',
                allSuggestions: allSuggestionsWithIrrelevant,
                hideIrrelevant: true,
                maxSuggestions: 1,
            });
            expect(withMaxSuggestions.values).toEqual(['noFilter1']);

            const withMaxSuggestionsNoHide = _fuzzySuggestions({
                inputValue: 'noFilter',
                allSuggestions: allSuggestionsWithIrrelevant,
                hideIrrelevant: false,
                maxSuggestions: 1,
            });
            expect(withMaxSuggestionsNoHide.values).toEqual(['noFilter1']);
        });

        it('maxSuggestions limits the number of returned values', () => {
            const allSuggestions = ['test', 'tester', 'testing', 'tested', 'toast'];
            const { values } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                maxSuggestions: 2,
            });
            expect(values).toHaveLength(2);
            expect(values[0]).toBe('test');
        });

        it('maxSuggestions works together with hideIrrelevant', () => {
            const allSuggestions = ['test', 'tester', 'zzz', 'testing'];
            const { values } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                hideIrrelevant: true,
                maxSuggestions: 2,
            });
            expect(values).toHaveLength(2);
            expect(values).not.toContain('zzz');
        });

        it('maxSuggestions returns all results when limit exceeds matches', () => {
            const allSuggestions = ['abc', 'abd'];
            const { values } = _fuzzySuggestions({
                inputValue: 'abc',
                allSuggestions,
                maxSuggestions: 10,
            });
            expect(values).toEqual(['abc', 'abd']);
        });

        it('fuzzy search for "duct" ranks substring matches appropriately', () => {
            // Rich Select scenario: equipment codes with descriptions, searching for 'duct'.
            // Entries containing the exact substring 'DUCT' should rank above fuzzy matches.
            const allSuggestions = [
                'LCDD00 DUST DETECTOR',
                'PSCI00 CONDUCTIVITY INDICATOR',
                'ERCD01 RESIDUAL CURRENT DEVICE',
                'TCID00 INTRUDER DETECTION',
                'HAHAY00 HYDRAULIC HATCH',
                'HVAC03 HVAC DUCT',
                'HVAC07 HVAC DUCT FLOW SWITCH',
            ];
            const { values } = _fuzzySuggestions({
                inputValue: 'duct',
                allSuggestions,
                hideIrrelevant: true,
            });
            expect(values).toEqual([
                'PSCI00 CONDUCTIVITY INDICATOR',
                'HVAC03 HVAC DUCT',
                'HVAC07 HVAC DUCT FLOW SWITCH',
                'LCDD00 DUST DETECTOR',
                'TCID00 INTRUDER DETECTION',
                'ERCD01 RESIDUAL CURRENT DEVICE',
            ]);
        });

        it('returns an empty result for an empty suggestion list', () => {
            const { values, indices } = _fuzzySuggestions({ inputValue: 'test', allSuggestions: [] });
            expect(values).toEqual([]);
            expect(indices).toEqual([]);
        });

        it('returns all suggestions when inputValue is empty', () => {
            const allSuggestions = ['apple', 'banana', 'cherry'];
            const { values } = _fuzzySuggestions({ inputValue: '', allSuggestions });
            expect(values).toHaveLength(3);
        });

        it('maxSuggestions of 0 returns all results', () => {
            const allSuggestions = ['test', 'tester', 'testing'];
            const { values } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                maxSuggestions: 0,
            });
            expect(values).toHaveLength(3);
        });

        it('negative maxSuggestions returns all results', () => {
            const allSuggestions = ['test', 'tester', 'testing'];
            const { values } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                maxSuggestions: -1,
            });
            expect(values).toHaveLength(3);
        });

        it('preserves input order for items with equal non-zero relevance', () => {
            // 'xyz' and 'xyw' have similar edit distance from 'abc' — neither is a substring
            // match, so they go through Levenshtein. With equal scores the original order
            // should be preserved.
            const allSuggestions = ['xyz', 'xyw'];
            const { values } = _fuzzySuggestions({ inputValue: 'abc', allSuggestions });
            expect(values).toEqual(['xyz', 'xyw']);
        });

        it('hideIrrelevant with a very short inputValue filters almost nothing', () => {
            // Threshold is max(suggestion.value.length, 1). For longer suggestions the
            // threshold is high, so they survive. Only a suggestion shorter than or equal
            // to the input whose distance >= its own length would be removed.
            const allSuggestions = ['apple', 'banana', 'cherry', 'a'];
            const { values } = _fuzzySuggestions({
                inputValue: 'a',
                allSuggestions,
                hideIrrelevant: true,
            });
            // 'a' is a prefix of 'apple' → distance 0, well under threshold
            expect(values).toContain('apple');
            expect(values).toContain('a');
        });

        it('indices are correct after hideIrrelevant filtering', () => {
            const allSuggestions = ['test', 'zzz', 'tester'];
            const { values, indices } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                hideIrrelevant: true,
            });
            for (let i = 0; i < values.length; i++) {
                expect(values[i]).toBe(allSuggestions[indices[i]]);
            }
        });

        it('indices are correct after maxSuggestions truncation', () => {
            const allSuggestions = ['banana', 'test', 'testing', 'tset', 'toast'];
            const { values, indices } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                maxSuggestions: 3,
            });
            expect(values).toHaveLength(3);
            for (let i = 0; i < values.length; i++) {
                expect(values[i]).toBe(allSuggestions[indices[i]]);
            }
        });

        it('exact match ranks first even when it appears late in a sorted value list (AG-14163)', () => {
            // Regression: when the value list was sorted alphabetically, 'CO' fell to
            // index 5 (after all 'BR Power...' entries). A bug caused one of the longer
            // 'BR Power...' strings to score better than the exact match 'CO', so 'CO'
            // was no longer the first highlighted result.
            const allSuggestions = [
                'CO',
                'ETF',
                'BR Power North East Con',
                'BR Power South East Con',
                'BR Power North Con',
                'BR Power South Con',
                'BR Power North East I50',
            ].sort(); // sorts 'CO' to index 5, after all 'BR Power' entries

            const { values } = _fuzzySuggestions({
                inputValue: 'CO',
                allSuggestions,
                hideIrrelevant: true,
            });
            expect(values[0]).toBe('CO');
        });

        it('uppercase input ranks exact match first (AG-14560 TC1)', () => {
            // Regression: searching 'CO' in uppercase showed 'C3' as the top result
            // instead of the exact match 'CO'. Lowercase 'co' worked correctly.
            const allSuggestions = [
                'CO',
                'ETF',
                'C3',
                'E3',
                'BR Power North East Con',
                'BR Power South East Con',
                'BR Power North Con',
                'BR Power South Con',
                'BR Power North East I50',
            ];
            const { values: upperValues } = _fuzzySuggestions({
                inputValue: 'CO',
                allSuggestions,
                hideIrrelevant: true,
            });
            expect(upperValues[0]).toBe('CO');

            const { values: lowerValues } = _fuzzySuggestions({
                inputValue: 'co',
                allSuggestions,
                hideIrrelevant: true,
            });
            expect(lowerValues[0]).toBe('CO');
        });

        it('uppercase input ranks exact match first (AG-14560 TC2)', () => {
            // Regression: searching 'TEST' in uppercase showed 'DEF' before 'TEST'.
            // Lowercase 'test' worked correctly.
            const allSuggestions = ['TEST', 'ABC', 'DEF', 'GHI'];

            const { values: upperValues } = _fuzzySuggestions({
                inputValue: 'TEST',
                allSuggestions,
                hideIrrelevant: true,
            });
            expect(upperValues[0]).toBe('TEST');

            const { values: lowerValues } = _fuzzySuggestions({
                inputValue: 'test',
                allSuggestions,
                hideIrrelevant: true,
            });
            expect(lowerValues[0]).toBe('TEST');
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
            // 'banana' (6) and 'exercise' (8) share no characters — the standard
            // Levenshtein distance is 8 (6 replacements + 2 deletions), secondaryScore = 0.
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

        it('returns 0 for both strings empty', () => {
            expect(_getLevenshteinSimilarityDistance('', '')).toBe(0);
        });

        it('returns source length for empty target', () => {
            expect(_getLevenshteinSimilarityDistance('test', '')).toBe(4);
            expect(_getLevenshteinSimilarityDistance('a', '')).toBe(1);
        });

        it('returns target length for empty source', () => {
            // An empty source requires inserting every character of the target.
            expect(_getLevenshteinSimilarityDistance('', 'hello')).toBe(5);
            expect(_getLevenshteinSimilarityDistance('', 'a')).toBe(1);
        });

        it('non-prefix substring match scores based on position', () => {
            // Substring at position 0 (prefix) → 0
            expect(_getLevenshteinSimilarityDistance('duct', 'duct HVAC')).toBe(0);
            // Substring at position 5 → 5 * 0.01 = 0.05
            expect(_getLevenshteinSimilarityDistance('duct', 'HVAC DUCT')).toBeCloseTo(0.05, 5);
            // A later position scores worse than an earlier one
            expect(_getLevenshteinSimilarityDistance('test', 'atest')).toBeGreaterThan(
                _getLevenshteinSimilarityDistance('test', 'testing')
            );
        });

        it('transposition scores worse than exact match but better than fully different', () => {
            const exact = _getLevenshteinSimilarityDistance('ab', 'ab');
            const transposed = _getLevenshteinSimilarityDistance('ab', 'ba');
            const different = _getLevenshteinSimilarityDistance('ab', 'zz');
            expect(exact).toBeLessThan(transposed);
            expect(transposed).toBeLessThan(different);
        });

        it('earlyMatchLimit bonus does not apply for short strings', () => {
            // For sourceLength=4, earlyMatchLimit = 4/2 - 10 = -8, so the bonus never fires.
            // Both should still produce valid scores without errors.
            const score = _getLevenshteinSimilarityDistance('abcd', 'abxd');
            expect(score).toBeGreaterThan(0);
        });

        it('earlyMatchLimit bonus applies for long strings', () => {
            // For sourceLength=30, earlyMatchLimit = 30/2 - 10 = 5. The bonus fires for
            // i < 5 (first 4 characters). Verify this by comparing two targets that differ
            // only in whether their matching characters fall within the bonus window.
            // Use a source where the early chars differ between the two targets.
            const source = 'abcde' + 'x'.repeat(25);
            // target1 matches the first 5 chars (within the bonus window) but diverges after
            const target1 = 'abcde' + 'y'.repeat(25);
            // target2 has the same number of matching characters but they appear later
            const target2 = 'y'.repeat(25) + 'abcde';
            expect(_getLevenshteinSimilarityDistance(source, target1)).toBeLessThan(
                _getLevenshteinSimilarityDistance(source, target2)
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
