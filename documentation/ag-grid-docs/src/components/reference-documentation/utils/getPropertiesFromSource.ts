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
    const fileEntryPromises = sources.map(async (s: string) => {
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
        }
        return fileEntry;
    });
    const fileEntries = await Promise.all(fileEntryPromises);

    const propertiesFromFiles: any[] = [];
    const propertyConfigs: any[] = [];
    const codeConfigs: Record<string, any> = {};

    for (let i = 0; i < sources.length; i++) {
        const fileEntry = fileEntries[i];
        if (!fileEntry) {
            continue;
        }

        const s = sources[i];
        const propsFile = fileEntry.data;
        propertiesFromFiles.push(propsFile);

        const config = propsFile['_config_'];
        if (!config) {
            // eslint-disable-next-line no-console
            console.warn(`ApiDocumentation: _config_ property missing from source ${s}.`);
            continue;
        }
        propertyConfigs.push(config);

        const codeSrc = config.codeSrc;
        if (codeSrc && !(codeSrc in codeConfigs)) {
            codeConfigs[codeSrc] = getJsonFile(`reference/${codeSrc}`);
        }

        if (config.validate) {
            const codeConfig = codeConfigs[codeSrc];
            if (!codeConfig) {
                throw new Error(`${s} codeSrc file not found: ${codeSrc}`);
            }
            validateDocumentedProperties(propsFile, codeConfig, s);
        }
    }

    return {
        sources,
        propertiesFromFiles,
        propertyConfigs,
        codeConfigs,
    };
};

function validateDocumentedProperties(propsFile: any, codeConfig: any, source: string) {
    const config = propsFile['_config_'];
    const codeSrc = config.codeSrc;
    const undocumentedProperties = config.undocumentedProperties ?? {};

    const keysToDocument = new Set(
        Object.keys(codeConfig).filter((k) => {
            if (k in undocumentedProperties) {
                return false;
            }
            const entry = codeConfig[k];
            if (entry?.meta?.tags?.some((t: any) => t.name === 'deprecated')) {
                return false;
            }
            if (config.excludeEvents && entry?.meta?.isEvent) {
                return false;
            }
            if (config.onlyEvents) {
                if (!entry?.meta?.isEvent) {
                    return false;
                }
                // Events like onCellClicked are the grid option callback form;
                // event docs use the unprefixed name (cellClicked)
                if (/^on[A-Z]/.test(k)) {
                    return false;
                }
            }
            return true;
        })
    );

    const documentedKeys = Object.entries(propsFile)
        .filter(([k]) => k !== '_config_')
        .flatMap(([, section]) => Object.keys(section as object).filter((k) => k !== 'meta'));

    const stale = documentedKeys.filter((k) => !keysToDocument.has(k));
    const undocumented = [...keysToDocument].filter((k) => !documentedKeys.includes(k));

    if (stale.length || undocumented.length) {
        const msgs: string[] = [];
        if (stale.length) {
            msgs.push(
                `These ${source} keys are documented but not in the API (checking ${codeSrc}): ${stale.join(', ')}`
            );
        }
        if (undocumented.length) {
            msgs.push(
                `These ${source} keys are present in the API (checking ${codeSrc}) but not documented: ${undocumented.join(', ')}`
            );
        }
        throw new Error(msgs.join('\n'));
    }
}
