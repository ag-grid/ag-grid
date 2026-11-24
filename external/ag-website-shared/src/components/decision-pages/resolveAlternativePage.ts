import type { AlternativePageContent, AlternativePageSource, ComparisonPageContent } from './types';

/**
 * An alternative page with its feature rows and pricing taken from the comparison page for the same
 * competitor, so the two pages cannot disagree. The rows keep the comparison page's groups and
 * order. Throws, failing the build, when the comparison page has no row for a named feature.
 */
export function resolveAlternativePage(
    source: AlternativePageSource,
    comparison: ComparisonPageContent
): AlternativePageContent {
    const named = new Set(source.features);
    const groups = comparison.features.groups
        .map(({ name, rows }) => ({ name, rows: rows.filter(({ feature }) => named.has(feature)) }))
        .filter(({ rows }) => rows.length > 0);

    const found = new Set(groups.flatMap(({ rows }) => rows.map(({ feature }) => feature)));
    const missing = source.features.filter((feature) => !found.has(feature));
    if (missing.length > 0) {
        throw new Error(
            `The ${source.competitor.name} alternative page names features its comparison page has no row for: ${missing.join(', ')}`
        );
    }

    return { ...source, features: { groups }, pricing: comparison.pricing };
}
