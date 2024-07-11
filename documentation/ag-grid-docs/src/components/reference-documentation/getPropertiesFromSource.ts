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
        const fileEntry = await getEntry('api-documentation', fileName);
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

    return {
        sources,
        propertiesFromFiles,
        propertyConfigs,
        codeConfigs,
    };
};
