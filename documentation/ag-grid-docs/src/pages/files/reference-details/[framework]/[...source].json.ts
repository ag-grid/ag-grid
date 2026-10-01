import type { Framework } from '@ag-grid-types';
import type { Config } from '@components/reference-documentation/types';
import { flattenModules } from '@components/reference-documentation/utils/flattenModules';
import { getApiDocumentationModel } from '@components/reference-documentation/utils/getApiDocumentationModel';
import { getPropertiesFromSource } from '@components/reference-documentation/utils/getPropertiesFromSource';
import { getDetailsKey } from '@components/reference-documentation/utils/referenceDetails';
import { FRAMEWORKS } from '@constants';
import { getJsonFile } from '@utils/pages';
import { type CollectionEntry, getCollection, getEntry } from 'astro:content';

// The expandable type signatures for one apiDocumentation source, keyed by section and property
// name. <Property> fetches this on first expand so the signatures — which dwarf the rest of a
// reference page — no longer ship with every page that documents the source (SE-115).
export async function getStaticPaths() {
    const sources = await getCollection('apiDocumentation');

    return sources.flatMap((entry) =>
        FRAMEWORKS.map((framework) => ({
            params: { framework, source: entry.id },
        }))
    );
}

export async function GET({ params }: { params: Record<string, string> }) {
    const framework = params.framework as Framework;
    const source = `${params.source}.json`;

    const interfaceLookup = getJsonFile('reference/interfaces.AUTO.json');
    const { data: modules } = (await getEntry('moduleMappings', 'modules')) as CollectionEntry<'moduleMappings'>;
    const { sources, propertiesFromFiles, propertyConfigs, codeConfigs } = await getPropertiesFromSource({
        source,
        sources: [],
    });

    // Built without a `detailsUrl`, so the model resolves the signatures inline for collection here.
    const model = getApiDocumentationModel({
        framework,
        sources,
        section: '',
        names: [],
        config: {} as Config,
        propertiesFromFiles,
        propertyConfigs,
        interfaceLookup,
        codeConfigs,
        allModules: flattenModules(modules),
    });

    const details: Record<string, string> = {};
    if (model?.type === 'multiple') {
        for (const [section, { properties }] of model.entries) {
            for (const [name, property] of Object.entries(properties)) {
                if (property.detailsCode) {
                    details[getDetailsKey({ section, name })] = property.detailsCode;
                }
            }
        }
    }

    return new Response(JSON.stringify(details), {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}
