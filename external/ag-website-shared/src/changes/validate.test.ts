import type { Changelogs, TransitionFacts } from './change-types';
import { validateChangelogs } from './validate';

function transition(oldApi: string): TransitionFacts {
    return { oldApi, newApi: '`replacement`', detectWords: null, mitigation: null };
}

function messagesOf(changelogs: Changelogs): string[] {
    return validateChangelogs(changelogs).map((error) => `v${error.version}: ${error.message}`);
}

describe('validateChangelogs', () => {
    test('a valid multi-version database produces no errors', () => {
        const columnApi = transition('the `columnApi` object');
        const errors = validateChangelogs({
            '31': {
                deprecations: { columnApi },
                behaviourChanges: [
                    {
                        title: 'The page size selector is shown by default',
                        detectWords: ['pagination'],
                        mitigation: 'Set `paginationPageSizeSelector: false`.',
                    },
                ],
            },
            '32.2': {
                removalsAfterDeprecation: [columnApi],
                removalsWithoutDeprecation: [transition('the `ChartType` enum')],
                dependencyChanges: [{ dependency: 'typescript', minVersion: '5.1', reason: null }],
            },
        });
        expect(errors).toEqual([]);
    });

    test('removals must reference a deprecation from a strictly earlier version, at most once', () => {
        const orphan = messagesOf({ '32': { removalsAfterDeprecation: [transition('`foo`')] } });
        expect(orphan.join()).toContain('does not reference a deprecation');

        // zero-filled and shorthand version keys refer to the same version
        const sameVersionDeprecation = transition('`foo`');
        const sameVersion = messagesOf({
            '32.0.0': { deprecations: { foo: sameVersionDeprecation } },
            '32': { removalsAfterDeprecation: [sameVersionDeprecation] },
        });
        expect(sameVersion.join()).toContain('must be in a later version than its deprecation');

        const twiceRemovedDeprecation = transition('`foo`');
        const twiceRemoved = messagesOf({
            '31': { deprecations: { foo: twiceRemovedDeprecation } },
            '32': { removalsAfterDeprecation: [twiceRemovedDeprecation] },
            '33': { removalsAfterDeprecation: [twiceRemovedDeprecation] },
        });
        expect(twiceRemoved.join()).toContain('already removed in v32');
    });

    test('rejects malformed version keys and record fields', () => {
        const errors = messagesOf({
            v32: {},
            '32': {
                deprecations: { foo: { oldApi: '', newApi: '`bar`', detectWords: [' '], mitigation: null } },
                behaviourChanges: [
                    {
                        title: '',
                        framework: 'react',
                        frameworkMitigation: { vue: 'Irrelevant advice' },
                        detectWords: null,
                        mitigation: null,
                    },
                ],
                dependencyChanges: [{ dependency: 'angular', minVersion: '', reason: null }],
            },
        });
        const allMessages = errors.join('\n');
        expect(allMessages).toContain('invalid version key "v32"');
        expect(allMessages).toContain('deprecation "foo": empty oldApi');
        expect(allMessages).toContain('detectWords contains an empty entry');
        expect(allMessages).toContain('behaviourChanges record with empty title');
        expect(allMessages).toContain('frameworkMitigation for [vue] contradicts framework "react"');
        expect(allMessages).toContain('dependency "angular": empty minVersion');
        expect(errors).toHaveLength(6);
    });
});
