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
    mitigation?: string;
    frameworkMitigation?: Partial<Record<Framework, string>>;
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
    newApi: string;
    newDescription?: string;
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
    changes: CompiledChange[];
}
