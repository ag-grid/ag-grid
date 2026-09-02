import demosJson from '../../content/demos/demos.json' with { type: 'json' };
import type { DemoTab } from './demosData';

/**
 * The frontmatter contract for a standalone demo page (SE-125). `useCase`, `pageType`, `framework`
 * and `features` describe the demo; the `seo*` fields and `intro` are the rendered copy, and are
 * optional because {@link demoContent} derives them from the description when they are omitted.
 * That derivation is the point of the contract: a new demo page gets a real title, H1 and meta
 * description without anyone writing them, rather than falling back to "Demo - {name}".
 */
export interface DemoDefinition {
    /** The use case or feature the demo is about, e.g. "Inventory Management". Title case. */
    useCase: string;
    /** What the page is: a single grid, or a dashboard built around one. */
    pageType: 'Grid' | 'Dashboard';
    /**
     * The framework the live demo renders in. It does not create a framework variant of the page —
     * the example's source is published for JavaScript, React, Angular and Vue either way.
     */
    framework?: string;
    /** The features the demo shows, in the order the page presents them. */
    features: string[];
    /** The differentiator appended to a derived title, e.g. "100k+ Rows Live". */
    hook?: string;
    seoTitle?: string;
    seoH1?: string;
    seoDescription?: string;
    /** The indexable sentence describing the demo. The frameworks sentence is appended to it. */
    intro?: string;
    /** Root-relative path of the demo page, resolved with urlWithBaseUrl / toAbsoluteUrl. */
    href: string;
    githubUrl: string;
    activeTab: DemoTab['key'];
}

export type DemoName = keyof typeof demosJson;

// JSON widens string literals, so the union-typed fields need the assertion. The shape itself is
// still checked: a field missing from or misspelled in demos.json fails this cast.
const demosData = demosJson as Record<DemoName, DemoDefinition>;

/**
 * Frameworks the demo source is published for, and their directory in the ag-grid-demos repository
 * that the intro links to. The JavaScript demo is written in TypeScript, hence the one mismatch.
 */
const PUBLISHED_FRAMEWORK_DIRECTORIES = {
    JavaScript: 'typescript',
    React: 'react',
    Angular: 'angular',
    Vue: 'vue',
} as const;
type PublishedFramework = keyof typeof PUBLISHED_FRAMEWORK_DIRECTORIES;
const PUBLISHED_FRAMEWORKS = Object.keys(PUBLISHED_FRAMEWORK_DIRECTORIES) as PublishedFramework[];
const DEFAULT_FRAMEWORK = 'JavaScript';

/** Google truncates a title past roughly this width, so a derived one stays inside it. */
const MAX_TITLE_LENGTH = 60;
/** The meta description window a derived description aims to fill. */
const MIN_DESCRIPTION_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 155;

/** "a, b and c" — the features read as prose in the intro and the derived description. */
function toProseList(items: string[]): string {
    if (items.length < 2) {
        return items[0] ?? '';
    }
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Feature labels are written for headings ("Live data updates"), so their leading capital has to go
 * when they are dropped mid-sentence. Only the first character changes, leaving any proper noun in
 * the rest of the label alone.
 */
function lowerFirst(text: string): string {
    return text.charAt(0).toLowerCase() + text.slice(1);
}

/** The features as a prose list, each de-capitalised for use mid-sentence. */
function toFeatureProse(features: string[]): string {
    return toProseList(features.map(lowerFirst));
}

/**
 * Assemble a description from clauses, appending only until it reaches `minLength` and only while it
 * stays within `maxLength`. The first clause always survives, so a long feature list yields a short
 * description rather than one Google would truncate.
 */
function fillToWindow(clauses: string[], minLength: number, maxLength: number): string {
    return clauses.reduce((text, clause) => {
        if (!text) {
            return clause;
        }
        if (text.length >= minLength) {
            return text;
        }
        const candidate = `${text} ${clause}`;
        return candidate.length <= maxLength ? candidate : text;
    }, '');
}

/** `{Use Case} {Grid|Dashboard} Example` — the H1, and the stem of the derived title. */
function deriveHeading({ useCase, pageType }: DemoDefinition): string {
    return `${useCase} ${pageType} Example`;
}

/** `{Use Case} {Grid|Dashboard} Example - {hook} | AG Grid`: intent first, brand last. */
function deriveTitle(definition: DemoDefinition): string {
    const heading = deriveHeading(definition);
    const withHook = definition.hook ? `${heading} - ${definition.hook} | AG Grid` : `${heading} | AG Grid`;
    // Dropping the hook is the only way back under the limit; the heading and brand are fixed.
    return withHook.length <= MAX_TITLE_LENGTH ? withHook : `${heading} | AG Grid`;
}

function deriveDescription(definition: DemoDefinition): string {
    const { useCase, pageType, features } = definition;
    return fillToWindow(
        [
            `A ${lowerFirst(useCase)} ${pageType.toLowerCase()} example built with AG Grid, showing ${toFeatureProse(features)}.`,
            `Explore the live demo in ${resolveFramework(definition)}.`,
            'Code is available for JavaScript, React, Angular and Vue.',
        ],
        MIN_DESCRIPTION_LENGTH,
        MAX_DESCRIPTION_LENGTH
    );
}

function describeDemo(definition: DemoDefinition): string {
    return `A ${lowerFirst(definition.useCase)} ${definition.pageType.toLowerCase()} example showing ${toFeatureProse(definition.features)}.`;
}

/** Where a framework's copy of this demo lives, falling back to the demo's own source root. */
function frameworkSourceUrl(definition: DemoDefinition, framework: string): string {
    const directory = PUBLISHED_FRAMEWORK_DIRECTORIES[framework as PublishedFramework];
    return directory ? `${definition.githubUrl}/${directory}` : definition.githubUrl;
}

/** `a, b and c`, as segments, so each framework carries the link to its own source. */
function toLinkedProseList(definition: DemoDefinition, frameworks: string[]): IntroSegment[] {
    return frameworks.flatMap((framework, index) => {
        const separator = index === 0 ? '' : index === frameworks.length - 1 ? ' and ' : ', ';
        return [
            ...(separator ? [{ text: separator }] : []),
            { text: framework, href: frameworkSourceUrl(definition, framework) },
        ];
    });
}

/** The sentence naming where the demo runs and where each framework's source is published. */
function deriveFrameworkAvailability(definition: DemoDefinition): IntroSegment[] {
    const framework = resolveFramework(definition);
    const alsoAvailable = PUBLISHED_FRAMEWORKS.filter((name) => name !== framework);
    return [
        { text: 'The demo runs in ' },
        { text: framework, href: frameworkSourceUrl(definition, framework) },
        { text: ', and the same example is available in ' },
        ...toLinkedProseList(definition, alsoAvailable),
        { text: '.' },
    ];
}

function deriveIntroSegments(definition: DemoDefinition): IntroSegment[] {
    return [{ text: `${definition.intro ?? describeDemo(definition)} ` }, ...deriveFrameworkAvailability(definition)];
}

/** The intro as plain text, for the meta description, the markdown twin and the page's tests. */
function toPlainText(segments: IntroSegment[]): string {
    return segments.map(({ text }) => text).join('');
}

function resolveFramework(definition: DemoDefinition): string {
    return definition.framework ?? DEFAULT_FRAMEWORK;
}

/** A run of the intro's text, carrying a link when it names a framework the demo is published in. */
export interface IntroSegment {
    text: string;
    href?: string;
}

export interface DemoPageContent {
    /** `<title>`, and the source of the og:title / twitter:title the layout renders. */
    seoTitle: string;
    seoH1: string;
    /** Meta description, and the source of the og:description / twitter:description. */
    seoDescription: string;
    /** The intro as plain text, for the meta description and the page's markdown twin. */
    intro: string;
    /** The same intro to render, split so each framework it names links to its own source. */
    introSegments: IntroSegment[];
    /** The features shown, for the derived copy and the per-feature H2s (SE-125 follow-up). */
    features: string[];
    framework: string;
    href: string;
    githubUrl: string;
    activeTab: DemoTab['key'];
}

/**
 * Resolve a demo's page copy, deriving any `seo*` field or intro the contract leaves out. Shared
 * with the `.astro` page and its `.md` twin so the two cannot drift.
 */
export function demoContent(demo: DemoName): DemoPageContent {
    const definition = demosData[demo];
    const introSegments = deriveIntroSegments(definition);

    return {
        seoTitle: definition.seoTitle ?? deriveTitle(definition),
        seoH1: definition.seoH1 ?? deriveHeading(definition),
        seoDescription: definition.seoDescription ?? deriveDescription(definition),
        intro: toPlainText(introSegments),
        introSegments,
        features: definition.features,
        framework: resolveFramework(definition),
        href: definition.href,
        githubUrl: definition.githubUrl,
        activeTab: definition.activeTab,
    };
}

export const demoNames = Object.keys(demosData) as DemoName[];

/** Exported for the contract's tests, which exercise the derivation on its own. */
export const demoContentInternals = {
    deriveTitle,
    deriveHeading,
    deriveDescription,
    deriveIntro: (definition: DemoDefinition) => toPlainText(deriveIntroSegments(definition)),
    deriveIntroSegments,
    MAX_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
};
