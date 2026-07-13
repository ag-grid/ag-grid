/**
 * Compiled output of the changes database: a flat, JSON-serialisable list of self-contained
 * changes with explicit versions, produced by validating and joining the authored per-release
 * files (`change-types.ts`). This is the shape published for the upgrade AI skill and rendered
 * by the docs. Every field is always present; absent values are `null` (never omitted).
 */
import type { DependencyName, Framework } from './change-types';

/** Mitigation advice for a specific set of frameworks. */
export interface CompiledMitigation {
    /** Frameworks this advice applies to; always populated (an authored "all" is expanded to every framework). */
    frameworks: Framework[];
    /** Markdown. */
    content: string;
}

interface CompiledChangeBase {
    /** Framework variant this entry is scoped to; null = all frameworks. */
    framework: Framework | null;
    /**
     * Case-sensitive words to search for in an app's source. Partial identifiers don't match
     * (`Bar` matches `Foo-Bar` but not `FooBar`). No word matching anywhere = app guaranteed
     * unaffected; a match = app may be affected (false positives expected). Null = the change
     * cannot be ruled out by searching.
     */
    detectWords: string[] | null;
    /** Show every entry whose `frameworks` includes the app's framework. Empty = no action needed (accept-only). */
    mitigation: CompiledMitigation[];
}

/**
 * An API changing from `oldApi` to `newApi`. The version fields say where it is in its
 * lifecycle: only `deprecatedFrom` set = deprecated, not yet removed; both set = deprecated
 * then removed; only `removedFrom` set = removed with no prior deprecation.
 */
export interface CompiledTransition extends CompiledChangeBase {
    type: 'transition';
    /** Stable identifier; null for removals with no prior deprecation. */
    id: string | null;
    oldApi: string;
    oldDescription: string | null;
    /** Null = removed with no replacement. */
    newApi: string | null;
    newDescription: string | null;
    /** Discouraged but not formally deprecated, with no scheduled removal; `false` for normal deprecations and removals. */
    isSoft: boolean;
    deprecatedFrom: string | null;
    removedFrom: string | null;
}

export interface CompiledSimpleChange extends CompiledChangeBase {
    /** requirement: app breaks until it acts. behaviour: runs but behaves differently. style: visual/CSS only. */
    type: 'requirement' | 'behaviour' | 'style';
    version: string;
    title: string;
    description: string | null;
}

export interface CompiledDependencyChange {
    type: 'dependency';
    version: string;
    dependency: DependencyName;
    /** New minimum supported version. */
    minVersion: string;
    /** Markdown; why the minimum was raised. */
    reason: string | null;
}

export type CompiledChange = CompiledTransition | CompiledSimpleChange | CompiledDependencyChange;

export interface CompiledChangelog {
    /** Current released version, as `major.minor.patch`. */
    mostRecentVersion: string;
    /** Minimum version of the consuming upgrade skill able to read this compiled format. */
    minimumSkillVersion: string;
    changes: CompiledChange[];
}
