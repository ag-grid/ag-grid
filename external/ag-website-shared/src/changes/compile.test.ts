import type { Changelogs, TransitionFacts } from './change-types';
import { compileChangelogs, normaliseDetectWords } from './compile';

describe('normaliseDetectWords', () => {
    test('a single string wraps to an array; a list passes through; null/empty become null', () => {
        expect(normaliseDetectWords('columnApi')).toEqual(['columnApi']);
        expect(normaliseDetectWords(['columnApi', 'getColumnApi'])).toEqual(['columnApi', 'getColumnApi']);
        expect(normaliseDetectWords(null)).toBeNull();
        expect(normaliseDetectWords([])).toBeNull();
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

    test('emits the most recent version as major.minor.patch, stripping any build suffix', () => {
        expect(compileChangelogs(changelogs, '36.0.0').mostRecentVersion).toBe('36.0.0');
        expect(compileChangelogs(changelogs, '36.0.0-beta.20260705.2117').mostRecentVersion).toBe('36.0.0');
    });

    test('joins deprecations to removals by object identity, with explicit zero-filled versions', () => {
        const { changes } = compileChangelogs(changelogs, '36.0.0');

        expect(changes.find((change) => change.id === 'columnApi')).toMatchObject({
            type: 'transition',
            deprecatedFrom: '31.0.0',
            removedFrom: '32.2.0',
            detectWords: ['columnApi'],
        });

        // a pending deprecation has a null removedFrom
        const pending = changes.find((change) => change.id === 'legacyThemes');
        expect((pending as { removedFrom: string | null }).removedFrom).toBeNull();

        // a removal without deprecation has null deprecatedFrom and id
        const cold = changes.find((change) => change.type === 'transition' && change.oldApi.includes('ChartType'));
        expect(cold).toMatchObject({ removedFrom: '32.2.0', deprecatedFrom: null, id: null });

        // simple and dependency changes carry a single version and no id
        expect(changes.find((change) => change.type === 'behaviour')).toMatchObject({ version: '31.0.0' });
        expect(changes.find((change) => change.type === 'dependency')).toMatchObject({
            version: '32.2.0',
            minVersion: '5.1',
        });
    });

    test('throws on invalid changelogs, reporting the validation messages', () => {
        const orphan: TransitionFacts = { oldApi: '`foo`', newApi: '`bar`', detectWords: null, mitigation: null };
        expect(() => compileChangelogs({ '32': { removalsAfterDeprecation: [orphan] } }, '36.0.0')).toThrow(
            /must be a reference to a value defined in an earlier version/
        );
    });

    test('output is JSON round-trippable', () => {
        const compiled = compileChangelogs(changelogs, '36.0.0');
        expect(JSON.parse(JSON.stringify(compiled))).toEqual(compiled);
    });

    test('mitigation compiles to the array form: string becomes a non-framework-dependent entry, null becomes empty', () => {
        const { changes } = compileChangelogs(changelogs, '36.0.0');

        // a plain string becomes one non-framework-dependent entry (frameworks: null)
        const columnApiChange = changes.find((change) => change.id === 'columnApi');
        expect(columnApiChange?.mitigation).toEqual([
            { frameworks: null, content: 'Replace `columnApi.x(...)` with `api.x(...)`.' },
        ]);

        // null mitigation becomes an empty list
        const legacyThemesChange = changes.find((change) => change.id === 'legacyThemes');
        expect(legacyThemesChange?.mitigation).toEqual([]);
    });

    test('per-framework mitigation entries are preserved; a plain-string entry is non-framework-dependent', () => {
        const { changes } = compileChangelogs(
            {
                '34': {
                    deprecations: {
                        filters: {
                            oldApi: 'the old filter contract',
                            newApi: 'the new filter contract',
                            detectWords: null,
                            mitigation: [
                                'Universal advice.',
                                { frameworks: ['react'], content: 'React-specific advice.' },
                            ],
                        },
                    },
                },
            },
            '36.0.0'
        );
        const filtersChange = changes.find((change) => change.id === 'filters');
        expect(filtersChange?.mitigation).toEqual([
            { frameworks: null, content: 'Universal advice.' },
            { frameworks: ['react'], content: 'React-specific advice.' },
        ]);
    });
});
