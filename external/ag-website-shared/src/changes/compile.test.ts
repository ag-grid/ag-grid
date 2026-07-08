import type { Changelogs, TransitionFacts } from './change-types';
import { compileChangelogs, compileDetectWords } from './compile';

describe('compileDetectWords', () => {
    function patternOf(word: string): RegExp {
        return new RegExp(compileDetectWords(word)![0].source);
    }

    test('word boundaries are required only at identifier-character edges', () => {
        expect(patternOf('createGrid').test('agGrid.createGrid(options)')).toBe(true);
        expect(patternOf('createGrid').test('recreateGridX')).toBe(false);
        // hyphens are boundaries, so entries match within larger hyphenated class names
        expect(patternOf('ag-body').test('.ag-body-viewport {')).toBe(true);
        expect(patternOf('ag-body').test('drag-body')).toBe(false);
        // non-identifier edges make prefix and phrase entries work
        expect(patternOf('ag-theme-').test('class="ag-theme-quartz"')).toBe(true);
        expect(patternOf('new Grid(').test('new Grid(element, options)')).toBe(true);
        // regex metacharacters in words are escaped
        expect(patternOf('foo.bar()').test('fooXbarYZ')).toBe(false);
    });

    test('multiple words compile to a single alternation; no words compile to undefined', () => {
        const compiled = compileDetectWords(['columnApi', 'getColumnApi']);
        expect(compiled).toHaveLength(1);
        expect(new RegExp(compiled![0].source).test('getColumnApi()')).toBe(true);
        expect(compileDetectWords(null)).toBeUndefined();
        expect(compileDetectWords([])).toBeUndefined();
    });
});

describe('compileChangelogs', () => {
    const columnApi: TransitionFacts = {
        oldApi: 'the `columnApi` object',
        newApi: 'the Grid API',
        detectWords: 'columnApi',
        mitigation: 'Replace `columnApi.x(...)` with `api.x(...)`.',
    };
    const legacyThemes: TransitionFacts = {
        oldApi: 'Legacy Themes',
        newApi: 'the Theming API',
        detectWords: null,
        mitigation: null,
    };
    const changelogs: Changelogs = {
        '31': {
            deprecations: { columnApi, legacyThemes },
            behaviourChanges: [
                {
                    title: 'The page size selector is shown by default',
                    detectWords: null,
                    mitigation: 'Set `paginationPageSizeSelector: false`.',
                },
            ],
        },
        '32.2': {
            removalsAfterDeprecation: [columnApi],
            removalsWithoutDeprecation: [
                {
                    oldApi: 'the `ChartType` enum',
                    newApi: 'string literal chart types',
                    detectWords: 'ChartType',
                    mitigation: null,
                },
            ],
            dependencyChanges: [
                { dependency: 'typescript', minVersion: '5.1', reason: 'Required by generated types.' },
            ],
        },
    };

    test('joins deprecations to removals by object identity, with explicit zero-filled versions', () => {
        const { changes } = compileChangelogs(changelogs);

        expect(changes.find((change) => change.id === 'columnApi')).toMatchObject({
            type: 'transition',
            deprecatedFrom: '31.0.0',
            removedFrom: '32.2.0',
            detectPatterns: [{ source: '\\bcolumnApi\\b', flags: '' }],
        });

        // a pending deprecation has no removedFrom
        const pending = changes.find((change) => change.id === 'legacyThemes');
        expect((pending as { removedFrom?: string }).removedFrom).toBeUndefined();

        // a removal without deprecation has neither deprecatedFrom nor id
        const cold = changes.find((change) => change.type === 'transition' && change.oldApi.includes('ChartType'));
        expect(cold).toMatchObject({ removedFrom: '32.2.0' });
        expect((cold as { deprecatedFrom?: string; id?: string }).deprecatedFrom).toBeUndefined();
        expect((cold as { id?: string }).id).toBeUndefined();

        // simple and dependency changes carry a single version and no id
        expect(changes.find((change) => change.type === 'behaviour')).toMatchObject({ version: '31.0.0' });
        expect(changes.find((change) => change.type === 'dependency')).toMatchObject({
            version: '32.2.0',
            minVersion: '5.1',
        });
    });

    test('throws on invalid changelogs, reporting the validation messages', () => {
        const orphan: TransitionFacts = { oldApi: '`foo`', newApi: '`bar`', detectWords: null, mitigation: null };
        expect(() => compileChangelogs({ '32': { removalsAfterDeprecation: [orphan] } })).toThrow(
            /does not reference a deprecation/
        );
    });

    test('output is JSON round-trippable', () => {
        const compiled = compileChangelogs(changelogs);
        expect(JSON.parse(JSON.stringify(compiled))).toEqual(compiled);
    });

    test('mitigation compiles to the array form: string expands to all frameworks, null becomes empty', () => {
        const { changes } = compileChangelogs(changelogs);

        // a plain string becomes one entry scoped to every framework
        const columnApiChange = changes.find((change) => change.id === 'columnApi');
        expect(columnApiChange?.mitigation).toEqual([
            { frameworks: ['react', 'angular', 'vue', 'javascript'], content: 'Replace `columnApi.x(...)` with `api.x(...)`.' },
        ]);

        // null mitigation becomes an empty list
        const legacyThemesChange = changes.find((change) => change.id === 'legacyThemes');
        expect(legacyThemesChange?.mitigation).toEqual([]);
    });

    test('per-framework mitigation entries are preserved, with omitted frameworks expanded to all', () => {
        const { changes } = compileChangelogs({
            '34': {
                deprecations: {
                    filters: {
                        oldApi: 'the old filter contract',
                        newApi: 'the new filter contract',
                        detectWords: null,
                        mitigation: [
                            { content: 'Universal advice.' },
                            { frameworks: ['react'], content: 'React-specific advice.' },
                        ],
                    },
                },
            },
        });
        const filtersChange = changes.find((change) => change.id === 'filters');
        expect(filtersChange?.mitigation).toEqual([
            { frameworks: ['react', 'angular', 'vue', 'javascript'], content: 'Universal advice.' },
            { frameworks: ['react'], content: 'React-specific advice.' },
        ]);
    });
});
