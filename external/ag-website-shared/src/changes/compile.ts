import type { ChangeBase, Changelogs, Framework, MitigationAdvice, SimpleChange, TransitionFacts } from './change-types';
import { FRAMEWORKS } from './change-types';
import type {
    CompiledChange,
    CompiledChangelog,
    CompiledMitigation,
    CompiledSimpleChange,
    CompiledTransition,
    SerialisedRegExp,
} from './compiled-change-types';
import { validateChangelogs } from './validate';
import { compareVersions, normaliseVersion } from './version-utils';

/**
 * Compile the authoring format into the flat consumer format: transitions joined across
 * versions, all versions explicit and zero-filled, detection words compiled to regexes.
 *
 * Throws if the changelogs fail validation.
 */
export function compileChangelogs(changelogs: Changelogs): CompiledChangelog {
    const validationErrors = validateChangelogs(changelogs);
    if (validationErrors.length > 0) {
        const messages = validationErrors.map((error) => `v${error.version}: ${error.message}`);
        throw new Error(`Cannot compile invalid changelogs:\n${messages.join('\n')}`);
    }

    const versions = Object.keys(changelogs).sort(compareVersions);

    // Removals reference deprecation objects from earlier version files by identity
    const removalVersions = new Map<TransitionFacts, string>();
    for (const version of versions) {
        for (const removal of changelogs[version].removalsAfterDeprecation ?? []) {
            removalVersions.set(removal, normaliseVersion(version));
        }
    }

    const changes: CompiledChange[] = [];
    for (const version of versions) {
        const changelog = changelogs[version];
        const normalisedVersion = normaliseVersion(version);

        const deprecations = changelog.deprecations ?? {};
        for (const key of Object.keys(deprecations)) {
            const deprecation = deprecations[key];
            const transition: CompiledTransition = {
                id: key,
                type: 'transition',
                oldApi: deprecation.oldApi,
                oldDescription: deprecation.oldDescription,
                newApi: deprecation.newApi,
                newDescription: deprecation.newDescription,
                isSoft: deprecation.isSoft ?? false,
                deprecatedFrom: normalisedVersion,
                removedFrom: removalVersions.get(deprecation),
                ...compileBase(deprecation),
            };
            changes.push(transition);
        }

        for (const removal of changelog.removalsWithoutDeprecation ?? []) {
            const transition: CompiledTransition = {
                type: 'transition',
                oldApi: removal.oldApi,
                oldDescription: removal.oldDescription,
                newApi: removal.newApi,
                newDescription: removal.newDescription,
                isSoft: false,
                removedFrom: normalisedVersion,
                ...compileBase(removal),
            };
            changes.push(transition);
        }

        const simpleChangeSections = [
            ['requirement', changelog.newRequirements],
            ['behaviour', changelog.behaviourChanges],
            ['style', changelog.styleChanges],
        ] as const;
        for (const [type, records] of simpleChangeSections) {
            for (const record of records ?? []) {
                changes.push(compileSimpleChange(type, normalisedVersion, record));
            }
        }

        for (const dependency of changelog.dependencyChanges ?? []) {
            changes.push({
                type: 'dependency',
                version: normalisedVersion,
                dependency: dependency.dependency,
                minVersion: dependency.minVersion,
                reason: dependency.reason ?? undefined,
            });
        }
    }

    return { changes };
}

function compileSimpleChange(
    type: CompiledSimpleChange['type'],
    version: string,
    record: SimpleChange
): CompiledSimpleChange {
    return {
        type,
        version,
        title: record.title,
        description: record.description,
        ...compileBase(record),
    };
}

interface CompiledBaseFields {
    framework?: Framework;
    detectPatterns?: SerialisedRegExp[];
    mitigation: CompiledMitigation[];
}

function compileBase(record: ChangeBase): CompiledBaseFields {
    return {
        framework: record.framework,
        detectPatterns: compileDetectWords(record.detectWords),
        mitigation: compileMitigation(record.mitigation),
    };
}

/**
 * Normalise authored mitigation into the compiled array form: a plain string becomes one
 * all-framework entry, `null` becomes an empty list, and each entry's `frameworks` is
 * expanded to the full framework list when the author omitted it.
 */
function compileMitigation(mitigation: string | MitigationAdvice[] | null): CompiledMitigation[] {
    if (mitigation == null) {
        return [];
    }
    const entries = typeof mitigation === 'string' ? [{ content: mitigation }] : mitigation;
    return entries.map((entry) => ({
        frameworks: entry.frameworks ?? [...FRAMEWORKS],
        content: entry.content,
    }));
}

const IDENTIFIER_CHAR = /[A-Za-z0-9_$]/;
const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * Compile detection words into regexes: each word matches literally, with a word
 * boundary required at each end only where the word's edge character is an identifier
 * character. All words currently share the same (empty) flags, so they compile to a
 * single alternation.
 */
export function compileDetectWords(detectWords: string | string[] | null | undefined): SerialisedRegExp[] | undefined {
    const words = typeof detectWords === 'string' ? [detectWords] : detectWords;
    if (words == null || words.length === 0) {
        return undefined;
    }
    const alternatives = words.map((word) => {
        const escaped = word.replace(REGEXP_SPECIAL_CHARS, '\\$&');
        const start = IDENTIFIER_CHAR.test(word.charAt(0)) ? '\\b' : '';
        const end = IDENTIFIER_CHAR.test(word.charAt(word.length - 1)) ? '\\b' : '';
        return start + escaped + end;
    });
    return [{ source: alternatives.join('|'), flags: '' }];
}
