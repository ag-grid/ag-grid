import type {
    ChangeBase,
    Changelogs,
    MitigationAdvice,
    SimpleChange,
    TransitionFacts,
    WrapperFramework,
} from './change-types';
import { FRAMEWORKS } from './change-types';
import type {
    CompiledChange,
    CompiledChangelog,
    CompiledMitigation,
    CompiledSimpleChange,
    CompiledTransition,
} from './compiled-change-types';
import { validateChangelogs } from './validate';
import { compareVersions, normaliseVersion, toReleaseVersion } from './version-utils';

/**
 * Compile the authoring format into the flat consumer format: transitions joined across
 * versions, all versions explicit and zero-filled, detection words compiled to regexes.
 *
 * Throws if the changelogs fail validation.
 */
/** Bumped when the compiled format changes in a way the consuming upgrade skill must handle. */
const MINIMUM_SKILL_VERSION = '1.1.0';

export function compileChangelogs(changelogs: Changelogs, mostRecentVersion: string): CompiledChangelog {
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
                oldDescription: deprecation.oldDescription ?? null,
                newApi: deprecation.newApi,
                newDescription: deprecation.newDescription ?? null,
                isSoft: deprecation.isSoft ?? false,
                deprecatedFrom: normalisedVersion,
                removedFrom: removalVersions.get(deprecation) ?? null,
                ...compileBase(deprecation),
            };
            changes.push(transition);
        }

        for (const removal of changelog.removalsWithoutDeprecation ?? []) {
            const transition: CompiledTransition = {
                id: null,
                type: 'transition',
                oldApi: removal.oldApi,
                oldDescription: removal.oldDescription ?? null,
                newApi: removal.newApi,
                newDescription: removal.newDescription ?? null,
                isSoft: false,
                deprecatedFrom: null,
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
                reason: dependency.reason,
            });
        }
    }

    return {
        mostRecentVersion: toReleaseVersion(mostRecentVersion),
        minimumSkillVersion: MINIMUM_SKILL_VERSION,
        changes,
    };
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
        description: record.description ?? null,
        ...compileBase(record),
    };
}

interface CompiledBaseFields {
    framework: WrapperFramework | null;
    detectWords: string[] | null;
    mitigation: CompiledMitigation[];
}

function compileBase(record: ChangeBase): CompiledBaseFields {
    return {
        framework: record.framework ?? null,
        detectWords: normaliseDetectWords(record.detectWords),
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

/** Normalise authored detectWords to an array; a single string wraps, `null`/empty becomes `null`. */
export function normaliseDetectWords(detectWords: string | string[] | null | undefined): string[] | null {
    const words = typeof detectWords === 'string' ? [detectWords] : detectWords;
    return words == null || words.length === 0 ? null : words;
}
