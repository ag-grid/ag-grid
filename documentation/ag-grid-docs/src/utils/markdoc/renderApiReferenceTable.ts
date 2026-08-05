import type { Framework } from '@ag-grid-types';
import { flattenModules } from '@components/reference-documentation/utils/flattenModules';
import { getApiDocumentationModel } from '@components/reference-documentation/utils/getApiDocumentationModel';
import { getInterfaceDocumentationModel } from '@components/reference-documentation/utils/getInterfaceDocumentationModel';
import { getOverrides } from '@components/reference-documentation/utils/getOverrides';
import { getPropertiesFromSource } from '@components/reference-documentation/utils/getPropertiesFromSource';
import { getJsonFile } from '@utils/pages';
import { type CollectionEntry, getEntry } from 'astro:content';

import { type LinkContext, buildApiReferenceSection } from './buildApiReferenceTable';

interface RenderApiReferenceTableParams {
    attributes: Record<string, any>;
    framework: Framework;
    kind: 'api' | 'interface';
    siteRoot?: string;
}

/**
 * Render an `apiDocumentation` / `interfaceDocumentation` Markdoc tag as Markdown,
 * reusing the same reference model the site's React components consume. Runs inside
 * the Astro endpoint, so it can use `astro:content` and `getJsonFile` exactly as the
 * `.astro` components do; the model is handed to buildApiReferenceSection for the
 * actual serialization. Never throws — reference issues degrade to empty output
 * rather than failing the build.
 */
export async function renderApiReferenceTable({
    attributes,
    framework,
    kind,
    siteRoot,
}: RenderApiReferenceTableParams): Promise<string> {
    try {
        const links: LinkContext = { framework, siteRoot };
        return kind === 'interface'
            ? await renderInterfaceTable(attributes, framework, links)
            : await renderApiTable(attributes, framework, links);
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

async function renderApiTable(
    attributes: Record<string, any>,
    framework: Framework,
    links: LinkContext
): Promise<string> {
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
        // Mirrors ApiDocumentation.tsx: a named section is a subset of a larger
        // reference, and the page renders it without a header or description.
        return buildApiReferenceSection(
            { title: model.title, config: { ...model.config, isSubset: true }, properties: model.properties },
            links
        );
    }

    const parts: string[] = [];
    for (let i = 0, len = model.entries.length; i < len; ++i) {
        const [name, entry] = model.entries[i];
        parts.push(
            buildApiReferenceSection(
                { title: name, meta: entry.meta, config: model.config ?? {}, properties: entry.properties },
                links
            )
        );
    }
    return parts.filter(Boolean).join('\n\n');
}

async function renderInterfaceTable(
    attributes: Record<string, any>,
    framework: Framework,
    links: LinkContext
): Promise<string> {
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
    // Mirrors InterfaceDocumentation.astro, which hides the header unless the tag
    // asks for it — the page leads with the interface description instead.
    const sectionConfig = { ...config, hideHeader: config?.hideHeader ?? true };
    return buildApiReferenceSection(
        { title: interfaceName, meta: model.meta, config: sectionConfig, properties: group },
        links
    );
}
