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

    // Validate that theming-api/properties.json keys match the theming-api.AUTO.json keys
    // Only run when actually processing the theming-api source
    if (sources.some((s) => s.includes('theming-api'))) {
        validateThemingApiProperties(propertiesFromFiles, codeConfigs);
    }

    return {
        sources,
        propertiesFromFiles,
        propertyConfigs,
        codeConfigs,
    };
};

function validateThemingApiProperties(properties: any[], codeConfigs: any) {
    const codeSrc = 'theming-api.AUTO.json';
    const propsFile = properties.find((p) => p['_config_']?.codeSrc === codeSrc);
    if (!propsFile) {
        throw new Error(`No properties.json with codeSrc: "${codeSrc}"`);
    }
    const codeConfig = codeConfigs[codeSrc];
    if (!codeConfig) {
        throw new Error(`Theme params codeSrc file not found: ${codeSrc}`);
    }
    const codeKeys = new Set(Object.keys(codeConfig));
    const propsKeys = Object.entries(propsFile)
        .filter(([k]) => k !== '_config_')
        .flatMap(([, section]) => Object.keys(section as object).filter((k) => k !== 'meta'));
    const missing = propsKeys.filter((k) => !codeKeys.has(k));
    const extra = [...codeKeys].filter((k) => !propsKeys.includes(k));
    if (missing.length || extra.length) {
        const msgs: string[] = [];
        if (missing.length) {
            msgs.push(
                `These theme params are documented in theming-api/properties.json but not in the API (checking ${codeSrc}): ${missing.join(', ')}`
            );
        }
        if (extra.length) {
            msgs.push(
                `These theme params are present in the API (checking ${codeSrc}) but not documented in theming-api/properties.json: ${extra.join(', ')}`
            );
        }
        throw new Error(msgs.join('\n'));
    }
}
