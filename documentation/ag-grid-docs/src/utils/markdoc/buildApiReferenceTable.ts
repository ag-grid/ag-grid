import type { Framework } from '@ag-grid-types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { AG_MODULE_TAG_NAME } from '@components/reference-documentation/constants';
import { getTypeUrl } from '@components/reference-documentation/utils/documentation-helpers';
import { formatJson, getInterfaceName } from '@components/reference-documentation/utils/interface-helpers';
import { urlWithPrefix } from '@utils/urlWithPrefix';

/** One section of a reference model — the same shape the site's `Section` component renders. */
export interface ApiReferenceSection {
    title?: string;
    meta?: Record<string, any>;
    config: Record<string, any>;
    properties: Record<string, any>;
}

/** Framework/site context needed to resolve the doc links embedded in reference prose. */
export interface LinkContext {
    framework: Framework;
    siteRoot?: string;
}

interface PropertyRow {
    name: string;
    type: string;
    typeUrl?: string;
    isRequired: boolean;
    defaultValue: string;
    description: string;
}

/** Docs page listing every module — where the on-page `@agModule` badges link to. */
const MODULES_URL = './modules';

/** Where the on-page `Initial` badge links to, unless the tag overrides it. */
const INITIAL_URL = './grid-interface/#initial-grid-options';

/**
 * Render one reference section as the section copy the page leads with followed by a
 * GFM table (`Property | Type | Required | Default | Description`). Pure (no
 * `astro:content`) so it is unit-testable; renderApiReferenceTable loads the model
 * and calls this.
 */
export function buildApiReferenceSection(
    { title, meta, config, properties }: ApiReferenceSection,
    links: LinkContext
): string {
    const rows = buildRows(properties, config, links);
    if (rows.length === 0) {
        return '';
    }
    return [buildSectionHeader({ title, meta, config }, links), buildTable(rows)].filter(Boolean).join('\n\n');
}

/**
 * Reproduce the copy the page leads the table with: the heading (only when the page
 * shows one), the section description and the "see also" page link. Mirrors
 * Section/SectionHeader so the markdown does not invent headings the reader cannot
 * find on the HTML page.
 */
function buildSectionHeader({ title, meta, config }: Omit<ApiReferenceSection, 'properties'>, links: LinkContext) {
    if (config.isSubset) {
        return '';
    }

    const parts: string[] = [];
    if (!config.hideHeader) {
        parts.push(`### ${meta?.displayName || title}`);
    }
    if (meta?.description) {
        parts.push(resolveMarkdownLinks(String(meta.description).trim(), links));
    }
    if (meta?.page?.url) {
        parts.push(`See [${meta.page.name}](${resolveDocUrl(meta.page.url, links)}) for more information.`);
    }
    return parts.join('\n\n');
}

function buildRows(properties: Record<string, any>, config: Record<string, any>, links: LinkContext): PropertyRow[] {
    const rows: PropertyRow[] = [];
    const names = Object.keys(properties ?? {});
    for (let i = 0, len = names.length; i < len; ++i) {
        const name = names[i];
        const prop = properties[name];
        if (!prop || typeof prop !== 'object') {
            continue;
        }
        const definition = prop.definition ?? {};
        const { gridOpProp, propertyType } = prop;
        const comment = gridOpProp?.meta?.comment;
        const definitionType = typeof definition.type === 'string' ? definition.type : undefined;
        const type = propertyType || definitionType || getInterfaceName(name);
        // Mirror the site's getDescription fallback: explicit description, then the
        // resolved code comment, then the parent object's meta description.
        const rawDescription = definition.description || comment || definition.meta?.description;
        // Also getDescription's isObject: a property with no prose of its own is the
        // parent of a child object, whose type the page links to an in-page anchor the
        // markdown has no equivalent for — so leave those types unlinked.
        const isObject = !definition.description && !comment;
        const tags = gridOpProp?.meta?.tags ?? definition.tags ?? [];
        rows.push({
            name,
            type: String(type ?? ''),
            typeUrl: isObject ? undefined : buildTypeUrl(definition, gridOpProp, propertyType, links),
            isRequired: Boolean(definition.isRequired),
            defaultValue: buildDefaultValue(definition, tags),
            // The page shows the options, "see also" link, module badges and `Initial`
            // badge alongside the description, so keep them in that column in that order
            // rather than giving each one a column of its own.
            description: [
                toCellText(rawDescription, links),
                buildOptions(definition),
                buildMoreLink(definition, config, links),
                buildModuleLinks(tags, links),
                buildInitialLink(tags, config, links),
            ]
                .filter(Boolean)
                .join(' '),
        });
    }
    return rows;
}

/**
 * The type badge's link, mirroring Property's getDefinitionTypeUrl: the docs config type
 * wins over the type resolved from source, and `Function` types are never linked.
 * getTypeUrl already framework-prefixes the URL, so only the absolute step is left. An
 * inferred type (the page's last resort) is always a primitive, so there is nothing to
 * gain from falling back to it here.
 */
function buildTypeUrl(
    definition: Record<string, any>,
    gridOpProp: Record<string, any> | undefined,
    propertyType: string | undefined,
    { framework, siteRoot }: LinkContext
): string | undefined {
    if (propertyType === 'Function') {
        return undefined;
    }
    const type = definition.type ?? gridOpProp?.type;
    if (!type) {
        return undefined;
    }
    try {
        const typeUrl = getTypeUrl(type, framework);
        return typeUrl ? toAbsoluteUrl(typeUrl, siteRoot) : undefined;
    } catch {
        // Not a doc-relative type link — leave the type unlinked rather than emit a URL
        // the reader cannot follow.
        return undefined;
    }
}

/** Mirrors Property's getTagsData: an explicit default wins over the `@default` JSDoc tag. */
function buildDefaultValue(definition: Record<string, any>, tags: { name: string; comment?: string }[]): string {
    const jsdocDefault = tags.find((tag) => tag.name === 'default');
    const defaultValue = definition.default ?? jsdocDefault?.comment;
    if (defaultValue == null) {
        return '';
    }
    const formatted = Array.isArray(defaultValue)
        ? `[${defaultValue.map((value) => `"${value}"`).join(', ')}]`
        : String(defaultValue);
    return `\`${escapeCell(formatted)}\``;
}

/** The values the page lists under the description when a property is a fixed set. */
function buildOptions(definition: Record<string, any>): string {
    const options = definition.options;
    if (!Array.isArray(options) || options.length === 0) {
        return '';
    }
    const formatted = options.map((option) => `\`${escapeCell(formatJson(option))}\``).join(', ');
    return `Options: ${formatted}.`;
}

/**
 * The property's "see also" doc link, which the page renders under the description.
 * `hideMore` mirrors the page suppressing it when a tag picks properties by name, as
 * those pages are usually the link target themselves.
 */
function buildMoreLink(definition: Record<string, any>, config: Record<string, any>, links: LinkContext): string {
    const more = definition.more;
    if (!more?.url || !more.name || config.hideMore) {
        return '';
    }
    return `See [${escapeCell(String(more.name))}](${resolveDocUrl(more.url, links)}) for more information.`;
}

/**
 * The `@initial` badge as a link to the page explaining initial-only options, matching
 * the badge the page shows next to the type.
 */
function buildInitialLink(tags: Record<string, any>[], config: Record<string, any>, links: LinkContext): string {
    if (!tags.some((tag) => tag.name === 'initial')) {
        return '';
    }
    return `[Initial](${resolveDocUrl(config.initialLink ?? INITIAL_URL, links)}).`;
}

/**
 * The `@agModule` tag as a link to the module registry, matching the PropertyModules
 * badges on the page. `modules` is resolved by getApiDocumentationModel; the interface
 * path has no such enrichment, so fall back to the raw tag comment.
 */
function buildModuleLinks(tags: Record<string, any>[], links: LinkContext): string {
    const tag = tags.find((entry) => entry.name === AG_MODULE_TAG_NAME);
    if (!tag) {
        return '';
    }
    const names: string[] = tag.modules
        ? tag.modules.map((module: { name: string }) => module.name)
        : String(tag.comment ?? '')
              .split('/')
              .map((name) => name.trim().replace(/`/g, ''));
    const present = names.filter(Boolean);
    if (present.length === 0) {
        return '';
    }
    const url = resolveDocUrl(MODULES_URL, links);
    const moduleLinks = present.map((name) => `[\`${name}\`](${url})`).join(', ');
    return present.length > 1 ? `Modules (any of): ${moduleLinks}.` : `Module: ${moduleLinks}.`;
}

function buildTable(rows: PropertyRow[]): string {
    const lines = ['| Property | Type | Required | Default | Description |', '| --- | --- | --- | --- | --- |'];
    for (let i = 0, len = rows.length; i < len; ++i) {
        const { name, type, typeUrl, isRequired, defaultValue, description } = rows[i];
        // The page makes the type badge itself the link, so keep the code span inside
        // the label rather than trailing the cell with a separate link.
        const typeText = `\`${escapeCell(type)}\``;
        const typeCell = typeUrl ? `[${typeText}](${typeUrl})` : typeText;
        lines.push(`| \`${name}\` | ${typeCell} | ${isRequired ? 'Yes' : ''} | ${defaultValue} | ${description} |`);
    }
    return lines.join('\n');
}

function toCellText(raw: unknown, links: LinkContext): string {
    if (!raw) {
        return '';
    }
    const text = String(raw)
        // {@link Target | Display} → Display (or Target)
        .replace(/\{@link(?:code|plain)?\s+([^}|]+?)(?:\s*\|\s*([^}]+))?\}/g, (_match, target, display) =>
            (display || target).trim()
        )
        // The default has its own column, so drop the JSDoc tag from the prose,
        // matching the page's removeDefaultValue.
        .replace(/@default .*\n/g, '')
        // Strip any embedded HTML so the cell stays plain markdown.
        .replace(/<[^>]+>/g, '')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\|/g, '\\|');
    return resolveMarkdownLinks(text, links);
}

/**
 * Make the doc links inside reference prose absolute, so a `.md` read out of context
 * resolves them — the page does the equivalent via convertMarkdown/urlWithPrefix.
 */
function resolveMarkdownLinks(text: string, links: LinkContext): string {
    return text.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_match, label, href) => `[${label}](${resolveDocUrl(href, links)})`
    );
}

function resolveDocUrl(href: string, { framework, siteRoot }: LinkContext): string {
    try {
        return toAbsoluteUrl(urlWithPrefix({ url: href, framework }), siteRoot);
    } catch {
        // Not a doc-relative URL (e.g. a bare relative path) — leave it untouched.
        return href;
    }
}

function escapeCell(text: string): string {
    return text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
}
