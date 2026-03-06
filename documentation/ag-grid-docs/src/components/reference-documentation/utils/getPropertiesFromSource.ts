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
        validateDocumentedProperties(propertiesFromFiles, codeConfigs, 'theming-api.AUTO.json', 'theming-api');
    }

    // Match 'grid-options/properties' specifically to avoid triggering on
    // react-grid-options.json, which documents a small React-specific subset
    if (sources.some((s) => s.includes('grid-options/properties'))) {
        validateDocumentedProperties(
            propertiesFromFiles,
            codeConfigs,
            'grid-options.AUTO.json',
            'grid-options',
            gridOptionsApiKeyFilter
        );
    }

    if (sources.some((s) => s.includes('column-object/properties'))) {
        validateDocumentedProperties(
            propertiesFromFiles,
            codeConfigs,
            'column.AUTO.json',
            'column-object',
            deprecatedFilter
        );
    }

    if (sources.some((s) => s.includes('column-object-group/properties'))) {
        validateDocumentedProperties(
            propertiesFromFiles,
            codeConfigs,
            'columnGroup.AUTO.json',
            'column-object-group',
            deprecatedFilter
        );
    }

    if (sources.some((s) => s.includes('column-object-group/provided-properties'))) {
        validateDocumentedProperties(
            propertiesFromFiles,
            codeConfigs,
            'providedColumnGroup.AUTO.json',
            'column-object-group/provided',
            deprecatedFilter
        );
    }

    if (sources.some((s) => s.includes('column-properties/properties'))) {
        validateDocumentedProperties(
            propertiesFromFiles,
            codeConfigs,
            'column-options.AUTO.json',
            'column-properties',
            deprecatedFilter
        );
    }

    if (sources.some((s) => s.includes('row-object/properties'))) {
        validateDocumentedProperties(
            propertiesFromFiles,
            codeConfigs,
            'row-node.AUTO.json',
            'row-object',
            deprecatedFilter
        );
    }

    return {
        sources,
        propertiesFromFiles,
        propertyConfigs,
        codeConfigs,
    };
};

// Properties that exist in the public API but are intentionally not documented
const INTENTIONALLY_UNDOCUMENTED = new Set([
    'enableGroupEdit', // AG-2995 - "Remove the grid option enableGroupEdit from docs API page to discourage its use"
    'pivotKeys', // Internal use only, doc comment says "Never set this"
    'pivotValueColumn', // Internal use only, doc comment says "Never set this"
    'pivotTotalColumnIds', // Internal use only, doc comment says "Never set this"
]);

function deprecatedFilter(_key: string, entry: any): boolean {
    return !entry?.meta?.tags?.some((t: any) => t.name === 'deprecated');
}

function gridOptionsApiKeyFilter(key: string, entry: any): boolean {
    if (!deprecatedFilter(key, entry)) {
        return false;
    }
    if (entry?.meta?.isEvent) {
        return false;
    }
    return true;
}

function validateDocumentedProperties(
    properties: any[],
    codeConfigs: any,
    codeSrc: string,
    label: string,
    apiKeyFilter?: (key: string, entry: any) => boolean
) {
    const propsFile = properties.find((p) => p['_config_']?.codeSrc === codeSrc);
    if (!propsFile) {
        throw new Error(`No properties.json with codeSrc: "${codeSrc}"`);
    }
    const codeConfig = codeConfigs[codeSrc];
    if (!codeConfig) {
        throw new Error(`${label} codeSrc file not found: ${codeSrc}`);
    }

    const apiKeys = new Set(
        Object.keys(codeConfig).filter(
            (k) => !INTENTIONALLY_UNDOCUMENTED.has(k) && (!apiKeyFilter || apiKeyFilter(k, codeConfig[k]))
        )
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
                `These ${label} keys are documented but not in the API (checking ${codeSrc}): ${stale.join(', ')}`
            );
        }
        if (undocumented.length) {
            msgs.push(
                `These ${label} keys are present in the API (checking ${codeSrc}) but not documented: ${undocumented.join(', ')}`
            );
        }
        throw new Error(msgs.join('\n'));
    }
}
