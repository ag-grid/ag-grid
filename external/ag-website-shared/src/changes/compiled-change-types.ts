/**
 * Types for the compiled output of the changes database.
 *
 * Where the authoring format (`change-types.ts`) is optimised for humans writing
 * TypeScript files — one file per release, versions implied by position, transitions
 * split across a deprecation record and a removal reference — the compiled format is a
 * flat list of self-contained changes with explicit versions, produced by validating and
 * joining the authored files.
 *
 * The compiled format is JSON-serialisable: it is the shape published to the website
 * build output for consumption by the upgrade AI skill, and the shape the documentation
 * pages render from.
 */
import type { DependencyName, Framework } from './change-types';

/** A `RegExp` in JSON-serialisable form; reconstruct with `new RegExp(source, flags)`. */
export interface SerialisedRegExp {
    source: string;
    flags: string;
}

/** A piece of mitigation advice scoped to an explicit, always-populated framework list. */
export interface CompiledMitigation {
    /**
     * Frameworks this advice applies to. Always explicit and populated: an authored entry
     * that omitted `frameworks` ("all") is expanded to the full framework list here.
     */
    frameworks: Framework[];
    /** Markdown advice. */
    content: string;
}

interface CompiledChangeBase {
    framework?: Framework;
    /**
     * Detection regexes compiled from the authored `detectWords`. The build combines
     * entries into as few patterns as possible (entries with differing flags cannot
     * share a pattern). If no pattern matches anything in an application codebase, the
     * application is guaranteed unaffected by this change; a match means it might be.
     * Absent = no code marker can rule applications out.
     */
    detectPatterns?: SerialisedRegExp[];
    /**
     * Mitigation advice, always in array form (a plain authored string becomes one
     * all-framework entry). Empty = accept-only, no action. Entries combine additively.
     */
    mitigation: CompiledMitigation[];
}

/**
 * An API transition, joined into a single change from its authored deprecation and
 * removal records. At least one of `deprecatedFrom`/`removedFrom` is present (enforced
 * by validation; not expressible in the type).
 */
export interface CompiledTransition extends CompiledChangeBase {
    type: 'transition';
    /**
     * The key of the deprecation in its version file's deprecations object. Absent for
     * removals without deprecation.
     */
    id?: string;
    oldApi: string;
    oldDescription?: string;
    /** Null = the old API has no replacement. */
    newApi: string | null;
    newDescription?: string;
    /**
     * True for a soft deprecation: the old API is discouraged in favour of `newApi` but is
     * not formally deprecated in code and has no scheduled removal. Always `false` for
     * removals and normal deprecations.
     */
    isSoft: boolean;
    /** The version that deprecated the old API. Absent for removals without deprecation. */
    deprecatedFrom?: string;
    /** The version that removed the old API. Absent while removal is unscheduled. */
    removedFrom?: string;
}

export interface CompiledSimpleChange extends CompiledChangeBase {
    type: 'requirement' | 'behaviour' | 'style';
    version: string;
    title: string;
    description?: string;
}

export interface CompiledDependencyChange {
    type: 'dependency';
    version: string;
    dependency: DependencyName;
    minVersion: string;
    reason?: string;
}

export type CompiledChange = CompiledTransition | CompiledSimpleChange | CompiledDependencyChange;

/** The validated, flattened output of a product's changes database. */
export interface CompiledChangelog {
    /** The current (most recent) released version of the product, e.g. the value of the package's `VERSION`. */
    mostRecentVersion: string;
    changes: CompiledChange[];
}
