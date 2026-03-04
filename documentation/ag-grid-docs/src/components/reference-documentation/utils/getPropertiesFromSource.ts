import { getIsDev } from '@utils/env';
import { getJsonFile } from '@utils/pages';
import { getEntry } from 'astro:content';

/**
 * NOTE: Keep this as a separate file, so it is not imported by client
 * side code
 */
export const getPropertiesFromSource = async ({
    source,
    sources: sourcesProp,
}: {
    source: string;
    sources: string[];
}) => {
    const sources = source ? [source] : sourcesProp;
    const propertiesFromFilesPromises = sources.map(async (s: string) => {
        // NOTE: Need to remove `.json` for getEntry
        const fileName = s.replace('.json', '');
        const fileEntry = await getEntry('apiDocumentation', fileName);
        if (!fileEntry) {
            const message = `ApiDocumentation source not found: src/content/api-documentation/${fileName}.json`;
            if (getIsDev()) {
                // eslint-disable-next-line no-console
                console.error(message);
            } else {
                throw new Error(message);
            }
        } else {
            return fileEntry.data;
        }
    });
    const propertiesFromFiles = (await Promise.all(propertiesFromFilesPromises)).filter(Boolean);

    const propertyConfigs = propertiesFromFiles
        .map((p) => {
            const config = p['_config_'];
            if (!config) {
                // eslint-disable-next-line no-console
                console.warn(`ApiDocumentation: _config_ property missing from source ${sources.join()}.`);
            }
            return config;
        })
        .filter(Boolean);
    const codeConfigEntries = propertyConfigs
        .map((config) => config.codeSrc)
        .map((fileName) => {
            const referenceFileName = `reference/${fileName}`;
            const file = getJsonFile(referenceFileName);
            return [fileName, file];
        });
    const codeConfigs = Object.fromEntries(codeConfigEntries);

    if (sources.some((s) => s.includes('theming-api'))) {
        validateDocumentedProperties(propertiesFromFiles, codeConfigs, 'theming-api');
    }

    if (sources.some((s) => s.includes('grid-options'))) {
        validateDocumentedProperties(propertiesFromFiles, codeConfigs, 'grid-options', gridOptionsApiKeyFilter);
    }

    return {
        sources,
        propertiesFromFiles,
        propertyConfigs,
        codeConfigs,
    };
};

// Grid options that exist in the API but are intentionally not documented
const UNDOCUMENTED_GRID_OPTIONS = new Set([
    'enableGroupEdit', // AG-2995 - "Remove the grid option enableGroupEdit from docs API page to discourage its use"
]);

function gridOptionsApiKeyFilter(key: string, entry: any): boolean {
    if (UNDOCUMENTED_GRID_OPTIONS.has(key)) return false;
    const meta = entry?.meta;
    if (!meta) return true;
    if (meta.isEvent) return false;
    if (meta.tags?.some((t: any) => t.name === 'deprecated')) return false;
    return true;
}

function validateDocumentedProperties(
    properties: any[],
    codeConfigs: any,
    slug: string,
    apiKeyFilter?: (key: string, entry: any) => boolean
) {
    const codeSrc = `${slug}.AUTO.json`;
    const label = `${slug} keys`;

    const propsFile = properties.find((p) => p['_config_']?.codeSrc === codeSrc);
    if (!propsFile) {
        throw new Error(`No properties.json with codeSrc: "${codeSrc}"`);
    }
    const codeConfig = codeConfigs[codeSrc];
    if (!codeConfig) {
        throw new Error(`${label} codeSrc file not found: ${codeSrc}`);
    }

    const apiKeys = new Set(
        apiKeyFilter ? Object.keys(codeConfig).filter((k) => apiKeyFilter(k, codeConfig[k])) : Object.keys(codeConfig)
    );

    const documentedKeys = Object.entries(propsFile)
        .filter(([k]) => k !== '_config_')
        .flatMap(([, section]) => Object.keys(section as object).filter((k) => k !== 'meta'));

    const stale = documentedKeys.filter((k) => !apiKeys.has(k));
    const undocumented = [...apiKeys].filter((k) => !documentedKeys.includes(k));

    if (stale.length || undocumented.length) {
        const msgs: string[] = [];
        if (stale.length) {
            msgs.push(
                `These ${label} are documented in ${slug}/properties.json but not in the API (checking ${codeSrc}): ${stale.join(', ')}`
            );
        }
        if (undocumented.length) {
            msgs.push(
                `These ${label} are present in the API (checking ${codeSrc}) but not documented in ${slug}/properties.json: ${undocumented.join(', ')}`
            );
        }
        throw new Error(msgs.join('\n'));
    }
}
