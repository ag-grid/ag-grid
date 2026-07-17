import type { ChangeBase, Changelogs, TransitionFacts, VersionChangelog } from './change-types';
import { FRAMEWORKS } from './change-types';
import { compareVersions, isValidVersionKey } from './version-utils';

export interface ValidationError {
    /** The version key of the changelog containing the problem. */
    version: string;
    message: string;
}

/**
 * Semantic validation beyond what TypeScript can express. Returns all problems found;
 * an empty array means the changelogs are valid.
 */
export function validateChangelogs(changelogs: Changelogs): ValidationError[] {
    const errors: ValidationError[] = [];
    const addError = (version: string, message: string) => {
        errors.push({ version, message });
    };

    const versions = Object.keys(changelogs);
    for (const version of versions) {
        if (!isValidVersionKey(version)) {
            addError(version, `invalid version key "${version}": expected 1-3 dot-separated numbers`);
        }
    }

    // Register all deprecation objects before checking removals, since removals refer
    // backwards to them by identity
    const deprecationEntries = new Map<TransitionFacts, { version: string; key: string }>();
    for (const version of versions) {
        const deprecations = changelogs[version].deprecations ?? {};
        for (const key of Object.keys(deprecations)) {
            deprecationEntries.set(deprecations[key], { version, key });
        }
    }

    const removalVersions = new Map<TransitionFacts, string>();
    for (const version of versions) {
        const changelog = changelogs[version];
        validateRecordsOfVersion(version, changelog, addError);

        for (const removal of changelog.removalsAfterDeprecation ?? []) {
            if (removal == null) {
                addError(version, 'removalsAfterDeprecation contains an unresolved reference (circular import?)');
                continue;
            }
            const deprecationEntry = deprecationEntries.get(removal);
            if (deprecationEntry === undefined) {
                addError(
                    version,
                    `removalAfterDeprecation of "${removal.oldApi}" must be a reference to a value defined in an earlier version`
                );
            } else if (compareVersions(deprecationEntry.version, version) >= 0) {
                addError(
                    version,
                    `removal of "${deprecationEntry.key}" must be in a later version than its deprecation` +
                        ` (v${deprecationEntry.version}); for removals in the same version, use removalsWithoutDeprecation`
                );
            }
            const existingRemovalVersion = removalVersions.get(removal);
            if (existingRemovalVersion !== undefined) {
                addError(version, `"${removal.oldApi}" is already removed in v${existingRemovalVersion}`);
            } else {
                removalVersions.set(removal, version);
            }
        }
    }

    return errors;
}

function validateRecordsOfVersion(
    version: string,
    changelog: VersionChangelog,
    addError: (version: string, message: string) => void
): void {
    const validateBase = (record: ChangeBase, label: string) => {
        const words = typeof record.detectWords === 'string' ? [record.detectWords] : (record.detectWords ?? []);
        for (const word of words) {
            if (word.trim() === '') {
                addError(version, `${label}: detectWords contains an empty entry`);
            }
        }
        const mitigation = record.mitigation;
        const hasMitigation = mitigation != null && (typeof mitigation === 'string' || mitigation.length > 0);
        if (hasMitigation) {
            const coversAllFrameworks =
                typeof mitigation === 'string' ||
                mitigation.some(
                    (advice) =>
                        typeof advice === 'string' ||
                        FRAMEWORKS.every((framework) => advice.frameworks.includes(framework))
                );
            if (!coversAllFrameworks) {
                addError(
                    version,
                    `${label}: mitigation must include a non-framework-dependent line or one covering all frameworks`
                );
            }
        }
        if (Array.isArray(mitigation)) {
            for (const advice of mitigation) {
                const content = typeof advice === 'string' ? advice : advice.content;
                const frameworks = typeof advice === 'string' ? undefined : advice.frameworks;
                if (content.trim() === '') {
                    addError(version, `${label}: mitigation entry with empty content`);
                }
                if (record.framework !== undefined && frameworks !== undefined) {
                    const otherFrameworks = frameworks.filter((framework) => framework !== record.framework);
                    if (otherFrameworks.length > 0) {
                        addError(
                            version,
                            `${label}: mitigation advice for [${otherFrameworks.join(', ')}] contradicts framework "${record.framework}"`
                        );
                    }
                }
            }
        }
    };

    const deprecations = changelog.deprecations ?? {};
    for (const key of Object.keys(deprecations)) {
        const label = `deprecation "${key}"`;
        if (deprecations[key].oldApi.trim() === '') {
            addError(version, `${label}: empty oldApi`);
        }
        validateBase(deprecations[key], label);
    }

    for (const removal of changelog.removalsWithoutDeprecation ?? []) {
        const label = `removal "${removal.oldApi}"`;
        if (removal.oldApi.trim() === '') {
            addError(version, 'removalsWithoutDeprecation record with empty oldApi');
        }
        validateBase(removal, label);
    }

    const simpleChangeSections = [
        ['newRequirements', changelog.newRequirements],
        ['behaviourChanges', changelog.behaviourChanges],
        ['styleChanges', changelog.styleChanges],
    ] as const;
    for (const [sectionName, records] of simpleChangeSections) {
        for (const record of records ?? []) {
            const label = `${sectionName} "${record.title}"`;
            if (record.title.trim() === '') {
                addError(version, `${sectionName} record with empty title`);
            }
            validateBase(record, label);
        }
    }

    for (const dependency of changelog.dependencyChanges ?? []) {
        if (dependency.minVersion.trim() === '') {
            addError(version, `dependency "${dependency.dependency}": empty minVersion`);
        }
    }
}
