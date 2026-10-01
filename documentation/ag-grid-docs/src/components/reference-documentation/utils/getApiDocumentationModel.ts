import type { Framework } from '@ag-grid-types';
import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import type {
    ApiDocumentationModel,
    ChildDocEntry,
    Config,
    GridModule,
    InterfaceEntry,
    MetaTag,
    PropertyViewModel,
} from '../types';
import { getDefinitionType } from './getDefinitionType';
import { getDetailsCode } from './getDetailsCode';
import { type PropertyResolver, getPropertyViewModel } from './getPropertyViewModel';
import { getShowAdditionalDetails } from './getShowAdditionalDetails';
import { getAllSectionPropertyEntries, mergeObjects } from './interface-helpers';
import { getDetailsKey } from './referenceDetails';

interface Params<P> {
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
    /** Defaults to the page's view model; the markdown twin passes its own. */
    resolveProperty?: PropertyResolver<P>;
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

function getResolvedProperties<P>({
    framework,
    sectionKey,
    names,
    properties,
    codeLookup,
    interfaceLookup,
    config,
    allModules,
    resolveProperty,
}: {
    framework: Framework;
    sectionKey: string;
    names?: string[];
    properties: Record<string, any>;
    codeLookup: Record<string, any>;
    interfaceLookup: Record<string, InterfaceEntry>;
    config: Config;
    allModules: GridModule[];
    resolveProperty: PropertyResolver<P>;
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
            const gridOpProp = codeLookup[name];
            const showAdditionalDetails = getShowAdditionalDetails({ name, definition, gridOpProp, interfaceLookup });
            const { type, propertyType } = getDefinitionType({
                name,
                definition,
                gridOpProp,
                interfaceLookup,
                isEvent: meta?.isEvent,
                config,
            });
            const { interfaceHierarchyOverrides } = definition;
            const detailsCode = showAdditionalDetails
                ? getDetailsCode({
                      framework,
                      name,
                      type,
                      gridOpProp,
                      interfaceLookup,
                      interfaceHierarchyOverrides,
                      isApi: config.isApi,
                  })
                : undefined;

            return [
                name,
                resolveProperty({
                    name,
                    framework,
                    definition,
                    gridOpProp,
                    type,
                    propertyType,
                    config,
                    allModules,
                    // A detailsUrl means the page fetches these on expand; without one they travel with it.
                    detailsKey:
                        detailsCode && config.detailsUrl ? getDetailsKey({ section: sectionKey, name }) : undefined,
                    detailsCode: config.detailsUrl ? undefined : detailsCode,
                }),
            ];
        });
    const resolvedProperties: Record<string, P> = Object.fromEntries(resolvedPropertyEntries);

    return { meta, resolvedProperties };
}

function getSectionProperties<P>({
    framework,
    section,
    names,
    propertiesFromFiles,
    codeLookup,
    interfaceLookup,
    config,
    allModules,
    resolveProperty,
}: {
    framework: Framework;
    section: string;
    names?: string[];
    propertiesFromFiles: unknown;
    codeLookup: Record<string, any>;
    interfaceLookup: Record<string, InterfaceEntry>;
    gridOpProp?: InterfaceEntry;
    config: Config;
    allModules: GridModule[];
    resolveProperty: PropertyResolver<P>;
}) {
    const keys = section.split('.');
    const title = keys[keys.length - 1];
    const processed = keys.reduce<any>((current, key) => {
        return current.map((x) => {
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
        sectionKey: title,
        names,
        properties,
        codeLookup,
        interfaceLookup,
        config,
        allModules,
        resolveProperty,
    });

    return {
        title,
        properties: resolvedProperties,
        meta,
    };
}

export function getApiDocumentationModel<P = PropertyViewModel>({
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
    resolveProperty = getPropertyViewModel as PropertyResolver<P>,
}: Params<P>): ApiDocumentationModel<P> | undefined {
    if (!sources || sources.length < 1) {
        return undefined;
    }

    if (names && names.length) {
        // Hide more links when properties included by name or use the value from config if its set
        config = { hideMore: true, overrideBottomMargin: '1rem', ...config };
    }

    const codeLookup = getCodeLookup({ propertyConfigs, codeConfigs });

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
            resolveProperty,
        });

        return {
            type: 'single',
            title,
            properties,
            config: { ...config, isSubset: true },
            meta,
        };
    }

    const entries = getAllSectionPropertyEntries({ propertiesFromFiles, suppressSort: config.suppressSort }).map(
        ([name, properties]) => {
            const { meta, resolvedProperties } = getResolvedProperties({
                framework,
                sectionKey: name,
                names,
                properties,
                codeLookup,
                interfaceLookup,
                config,
                allModules,
                resolveProperty,
            });

            return [name, { meta: meta as MetaTag, properties: resolvedProperties }];
        }
    );

    return {
        type: 'multiple',
        entries,
        config,
    };
}
