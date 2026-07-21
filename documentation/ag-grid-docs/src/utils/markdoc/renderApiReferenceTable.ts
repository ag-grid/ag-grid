import type { Framework } from '@ag-grid-types';
import { flattenModules } from '@components/reference-documentation/utils/flattenModules';
import { getApiDocumentationModel } from '@components/reference-documentation/utils/getApiDocumentationModel';
import { getInterfaceDocumentationModel } from '@components/reference-documentation/utils/getInterfaceDocumentationModel';
import { getOverrides } from '@components/reference-documentation/utils/getOverrides';
import { getPropertiesFromSource } from '@components/reference-documentation/utils/getPropertiesFromSource';
import { getInterfaceName } from '@components/reference-documentation/utils/interface-helpers';
import { getJsonFile } from '@utils/pages';
import { type CollectionEntry, getEntry } from 'astro:content';

interface RenderApiReferenceTableParams {
    attributes: Record<string, any>;
    framework: Framework;
    kind: 'api' | 'interface';
}

interface PropertyRow {
    name: string;
    type: string;
    description: string;
}

/**
 * Render an `apiDocumentation` / `interfaceDocumentation` Markdoc tag as a
 * Markdown table (`Property | Type | Description`), reusing the same reference
 * model the site's React components consume. Runs inside the Astro endpoint, so
 * it can use `astro:content` and `getJsonFile` exactly as the `.astro`
 * components do. Never throws — reference issues degrade to empty output rather
 * than failing the build.
 */
export async function renderApiReferenceTable({
    attributes,
    framework,
    kind,
}: RenderApiReferenceTableParams): Promise<string> {
    try {
        return kind === 'interface'
            ? await renderInterfaceTable(attributes, framework)
            : await renderApiTable(attributes, framework);
    } catch (error) {
        // The .md is a supplementary artifact, so one bad reference tag must not
        // fail the whole build — but the failure is reported with context so a
        // systemic regression surfaces in build/test logs rather than silently
        // shipping a page with an entire API section missing.
        const id = attributes?.interfaceName ?? attributes?.source ?? attributes?.sources ?? '(unknown)';
        // eslint-disable-next-line no-console
        console.warn(
            `renderApiReferenceTable: failed to render ${kind} reference for ${JSON.stringify(id)} — ${(error as Error)?.message ?? error}`
        );
        return '';
    }
}

async function renderApiTable(attributes: Record<string, any>, framework: Framework): Promise<string> {
    const { source, sources: sourcesProp, section, names, config } = attributes;

    const interfaceLookup = getJsonFile('reference/interfaces.AUTO.json');
    const { data: modules } = (await getEntry('moduleMappings', 'modules')) as CollectionEntry<'moduleMappings'>;
    const allModules = flattenModules(modules);

    const { sources, propertiesFromFiles, propertyConfigs, codeConfigs } = await getPropertiesFromSource({
        source,
        sources: sourcesProp,
    });

    const model = getApiDocumentationModel({
        framework,
        sources,
        section,
        names,
        config,
        propertiesFromFiles,
        propertyConfigs,
        interfaceLookup,
        codeConfigs,
        allModules,
    });

    if (!model) {
        return '';
    }

    if (model.type === 'single') {
        return renderSection(model.title ?? model.meta?.displayName, model.properties);
    }

    const parts: string[] = [];
    for (let i = 0, len = model.entries.length; i < len; ++i) {
        const [name, entry] = model.entries[i];
        parts.push(renderSection(entry.meta?.displayName ?? name, entry.properties));
    }
    return parts.filter(Boolean).join('\n\n');
}

async function renderInterfaceTable(attributes: Record<string, any>, framework: Framework): Promise<string> {
    const { interfaceName, overrideSrc, names, exclude, config } = attributes;

    const overrides = await getOverrides(overrideSrc);
    const interfaceLookup = getJsonFile('reference/interfaces.AUTO.json');
    const codeLookup = getJsonFile('reference/doc-interfaces.AUTO.json');

    const model = getInterfaceDocumentationModel({
        framework,
        interfaceName,
        overrides: overrides as any,
        names,
        exclude,
        config,
        codeLookup,
        interfaceLookup,
    });

    if (model.type === 'code') {
        return `\`\`\`ts\n${model.code.trimEnd()}\n\`\`\``;
    }

    const group = (model.properties as Record<string, any>)[interfaceName] ?? {};
    return renderSection(model.meta?.displayName ?? interfaceName, group as Record<string, any>);
}

function renderSection(title: string | undefined, properties: Record<string, any>): string {
    const rows = buildRows(properties);
    if (rows.length === 0) {
        return '';
    }
    const heading = title ? `### ${title}\n\n` : '';
    return heading + renderTable(rows);
}

function buildRows(properties: Record<string, any>): PropertyRow[] {
    const rows: PropertyRow[] = [];
    const names = Object.keys(properties ?? {});
    for (let i = 0, len = names.length; i < len; ++i) {
        const name = names[i];
        const prop = properties[name];
        if (!prop || typeof prop !== 'object') {
            continue;
        }
        const definition = prop.definition ?? {};
        const definitionType = typeof definition.type === 'string' ? definition.type : undefined;
        const type = prop.propertyType || definitionType || getInterfaceName(name);
        // Mirror the site's getDescription fallback: explicit description, then the
        // resolved code comment, then the parent object's meta description.
        const rawDescription = definition.description || prop.gridOpProp?.meta?.comment || definition.meta?.description;
        rows.push({
            name,
            type: String(type ?? ''),
            description: toCellText(rawDescription),
        });
    }
    return rows;
}

function renderTable(rows: PropertyRow[]): string {
    const lines = ['| Property | Type | Description |', '| --- | --- | --- |'];
    for (let i = 0, len = rows.length; i < len; ++i) {
        const { name, type, description } = rows[i];
        lines.push(`| \`${name}\` | \`${escapeCell(type)}\` | ${description} |`);
    }
    return lines.join('\n');
}

function toCellText(raw: unknown): string {
    if (!raw) {
        return '';
    }
    return (
        String(raw)
            // {@link Target | Display} → Display (or Target)
            .replace(/\{@link(?:code|plain)?\s+([^}|]+?)(?:\s*\|\s*([^}]+))?\}/g, (_match, target, display) =>
                (display || target).trim()
            )
            // Strip any embedded HTML so the cell stays plain markdown.
            .replace(/<[^>]+>/g, '')
            .replace(/\r?\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\|/g, '\\|')
    );
}

function escapeCell(text: string): string {
    return text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
}
