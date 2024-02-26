import { extractInterfaces } from './documentation-helpers';
import type { Config, ICallSignature, InterfaceEntry, PropertyType } from './types';

export const getInterfacesToWrite = (name, definition, config) => {
    let interfacesToWrite = [];
    if (typeof definition === 'string') {
        // Extract all the words to enable support for Union types
        interfacesToWrite = extractInterfaces(definition, config.lookups.interfaces, applyInterfaceInclusions(config));
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

export function applyInterfaceInclusions({ gridOpProp, interfaceHierarchyOverrides }) {
    return (typeName) => {
        if (interfaceHierarchyOverrides) {
            // If definition includes overrides apply them
            if ((interfaceHierarchyOverrides.exclude || []).includes(typeName)) {
                return false;
            }
            if ((interfaceHierarchyOverrides.include || []).includes(typeName)) {
                return true;
            }
        }
        // If its an event return true to force inclusion, otherwise undefined to use default inclusion logic.
        return isGridOptionEvent(gridOpProp) || undefined;
    };
}

export function isGridOptionEvent(gridProp: InterfaceEntry) {
    return gridProp && gridProp.meta && gridProp.meta.isEvent;
}

export const getInterfaceName = (name) => `${name.substring(0, 1).toUpperCase()}${name.substring(1)}`;

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
export function getPropertyType(type: string | PropertyType, config: Config) {
    let propertyType = '';
    if (type) {
        if (typeof type == 'string') {
            propertyType = type;
        } else if (typeof type == 'object') {
            if (type.arguments || type.parameters) {
                if (isGridOptionEvent(config.gridOpProp) || config.isEvent) {
                    // If an event show the event type instead of Function
                    propertyType = Object.values(type.arguments)[0];
                } else {
                    propertyType = `Function`;
                }
            } else if (type.returnType) {
                if (typeof type.returnType == 'object') {
                    propertyType = 'object';
                } else if (typeof type.returnType == 'string') {
                    const inter = config.lookups.interfaces[type.returnType];
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
    propertyType = propertyType.replace(
        /<(TData|TValue|TContext|any)?(, )?(TData|TValue|TContext|any)?(, )?(TData|TValue|TContext|any)?>/g,
        ''
    );

    return propertyType;
}

export const mergeObjects = (objects) => {
    return objects.reduce((result, value) => Object.assign(result, value), {});
};
