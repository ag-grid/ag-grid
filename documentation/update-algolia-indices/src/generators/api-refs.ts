import fs from 'fs';

import { API_PROPERTIES_RANK_OFFSET, TYPE_PROPERTY_INDEXING } from '../config';
import type { AlgoliaRecord } from '../types/algolia';
import { API_REFERENCE_DIR, API_SOURCE_DIR } from '../utils/constants';
import { extractCodeWords } from './docs-pages';

export interface APIPageData {
    pagePath: `${string}/`;
    propertiesFileUrl: string;
    breadcrumbSuffix: string;
}

/**
 * Finds all the API pages to be indexed
 */
export const getApiPageData = (): APIPageData[] => {
    const result: APIPageData[] = [];

    const pageNames = fs.readdirSync(API_SOURCE_DIR, { withFileTypes: true });
    pageNames.forEach((page) => {
        if (page.isDirectory()) {
            const pagePath = `${API_SOURCE_DIR}/${page.name}`;
            const files = fs.readdirSync(pagePath);
            const configFiles = files.filter((file) => file.endsWith('.json'));

            configFiles.forEach((file) => {
                const pageName = page.name
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                const config: APIPageData = {
                    pagePath: `${page.name}/`,
                    propertiesFileUrl: `${pagePath}/${file}`,
                    breadcrumbSuffix: pageName,
                };
                result.push(config);
            });
        }
    });

    return result;
};

interface Link {
    name: string;
    url: string;
}
interface APIRefMeta {
    meta?: { displayName: string; page: Link };
}
type APIProperties = Record<string, { description: string; more: Link; addNestedFields?: boolean }>;
type APIRefSection = APIProperties & APIRefMeta;
interface APIPropertyRefSource {
    meta: {
        all: string;
        comment: string;
        tags: string[];
    };
    type: {
        returnType: string;
        arguments?: Record<string, string>; // For methods: argument name -> type string
        nested?: Record<string, APIPropertyRefSource['meta']>;
    };
}

const IGNORE_FIELDS = new Set(['enable', 'enabled', 'mode', 'meta', 'type', 'docs']);

let docInterfacesCache: Record<string, any> | null = null;

/**
 * Loads and caches the doc-interfaces.AUTO.json file containing all interface definitions
 */
const getDocInterfaces = (): Record<string, any> => {
    if (!docInterfacesCache) {
        const docInterfacesPath = `${API_REFERENCE_DIR}/doc-interfaces.AUTO.json`;
        const docInterfacesFile = fs.readFileSync(docInterfacesPath, 'utf8');
        docInterfacesCache = JSON.parse(docInterfacesFile) as Record<string, any>;
    }
    return docInterfacesCache;
};

const getFirstLevelProperties = (typeName: string): string[] => {
    const docInterfaces = getDocInterfaces();
    const interfaceData = docInterfaces[typeName];

    if (!interfaceData || typeof interfaceData !== 'object') {
        return [];
    }

    return Object.keys(interfaceData).filter((key) => !IGNORE_FIELDS.has(key));
};

const paramToVariableName = (paramName: string): string => {
    const kebabCase = paramName.replace(/[A-Z]|\d+/g, (m) => `-${m}`).toLowerCase();
    return `--ag-${kebabCase}`;
};

const getCodeWordsForApiProperty = (data: APIPropertyRefSource, normalizedText: string): string[] => {
    const docInterfaces = getDocInterfaces();
    const allWords: string[] = [];

    allWords.push(...extractCodeWords(normalizedText));

    const isMethod = data.type.arguments !== undefined;

    // Get type strings to analyze
    const potentialTypeNames: string[] = [];
    if (isMethod) {
        // For methods: extract from argument types only
        Object.values(data.type.arguments || {}).forEach((argType) => {
            if (typeof argType === 'string') {
                potentialTypeNames.push(argType);
            }
        });
    } else {
        // For properties: extract from return type
        potentialTypeNames.push(data.type.returnType);
    }

    const relatedTypeNames = potentialTypeNames
        // extract all words from type string
        .flatMap((typeString) => [...new Set(typeString.match(/\w+/g))])
        .filter((name) => docInterfaces[name]);

    // All related type names are searchable code words
    allWords.push(...relatedTypeNames);

    // Also, extract first-level properties from each related type, unless we've
    // configured an exclusion to prevent this
    for (const typeName of relatedTypeNames) {
        const exclusion = TYPE_PROPERTY_INDEXING[typeName];

        if (exclusion === 'never') {
            continue;
        }

        if (isMethod && exclusion === 'not-for-function-argument') {
            continue;
        }

        allWords.push(...getFirstLevelProperties(typeName));
    }

    return [...new Set(allWords)];
};

/**
 * Parse the API files to retrieve the index data
 */
export const parseApiPageData = (details: APIPageData): AlgoliaRecord[] => {
    const records: AlgoliaRecord[] = [];

    const { propertiesFileUrl, breadcrumbSuffix, pagePath } = details;

    const file = fs.readFileSync(propertiesFileUrl, 'utf8');
    const { _config_, ...sections } = JSON.parse(file);
    if (!_config_) return []; // if no config, wrong type of file.
    const { codeSrc, codeWordsMode } = _config_;
    if (!codeSrc) return []; // if no src, wrong type of file.

    const referenceFile = fs.readFileSync(`${API_REFERENCE_DIR}/${codeSrc}`, 'utf8');
    const apiPropertiesSourceFile = JSON.parse(referenceFile) as Record<string, APIPropertyRefSource>;

    let position = API_PROPERTIES_RANK_OFFSET;
    // load the defined sections for the API docs
    Object.entries(sections as APIRefSection[]).forEach(([sectionKey, section]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { meta, ...properties } = section;

        Object.entries(properties).forEach(([propertyKey, property]) => {
            const { description, addNestedFields = false } = property; // more can include a link to a page with more info

            const data = apiPropertiesSourceFile[propertyKey];

            // Skip if property not found in source file
            if (!data) {
                console.warn(`Property "${propertyKey}" not found in ${codeSrc}`);
                return;
            }

            const breadcrumb = `API > ${breadcrumbSuffix}`;
            const path = `${pagePath}#reference-${sectionKey}-${propertyKey}`;
            const text = description ?? data.meta.comment;
            const normalizedText = text?.replace(/\[([^\]]+)\][^)]+\)/g, '$1');

            let codeWords: string[];
            if (codeWordsMode === 'cssVariable') {
                codeWords = [paramToVariableName(propertyKey)];
            } else if (TYPE_PROPERTY_INDEXING[propertyKey] === 'never') {
                codeWords = [];
            } else {
                codeWords = getCodeWordsForApiProperty(data, normalizedText);
            }

            records.push({
                source: 'api',
                objectID: path,
                title: breadcrumbSuffix,
                heading: propertyKey,
                text: normalizedText,
                codeWords: codeWords.length > 0 ? codeWords : undefined,
                breadcrumb: breadcrumb,
                path: path,
                rank: position++,
            });

            if (addNestedFields) {
                for (const key in data.type.nested ?? {}) {
                    if (IGNORE_FIELDS.has(key)) {
                        continue;
                    }
                    records.push({
                        source: 'api',
                        objectID: `${path}:${key}`,
                        title: breadcrumbSuffix,
                        heading: key,
                        text: data.type.nested?.[key].comment ?? '',
                        breadcrumb,
                        path,
                        rank: position++,
                    });
                }
            }
        });
    });

    return records;
};
