/**
 * Expandable type signatures are large and only read when a row is expanded, so they are built
 * into one file per source per framework and fetched on demand rather than shipped with the page.
 */
export const REFERENCE_DETAILS_BASE_PATH = '/reference-details';

export function getReferenceDetailsPath({ framework, source }: { framework: string; source: string }) {
    return `${REFERENCE_DETAILS_BASE_PATH}/${framework}/${source.replace(/\.json$/, '')}.json`;
}

/** Section-scoped, because a source can document the same property name under more than one section. */
export function getDetailsKey({ section, name }: { section: string; name: string }) {
    return `${section}.${name}`;
}
