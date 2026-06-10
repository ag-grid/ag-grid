import type { Framework } from '@ag-grid-types';
import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import { AG_MODULE_TAG_NAME } from '../constants';
import type {
    ApiDocumentationModel,
    ChildDocEntry,
    Config,
    GridModule,
    ICallSignature,
    InterfaceEntry,
    MetaTag,
    PropertyDisplayData,
    PropertyType,
} from '../types';
import { convertMarkdown, extractJSDocTags, formatJsDocString, inferType } from './documentation-helpers';
import { getDefinitionType } from './getDefinitionType';
import { getShowAdditionalDetails } from './getShowAdditionalDetails';
import { getAllSectionPropertyEntries, mergeObjects } from './interface-helpers';

interface Params {
    framework: Framework;
    sources: string[];
    section: string;
    names: string[];
    config: Config;
    propertiesFromFiles: any;
    propertyConfigs: any[];
    interfaceLookup: Record<string, InterfaceEntry>;
    codeConfigs: Record<string, any>;
    allModules: GridModule[];
}

function addEnterprisePropertyToTags({
    callSignature,
    allModules,
}: {
    callSignature: ICallSignature;
    allModules: GridModule[];
}) {
    if (!callSignature?.meta?.tags) {
        return callSignature;
    }

    const newTags = callSignature.meta?.tags.map((tag) => {
        if (tag.name === AG_MODULE_TAG_NAME) {
            const tagModule = tag.comment.replace(/`/g, '');

            const modules = tagModule
                .split(/\s*\/\s*/)
                .map((m) => {
                    const name = m.trim();
                    if (!name) {
                        return false;
                    }

                    const module = allModules.find((mod) => mod.moduleName === name);
                    return {
                        name,
                        isEnterprise: module?.isEnterprise,
                    };
                })
                .filter(Boolean);

            return {
                ...tag,
                modules,
            };
        }

        return tag;
    });

    return {
        ...callSignature,
        meta: {
            ...callSignature.meta,
            tags: newTags,
        },
    };
}

function getCodeLookup({ propertyConfigs, codeConfigs }: { propertyConfigs: any[]; codeConfigs: Record<string, any> }) {
    let codeLookup = {};
    propertyConfigs.forEach((c) => {
        if (c.codeSrc) {
            const codeConfig = codeConfigs[c.codeSrc];
            codeLookup = { ...codeLookup, ...codeConfig };
        }
    });

    return codeLookup;
}

export function buildDisplayData({
    definition,
    gridOpProp,
    framework,
    config,
}: {
    definition: ChildDocEntry;
    gridOpProp: ICallSignature;
    framework: Framework;
    config: Config;
}): PropertyDisplayData {
    // --- description ---
    let description = '';
    let isObject = false;
    let propDescription: string | undefined =
        definition.description || (gridOpProp?.meta as ICallSignature['meta'])?.comment || undefined;

    if (propDescription) {
        propDescription = formatJsDocString(propDescription);
        if (!definition.description && (gridOpProp?.meta as ICallSignature['meta'])?.all) {
            const { params, returns } = extractJSDocTags((gridOpProp.meta as ICallSignature['meta']).all);
            const paramsStr = params?.map((p) => `<span class="param">\`${p.name}\`: ${p.value}</span>`).join('');
            const returnsStr = returns ? `<strong>Returns:</strong> ${returns}` : '';
            propDescription = [propDescription, paramsStr, returnsStr].filter(Boolean).join('\n');
        }
        description = convertMarkdown(propDescription, framework) ?? '';
    } else {
        if ((definition as any).meta?.description) {
            description = convertMarkdown((definition as any).meta.description, framework) ?? '';
        }
        isObject = true;
    }

    // --- fallbackTypeStr (only needed when definition.type is absent) ---
    let fallbackTypeStr: string | undefined;
    if (!definition.type && gridOpProp?.type) {
        const resolved =
            typeof gridOpProp.type === 'string'
                ? gridOpProp.type
                : ((gridOpProp.type as PropertyType)?.returnType ?? inferType(definition.default));
        fallbackTypeStr = resolved ?? undefined;
    }

    // --- tags: default, isInitial, modules ---
    const tags = (gridOpProp?.meta as ICallSignature['meta'])?.tags ?? (definition as any)?.tags ?? [];
    const jsdocDefault = tags.find((t: any) => t.name === 'default');
    const defaultValue = definition?.default ?? jsdocDefault?.comment;
    const formattedDefaultValue: string | undefined = Array.isArray(defaultValue)
        ? '[' + defaultValue.map((v: any, i: number) => (i === 0 ? `"${v}"` : ` "${v}"`)) + ']'
        : (defaultValue ?? undefined);

    const isInitial = tags.some((t: any) => t.name === 'initial') ?? false;

    let modules: GridModule[] = (tags.find((t: any) => t.name === AG_MODULE_TAG_NAME) as any)?.modules ?? [];
    const restrictedModule: string | undefined = (definition as any)?.restrictModule ?? config.restrictModule;
    if (modules.length > 1 && restrictedModule) {
        const restrictedModuleTag = modules.find((mod) => restrictedModule === mod.name);
        if (restrictedModuleTag) {
            modules = [restrictedModuleTag];
        }
    }

    return {
        description,
        isObject,
        fallbackTypeStr,
        formattedDefaultValue,
        isInitial,
        modules,
    };
}

function getResolvedProperties({
    framework,
    names,
    properties,
    codeLookup,
    interfaceLookup,
    config,
    allModules,
}: {
    framework: Framework;
    names?: string[];
    properties: Record<string, any>;
    codeLookup: Record<string, any>;
    interfaceLookup: Record<string, InterfaceEntry>;
    config: Config;
    allModules: GridModule[];
}) {
    const { meta, ...processedProperties } = properties;

    const resolvedPropertyEntries = Object.entries<ChildDocEntry>(processedProperties)
        .filter(([name]) => {
            return names && names?.length > 0 ? names?.includes(name) : true;
        })
        .filter(([name]) => {
            return config.namePattern ? new RegExp(config.namePattern).test(name) : true;
        })
        .sort((a, b) => {
            return config.sortAlphabetically ? (a[0] < b[0] ? -1 : 1) : 0;
        })
        .map(([name, definition]) => {
            const gridOpProp = addEnterprisePropertyToTags({
                callSignature: codeLookup[name],
                allModules,
            });
            const showAdditionalDetails = getShowAdditionalDetails({ name, definition, gridOpProp, interfaceLookup });
            const { propertyType } = getDefinitionType({
                name,
                definition,
                gridOpProp,
                interfaceLookup,
                isEvent: meta?.isEvent,
                config,
            });
            const displayData = buildDisplayData({
                definition,
                gridOpProp,
                framework,
                config,
            });

            return [
                name,
                {
                    definition,
                    displayData,
                    showAdditionalDetails,
                    propertyType,
                },
            ];
        });
    const resolvedProperties = Object.fromEntries(resolvedPropertyEntries);

    return { meta, resolvedProperties };
}

function getSectionProperties({
    framework,
    section,
    names,
    propertiesFromFiles,
    codeLookup,
    interfaceLookup,
    config,
    allModules,
}: {
    framework: Framework;
    section: string;
    names?: string[];
    propertiesFromFiles: unknown;
    codeLookup: Record<string, any>;
    interfaceLookup: Record<string, InterfaceEntry>;
    config: Config;
    allModules: GridModule[];
}) {
    const keys = section.split('.');
    const title = keys[keys.length - 1];
    const processed = keys.reduce<any>((current, key) => {
        return current.map((x: any) => {
            const property = x[key];
            if (!property) {
                throwDevWarning({
                    message: `<api-documentation>: Could not find a prop ${key} under section ${section}!`,
                });
            }

            return property;
        });
    }, propertiesFromFiles);

    const properties = mergeObjects(processed);
    const { meta, resolvedProperties } = getResolvedProperties({
        framework,
        names,
        properties,
        codeLookup,
        interfaceLookup,
        config,
        allModules,
    });

    return {
        title,
        properties: resolvedProperties,
        meta,
    };
}

export function getApiDocumentationModel({
    framework,
    sources,
    section,
    names = [],
    config = {} as Config,
    propertiesFromFiles,
    propertyConfigs,
    interfaceLookup,
    codeConfigs,
    allModules,
}: Params): ApiDocumentationModel | undefined {
    if (!sources || sources.length < 1) {
        return undefined;
    }

    if (names && names.length) {
        config = { hideMore: true, overrideBottomMargin: '1rem', ...config };
    }

    const codeLookup = getCodeLookup({ propertyConfigs, codeConfigs });
    const codeSources: string[] = propertyConfigs.map((c) => c.codeSrc).filter(Boolean);

    if (section) {
        const { title, properties, meta } = getSectionProperties({
            framework,
            names,
            section,
            propertiesFromFiles,
            codeLookup,
            interfaceLookup,
            config,
            allModules,
        });

        return {
            type: 'single',
            title,
            properties,
            config: { ...config, isSubset: true },
            meta,
            codeSources,
        };
    }

    const entries = getAllSectionPropertyEntries({ propertiesFromFiles, suppressSort: config.suppressSort }).map(
        ([name, properties]) => {
            const { meta, resolvedProperties } = getResolvedProperties({
                framework,
                names,
                properties,
                codeLookup,
                interfaceLookup,
                config,
                allModules,
            });

            return [name, { meta: meta as MetaTag, properties: resolvedProperties as ChildDocEntry }] as [
                string,
                { properties: ChildDocEntry; meta: MetaTag },
            ];
        }
    );

    return {
        type: 'multiple',
        entries,
        config,
        codeSources,
    };
}
