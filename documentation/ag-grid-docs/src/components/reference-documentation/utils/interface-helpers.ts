import { SHOW_DEBUG_LOGS } from '@constants';

import type { DocEntryMap, InterfaceEntry, InterfaceHierarchyOverrides, PropertyType } from '../types';
import { extractInterfaces } from './documentation-helpers';

export const getInterfacesToWrite = ({
    name,
    definition,
    interfaceLookup,
    gridOpProp,
    interfaceHierarchyOverrides,
}: {
    name: string;
    definition: any;
    interfaceLookup: Record<string, InterfaceEntry>;
    gridOpProp?: InterfaceEntry;
    interfaceHierarchyOverrides?: InterfaceHierarchyOverrides;
}) => {
    let interfacesToWrite = [];
    if (typeof definition === 'string') {
        // Extract all the words to enable support for Union types
        interfacesToWrite = extractInterfaces(
            definition,
            interfaceLookup,
            applyInterfaceInclusions({ gridOpProp, interfaceHierarchyOverrides })
        );
    } else if (
        (typeof definition == 'object' && !Array.isArray(definition)) ||
        (typeof name == 'string' && Array.isArray(definition))
    ) {
        interfacesToWrite.push({
            name,
            interfaceType: { type: definition, meta: {} },
        });
    }

    return interfacesToWrite;
};

export function applyInterfaceInclusions({
    gridOpProp,
    interfaceHierarchyOverrides,
}: {
    gridOpProp: InterfaceEntry;
    interfaceHierarchyOverrides: InterfaceHierarchyOverrides;
}) {
    return (typeName: string) => {
        if (interfaceHierarchyOverrides) {
            if (interfaceHierarchyOverrides.include && interfaceHierarchyOverrides.include.length > 0) {
                if (interfaceHierarchyOverrides.include.includes(typeName)) {
                    return true;
                }
                return false;
            }

            // If definition includes overrides apply them
            if ((interfaceHierarchyOverrides.exclude || []).includes(typeName)) {
                return false;
            }
        }
        // If its an event return true to force inclusion, otherwise undefined to use default inclusion logic.
        return isGridOptionEvent(gridOpProp) || undefined;
    };
}

export function isGridOptionEvent(gridProp: InterfaceEntry) {
    return gridProp && gridProp.meta && gridProp.meta.isEvent;
}

export const getInterfaceName = (name: string) => `${name.substring(0, 1).toUpperCase()}${name.substring(1)}`;

export const formatJson = (value: string) =>
    JSON.stringify(value, undefined, 2)
        .replace(/\[(.*?)\]/gs, (_, match) => `[${match.trim().replace(/,\s+/gs, ', ')}]`) // remove carriage returns from arrays
        .replace(/"/g, "'"); // use single quotes

export function isCallSig(gridProp: InterfaceEntry): boolean | undefined {
    return gridProp && gridProp.meta && gridProp.meta.isCallSignature;
}

/**
 * Property type is the small blue text that tells you the type of the given property
 */
export function getPropertyType({
    isEvent,
    type,
    interfaceLookup,
    gridOpProp,
}: {
    isEvent: boolean;
    type: string | PropertyType;
    interfaceLookup: Record<string, InterfaceEntry>;
    gridOpProp: InterfaceEntry;
}) {
    let propertyType = '';
    if (type) {
        if (typeof type == 'string') {
            propertyType = type;
        } else if (typeof type == 'object') {
            if (type.arguments || type.parameters) {
                if (isGridOptionEvent(gridOpProp) || isEvent) {
                    // If an event show the event type instead of Function
                    propertyType = Object.values(type.arguments)[0];
                } else {
                    propertyType = `Function`;
                }
            } else if (type.returnType) {
                if (typeof type.returnType == 'object') {
                    propertyType = 'object';
                } else if (typeof type.returnType == 'string') {
                    const inter = interfaceLookup[type.returnType];
                    if (inter && inter.meta && inter.meta.isCallSignature) {
                        propertyType = `Function`;
                    } else {
                        propertyType = type.returnType;
                    }
                }
            } else {
                propertyType = 'void';
            }
        }
    }
    // We hide generics from this part of the display for simplicity
    // Could be done with a Regex...
    propertyType = propertyType?.replace(
        /<(TData|TValue|TContext|any)?(, )?(TData|TValue|TContext|any)?(, )?(TData|TValue|TContext|any)?>/g,
        ''
    );

    return propertyType;
}

export const mergeObjects = (objects: any[]) => {
    return objects.reduce((result, value) => Object.assign(result, value), {});
};

function getPropertyEntries({ properties, suppressSort }: { properties: DocEntryMap; suppressSort?: boolean }) {
    const entries = Object.entries(properties).filter(([key]) => key !== '_config_');
    if (!suppressSort) {
        entries.sort(([k1, v1], [k2, v2]) => {
            const getName = (k, v) => (v.meta && v.meta.displayName) || k;
            return getName(k1, v1) < getName(k2, v2) ? -1 : 1;
        });
    }

    return entries;
}

export const getAllSectionPropertyEntries = ({
    propertiesFromFiles,
    suppressSort,
}: {
    propertiesFromFiles: any[];
    suppressSort?: boolean;
}) => {
    const properties: DocEntryMap = mergeObjects(propertiesFromFiles);
    const entries = getPropertyEntries({
        properties,
        suppressSort,
    });

    return entries;
};

export const getSectionProperties = ({
    section,
    propertiesFromFiles,
}: {
    section: string;
    propertiesFromFiles: unknown;
}) => {
    const keys = section.split('.');
    const title = keys[keys.length - 1];
    const processed = keys.reduce(
        (current, key) =>
            current.map((x) => {
                const prop = x[key];
                if (!prop) {
                    // eslint-disable-next-line no-console
                    console.warn(`<api-documentation>: Could not find a prop ${key} under section ${section}!`);
                    throw new Error(`<api-documentation>: Could not find a prop ${key} under section ${section}!`); //spl todo
                }
                return prop;
            }),
        propertiesFromFiles
    );

    return {
        title,
        properties: mergeObjects(processed),
    };
};

export const getAllSectionHeadingLinks = ({
    propertiesFromFiles,
    suppressSort,
}: {
    propertiesFromFiles: unknown;
    suppressSort: boolean;
}) => {
    return getAllSectionPropertyEntries({
        propertiesFromFiles,
        suppressSort,
    })
        .map(([key, property]) => {
            const title = (property.meta && property.meta.displayName) || key;
            const numNonMetaKeys = Object.keys(property).length - 1;

            // No entries for the property, so it can be filtered out
            if (numNonMetaKeys === 0) {
                if (SHOW_DEBUG_LOGS) {
                    // eslint-disable-next-line no-console
                    console.warn(`Reference documentation '${key}' does not have any properties`);
                }
                return undefined;
            }

            return {
                title,
                id: `reference-${key}`,
            };
        })
        .filter(Boolean);
};
