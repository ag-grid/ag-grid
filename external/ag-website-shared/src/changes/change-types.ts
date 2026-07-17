/**
 * Authoring format for the changes database: one `VersionChangelog` per release, compiled to
 * the flat consumer format in `compiled-change-types.ts`.
 */

/** All framework contexts, as a runtime value so the compiler can expand "all frameworks" to a list. */
export const FRAMEWORKS = ['react', 'angular', 'vue', 'javascript'] as const;

/**
 * A docs rendering context, not an app's dependency stack. Includes `'javascript'` (vanilla):
 * the framework-agnostic core API is relevant to React/Angular/Vue apps too.
 */
export type Framework = (typeof FRAMEWORKS)[number];

/**
 * A framework that has a wrapper package: the real frameworks, excluding vanilla `'javascript'`.
 * Scoping a change to a single framework only makes sense for these; a vanilla-core change reaches
 * React/Angular/Vue apps too, so "all frameworks" (an omitted scope) is the correct expression, not
 * `'javascript'`.
 */
export type WrapperFramework = Exclude<Framework, 'javascript'>;

/** A piece of mitigation advice, optionally scoped to frameworks. Multiple entries are additive. */
export interface MitigationAdvice {
    /** Frameworks this applies to; omit for all. */
    frameworks?: Framework[];
    /** Markdown. */
    content: string;
}

export interface ChangeBase {
    /**
     * Framework wrapper this entry is scoped to; omit for all frameworks (including vanilla
     * `'javascript'`). There is deliberately no `'javascript'` scope: a vanilla-core change also
     * affects React/Angular/Vue apps, so "affects everyone" is expressed by omitting this field.
     */
    framework?: WrapperFramework;

    /**
     * Case-sensitive words to search for in an app's source. Partial words don't match, so `Bar`
     * matches `Foo-Bar-Baz` but not `bar` or `FooBar`. No match must GUARANTEE the app is
     * unaffected; a match means it might be (high false-positive rates are fine, e.g. `children`
     * for a column-groups change). `null` = nothing can rule the app out — justify with a comment.
     */
    detectWords: string | string[] | null;

    /**
     * Markdown: the most direct way to restore pre-change behaviour (for removals, the replacement
     * API; for behaviour changes, the APIs that reinstate the old behaviour). `null` = accept-only.
     * A plain string is one all-framework entry; use `MitigationAdvice[]` for per-framework advice.
     * Long content can be imported: `mitigation: (await import('./v36-migration.md?raw')).default`.
     */
    mitigation: string | MitigationAdvice[] | null;
}

export interface TransitionFacts extends ChangeBase {
    /** Old API as a phrase for "As of v30, $oldApi is deprecated", e.g. `SomeClass.foo`, Column API. */
    oldApi: string;
    oldDescription?: string;

    /** Replacement as a phrase for "Instead, use $newApi". `null` = no replacement (explain in mitigation/newDescription). */
    newApi: string | null;
    newDescription?: string;

    /**
     * Soft deprecation: `newApi` is recommended but the old API is not `@deprecated` in code, emits
     * no warning and has no scheduled removal. Only meaningful in `deprecations`; omit otherwise.
     */
    isSoft?: boolean;
}

/** A change with no old/new API. Which `VersionChangelog` list it sits in gives its meaning and urgency. */
export interface SimpleChange extends ChangeBase {
    /** A full clause stating what changed, able to stand alone as a summary. */
    title: string;
    /** Optional further detail on the change itself (mitigation steps go in `mitigation`). */
    description?: string;
}

/** Dependencies whose minimum version can be raised: the framework wrappers plus TypeScript. */
export type DependencyName = WrapperFramework | 'typescript';

/**
 * A raised minimum dependency version. Prose is generated from the fields and detection is an exact
 * version check, so there is no title/detectWords. Non-bump dependency changes (a newly required
 * dependency, a dropped environment) belong in `newRequirements`.
 */
export interface DependencyChange {
    dependency: DependencyName;
    /** New minimum supported version, e.g. "5.8.3". */
    minVersion: string;
    /** Markdown rationale, or `null`. */
    reason: string | null;
}

/** All changes in a single release. Every list is optional. */
export interface VersionChangelog {
    /**
     * APIs deprecated in this release, keyed by a stable camelCase id. The removing release
     * references the object by identity: `removalsAfterDeprecation: [v31.deprecations.columnApi]`.
     */
    deprecations?: Record<string, TransitionFacts>;
    /** APIs removed, renamed or signature-changed in this release with no prior deprecation. */
    removalsWithoutDeprecation?: TransitionFacts[];
    /** Previously-deprecated APIs removed here; each a by-identity reference to an earlier version's deprecation. */
    removalsAfterDeprecation?: TransitionFacts[];
    /** App is broken until it acts, but no old API is being replaced (e.g. a now-required callback). */
    newRequirements?: SimpleChange[];
    /** Old code runs but behaves differently; accept or mitigate. */
    behaviourChanges?: SimpleChange[];
    /** Raised minimum versions of framework and toolchain dependencies. */
    dependencyChanges?: DependencyChange[];
    /** Visual/CSS changes. */
    styleChanges?: SimpleChange[];
}
