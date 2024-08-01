import type { Framework } from '@ag-grid-types';

import type { ICallSignature, InterfaceEntry, InterfaceHierarchyOverrides, PropertyType } from '../types';
import { escapeGenericCode, extractInterfaces, getLinkedType, writeAllInterfaces } from './documentation-helpers';
import {
    applyInterfaceInclusions,
    getInterfaceName,
    getInterfacesToWrite,
    isGridOptionEvent,
} from './interface-helpers';

export function getDetailsCode({
    framework,
    name,
    type,
    gridOpProp,
    interfaceLookup,
    interfaceHierarchyOverrides,
    isApi,
}: {
    framework: Framework;
    name: string;
    type: string | PropertyType;
    gridOpProp: InterfaceEntry;
    interfaceLookup: Record<string, InterfaceEntry>;
    interfaceHierarchyOverrides: InterfaceHierarchyOverrides;
    isApi?: boolean;
}) {
    if (typeof type == 'string') {
        // eslint-disable-next-line no-console
        console.log('<api-documentation>: type is a string!', type);
    }

    type = type || {};
    let returnType = typeof type == 'string' ? undefined : type.returnType;
    const returnTypeIsObject = !!returnType && typeof returnType === 'object';
    const extracted = extractInterfaces(
        returnType,
        interfaceLookup,
        applyInterfaceInclusions({ gridOpProp, interfaceHierarchyOverrides })
    );
    const returnTypeInterface = interfaceLookup[returnType];
    const isCallSig = returnTypeInterface && returnTypeInterface.meta.isCallSignature;
    const returnTypeHasInterface = extracted.length > 0;

    let functionName = name.replace(/\([^)]*\)/g, '');
    if (isGridOptionEvent(gridOpProp)) {
        functionName = 'on' + getInterfaceName(functionName);
    }

    let args = {};
    if (typeof type !== 'string') {
        if (type.parameters) {
            args = {
                params: {
                    meta: { name: `${getInterfaceName(functionName)}Params` },
                    ...type.parameters,
                },
            };
        } else if (type.arguments) {
            args = type.arguments;
        } else if (isCallSig) {
            // Required to handle call signature interfaces so we can flatten out the interface to make it clearer
            const callSigInterface = returnTypeInterface as ICallSignature;
            args = callSigInterface.type.arguments;
            returnType = callSigInterface.type.returnType;
        }
    }

    let shouldUseNewline = false;
    const argumentDefinitions: string[] = [];

    const getArgumentTypeName = (key, type) => {
        if (!Array.isArray(type) && typeof type === 'object') {
            return (type.meta && type.meta.name) || getInterfaceName(key);
        }

        return type;
    };

    Object.entries(args).forEach(([key, type]) => {
        const typeName = getArgumentTypeName(key, type);

        argumentDefinitions.push(`${key}: ${getLinkedType(typeName, framework)}`);

        if (argumentDefinitions.length > 1 || (key + typeName).length > 20) {
            shouldUseNewline = true;
        }
    });

    const functionArguments = shouldUseNewline
        ? `\n    ${argumentDefinitions.join(',\n    ')}\n`
        : argumentDefinitions.join('');

    const returnTypeName = getInterfaceName(functionName).replace(/^get/, '');
    const functionPrefix =
        name.includes('(') || isApi
            ? `function ${functionName}(${functionArguments}):`
            : `${functionName} = (${functionArguments}) =>`;

    const lines: string[] = [];
    if (typeof type != 'string' && (type.parameters || type.arguments || isCallSig)) {
        lines.push(
            `${functionPrefix} ${returnTypeIsObject ? returnTypeName : getLinkedType(returnType || 'void', framework)};`
        );
    } else {
        lines.push(`${name}: ${returnType};`);
    }

    let interfacesToWrite: any[] = [];
    if (type.parameters) {
        Object.keys(args)
            .filter((key) => !Array.isArray(args[key]) && typeof args[key] === 'object')
            .forEach((key) => {
                const { meta, ...definition } = args[key];
                const name = getArgumentTypeName(key, { meta });
                interfacesToWrite = [
                    ...interfacesToWrite,
                    ...getInterfacesToWrite({
                        name,
                        definition,
                        interfaceLookup,
                        gridOpProp,
                        interfaceHierarchyOverrides,
                    }),
                ];
            });
    } else if (args) {
        Object.entries(args).forEach(([key, definition]) => {
            const name = getArgumentTypeName(key, definition);
            interfacesToWrite = [
                ...interfacesToWrite,
                ...getInterfacesToWrite({
                    name,
                    definition,
                    interfaceLookup,
                    gridOpProp,
                    interfaceHierarchyOverrides,
                }),
            ];
        });
    }

    if (returnTypeIsObject) {
        interfacesToWrite = [
            ...interfacesToWrite,
            ...getInterfacesToWrite({
                name: returnTypeName,
                definition: returnType,
                interfaceLookup,
                gridOpProp,
                interfaceHierarchyOverrides,
            }),
        ];
    } else if (returnTypeHasInterface) {
        interfacesToWrite = [
            ...interfacesToWrite,
            ...getInterfacesToWrite({
                name: returnType,
                definition: returnType,
                interfaceLookup,
                gridOpProp,
                interfaceHierarchyOverrides,
            }),
        ];
    }

    lines.push(...writeAllInterfaces(interfacesToWrite, framework));

    return escapeGenericCode(lines);
}
