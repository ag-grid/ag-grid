import { readFileSync } from 'node:fs';

/** The React example forced onto the development build: a variant served by the `reactFunctionalTs` page. */
export const reactFunctionalTsDev = 'reactFunctionalTs_Dev' as const;

/** Without `reactFunctional`: it is `reactFunctionalTs` with the types stripped, so it would fail the same way. */
export const ALL_FRAMEWORKS = [
    'typescript',
    'vanilla',
    'reactFunctionalTs',
    reactFunctionalTsDev,
    'angular',
    'vue3',
] as const;
export type AgFramework = (typeof ALL_FRAMEWORKS)[number];

export const PROD_VARIANT_FRAMEWORK = 'reactFunctionalTs';

/**
 * What `eachFramework` runs: vanilla on an archive run (`PRE_34_VERSION`); a pinned run's own, none for the React
 * development build (only specs naming it run it); else all, the production React build only with `allVariants`.
 */
export function eachFrameworkList(run: {
    archive: boolean;
    pinned: AgFramework | null;
    allVariants: boolean;
}): readonly AgFramework[] {
    if (run.archive) {
        return run.pinned === null || run.pinned === 'vanilla' ? ['vanilla'] : [];
    }
    if (run.pinned) {
        return run.pinned === reactFunctionalTsDev ? [] : [run.pinned];
    }
    return run.allVariants
        ? ALL_FRAMEWORKS
        : ALL_FRAMEWORKS.filter((framework) => framework !== PROD_VARIANT_FRAMEWORK);
}

/** The framework segment of the example URL: both React builds share one page. */
export const urlFrameworkOf = (agFramework: string): string =>
    agFramework === reactFunctionalTsDev ? 'reactFunctionalTs' : agFramework;

/**
 * The frameworks the example beside a spec has pages for, or undefined for every one. The site's rule
 * (`getDocsExampleNameParts`): an `exampleConfig.json` listing `supportedFrameworks` generates pages for those only.
 */
export function readExampleFrameworks(specUrl: string): ReadonlySet<string> | undefined {
    let config: string;
    try {
        config = readFileSync(new URL('exampleConfig.json', specUrl), 'utf8');
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return undefined;
        }
        throw error;
    }
    const frameworks: string[] | undefined = JSON.parse(config).supportedFrameworks;
    return frameworks ? new Set(frameworks) : undefined;
}

/** A framework the example has no page for would only load the site's 404 page, and its analytics. */
export const hasExamplePage = (frameworks: ReadonlySet<string> | undefined, agFramework: string): boolean =>
    frameworks === undefined || frameworks.has(urlFrameworkOf(agFramework));
