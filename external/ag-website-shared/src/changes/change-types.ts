/**
 * Types for the changes database: a machine-readable record of the API transitions,
 * requirements, behaviour changes, dependency changes and style changes in each release
 * of an AG product.
 */

/**
 * A docs rendering context, not an app's dependency stack. Includes `'javascript'`
 * (vanilla): the grid's core API is framework-agnostic, so a React, Angular or Vue app can
 * still call the vanilla `createGrid` API and use vanilla grid components — vanilla advice
 * is therefore relevant beyond no-framework apps. A `framework` value marks which framework
 * variant of a docs page an entry applies to.
 */
export type Framework = 'react' | 'angular' | 'vue' | 'javascript';

export interface ChangeBase {
    /**
     * If absent, applies to all frameworks (including vanilla `'javascript'`).
     */
    framework?: Framework;

    /**
     * Words or phrases to search for in a customer application codebase.
     * Matches are case-sensitive, and partial words do not match, so "Bar"
     * does not match "bar" or "FooBar" but does match "Foo-Bar-Baz".
     *
     * No match must GUARANTEE that the application is NOT affected by the change. A
     * match means that the application MIGHT be affected.
     *
     * High false-positive rates are acceptable e.g. if a change affects column
     * groups, an appropriate entry is 'children' which will also match any use of
     * the unrelated Element.children DOM API.
     *
     * Null = no code marker can rule applications out; a comment must justify why.
     */
    detectWords: string | string[] | null;

    /**
     * Markdown. How to update an application affected by this change.
     *
     * This should be the most straightforward way of restoring the behaviour
     * that an application had before this change happened.
     *
     * For removals, it's the new API to use. For behaviour changes, it's the
     * APIs to use to restore the old behaviour.
     *
     * Longer content can live in a .md file imported at the use point:
     *
     *     mitigation: (await import('./v36-dom-structure-migration.md?raw')).default,
     */
    mitigation: string | null;

    /**
     * Markdown. Framework-specific advice, shown in addition to `mitigation`
     */
    frameworkMitigation?: Partial<Record<Framework, string>>;
}

export interface TransitionFacts extends ChangeBase {
    /**
     * The old API name as a phrase that can be inserted into "As of v30, $oldApi is deprecated".
     *
     * Examples are:
     * - `SomeClass.foo`
     * - Column API
     * - Multiple arguments to someApi(a, b, c)
     */
    oldApi: string;
    oldDescription?: string;

    /**
     * The replacement API to use, as a phrase that can be inserted into "Instead, use $newApi".
     *
     * Examples are:
     * - `SomeClass.bar`
     * - equivalent objects on Grid API
     * - someApi([a, b, c])
     *
     * Null = the old API has no replacement; `mitigation` or `newDescription` explains
     * why deletion is safe.
     */
    newApi: string | null;
    newDescription?: string;

    /**
     * Soft deprecation: the old API is discouraged in favour of `newApi` — the docs
     * present the new API as the recommended approach — but it is NOT formally deprecated
     * in code. There is no `@deprecated` marker, no runtime warning, and no scheduled
     * removal; the old API remains fully supported for the foreseeable future.
     *
     * Applies only to `deprecations` records. Omit (or `false`) for a normal deprecation.
     */
    isSoft?: boolean;
}

/**
 * A change with no old-API/new-API structure. Which `VersionChangelog` list it appears in
 * determines its meaning and how urgently an upgrading application must respond.
 */
export interface SimpleChange extends ChangeBase {
    /**
     * A full clause stating what changed — informative enough to stand alone as a summary
     */
    title: string;

    /**
     * Optional further detail on the change. Should only describe the change,
     * steps required to mitigate the change go in mitigation advice.
     */
    description?: string;
}

/**
 * A dependency whose minimum supported version can be raised: the framework wrapper
 * packages (React, Angular, Vue) plus TypeScript. Excludes `'javascript'` — vanilla usage
 * has no framework package to version.
 */
export type DependencyName = Exclude<Framework, 'javascript'> | 'typescript';

/**
 * A raised minimum version of a dependency. Prose is generated from the fields, and
 * detection is an exact version check against the application's configuration, so unlike
 * other changes there is no title or `detectPattern`. Dependency changes that are not
 * version bumps (a newly required dependency, a dropped environment) belong in
 * `newRequirements` instead.
 */
export interface DependencyChange {
    dependency: DependencyName;
    /** The new minimum supported version, e.g. "5.8.3". */
    minVersion: string;
    /** Markdown. The rationale, e.g. the reason support was dropped. */
    reason: string | null;
}

/** All changes in a single release. All lists are optional; many releases have none. */
export interface VersionChangelog {
    /**
     * Old APIs deprecated in this release, keyed by a stable camelCase identifier. Code
     * using them still works. The removing release references the deprecation object:
     *
     *     removalsAfterDeprecation: [v31.deprecations.columnApi],
     */
    deprecations?: Record<string, TransitionFacts>;
    /**
     * Old API forms that stopped working in this release with no deprecation period:
     * removals, signature changes, renames.
     */
    removalsWithoutDeprecation?: TransitionFacts[];
    /**
     * Previously deprecated APIs removed in this release, referencing deprecation objects
     * from earlier version files by identity.
     */
    removalsAfterDeprecation?: TransitionFacts[];
    /**
     * New requirements: the application is broken until it acts, but no old API is being
     * replaced (e.g. a callback or template element that is now required).
     */
    newRequirements?: SimpleChange[];
    /** Default behaviour changes: old code runs but behaves differently; accept or mitigate. */
    behaviourChanges?: SimpleChange[];
    /** Raised minimum versions of frameworks and toolchain dependencies. */
    dependencyChanges?: DependencyChange[];
    /** Visual/CSS changes. */
    styleChanges?: SimpleChange[];
}

/** A product's full changes database: one `VersionChangelog` per release, keyed by version. */
export type Changelogs = Record<string, VersionChangelog>;
