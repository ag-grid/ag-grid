import type { Framework } from '@ag-grid-types';
import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';

import {
    escapeGenericCode,
    extractInterfaces,
    formatJsDocString,
    getInterfaceWithGenericParams,
    getLinkedType,
    inferType,
    sortAndFilterProperties,
    writeAllInterfaces,
} from './documentation-helpers';
import {
    applyInterfaceInclusions,
    getInterfaceName,
    getInterfacesToWrite,
    getPropertyType,
    isCallSig,
    isGridOptionEvent,
} from './interface-helpers';
import type {
    ChildDocEntry,
    Config,
    DocCode,
    DocEntryMap,
    DocModel,
    DocProperties,
    ICallSignature,
    InterfaceEntry,
    Overrides,
} from './types';

interface Params {
    interfaceName: string;
    framework: Framework;
    overrides: Overrides;
    names: string[];
    exclude: string[];
    config: any;
    interfaceLookup: Record<string, any>;
    codeLookup: Record<string, any>;
}

function getShowAdditionalDetails({ definition, gridOpProp, interfaceLookup }) {
    let type: any = definition.type;
    let showAdditionalDetails = typeof type == 'object';
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        if (gridOpProp && gridOpProp.type) {
            type = gridOpProp.type;

            const isDeprecated = gridOpProp.meta?.tags?.some((t) => t.name === 'deprecated');
            if (isDeprecated) {
                // eslint-disable-next-line no-console
                console.warn(
                    `<api-documentation>: Docs include a property: ${name} that has been marked as deprecated.`
                );
                // eslint-disable-next-line no-console
                console.warn('<api-documentation>: ' + gridOpProp.meta?.all);
            }

            const anyInterfaces = extractInterfaces(
                gridOpProp.type,
                interfaceLookup,
                applyInterfaceInclusions({
                    gridOpProp,
                    interfaceHierarchyOverrides: definition.interfaceHierarchyOverrides,
                })
            );
            showAdditionalDetails = isCallSig(gridOpProp) || type.arguments || anyInterfaces.length > 0;
        }
    }

    return showAdditionalDetails;
}

// Use the type definition if manually specified in config
function getDefinitionType({ definition, gridOpProp, interfaceLookup, config }) {
    let type: any = definition.type;
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        if (gridOpProp && gridOpProp.type) {
            type = gridOpProp.type;

            const isDeprecated = gridOpProp.meta?.tags?.some((t) => t.name === 'deprecated');
            if (isDeprecated) {
                // eslint-disable-next-line no-console
                console.warn(
                    `<api-documentation>: Docs include a property: ${name} that has been marked as deprecated.`
                );
                // eslint-disable-next-line no-console
                console.warn('<api-documentation>: ' + gridOpProp.meta?.all);
            }
        } else {
            if (type == null && config.codeSrcProvided?.length > 0) {
                throw new Error(
                    `We could not find a type for "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo?`
                );
            }

            // If a codeSrc is not provided as a last resort try and infer the type
            type = inferType(definition.default);
        }
    }

    const propertyType = getPropertyType({
        type,
        isEvent: config.isEvent,
        interfaceLookup,
        gridOpProp,
    });

    return {
        type,
        propertyType,
    };
}

function getDetailsCode({ framework, name, type, gridOpProp, interfaceLookup, interfaceHierarchyOverrides, isApi }) {
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
    const argumentDefinitions = [];

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

    const lines = [];
    if (typeof type != 'string' && (type.parameters || type.arguments || isCallSig)) {
        lines.push(
            `${functionPrefix} ${returnTypeIsObject ? returnTypeName : getLinkedType(returnType || 'void', framework)};`
        );
    } else {
        lines.push(`${name}: ${returnType};`);
    }

    let interfacesToWrite = [];
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

function getProperties({
    framework,
    interfaceName,
    interfaceData,
    interfaceLookup,
    overrides,
    names,
    exclude,
    codeData,
    config,
}): DocProperties {
    const props: any = {};
    let interfaceOverrides: Overrides = {};
    if (Object.keys(overrides).length) {
        interfaceOverrides = overrides[interfaceName];
        if (!interfaceOverrides) {
            throw new Error(`override provided but does not contain expected section named: '${interfaceName}'!`);
        }
    }

    let typeProps: any[] = [];
    if (typeof interfaceData.type === 'string') {
        if (interfaceOverrides) {
            typeProps = Object.entries(interfaceOverrides);
        } else {
            // eslint-disable-next-line no-console
            console.error(`Please provide an override for type alias: ${interfaceName}`);
        }
    } else {
        typeProps = Object.entries(interfaceData.type);
    }
    sortAndFilterProperties(typeProps, framework).forEach(([k, v]) => {
        // interfaces include the ? as part of the name. We want to remove this for the <interface-documentation> component
        // Instead the type will be unioned with undefined as part of the propertyType
        let propNameOnly = k.replace('?', '');
        // for function properties like failCallback(): void; We only want the name failCallback part
        // as this is what is listed in the doc-interfaces.AUTO.json file
        propNameOnly = propNameOnly.split('(')[0];
        if (
            (names.length === 0 || names.includes(propNameOnly)) &&
            (exclude.length == 0 || !exclude.includes(propNameOnly))
        ) {
            const docs = (interfaceData.docs && formatJsDocString(interfaceData.docs[k])) || '';
            if (!docs.includes('@deprecated')) {
                props[propNameOnly] = { description: docs || v, ...interfaceOverrides[propNameOnly] };
            }
        }
    });

    const orderedProps = {};
    const ordered = Object.entries(props).sort(([, v1], [, v2]) => {
        // Put required props at the top as likely to be the most important
        if ((v1 as ChildDocEntry).isRequired == (v2 as ChildDocEntry).isRequired) {
            return 0;
        }
        return (v1 as ChildDocEntry).isRequired ? -1 : 1;
    });

    ordered.forEach(([name, definition]) => {
        const gridOpProp = codeData[name];
        const showAdditionalDetails = getShowAdditionalDetails({ definition, gridOpProp, interfaceLookup });
        const { type, propertyType } = getDefinitionType({
            definition,
            gridOpProp,
            interfaceLookup,
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

        orderedProps[name] = {
            definition,
            detailsCode,
            gridOpProp,
            interfaceHierarchyOverrides,
            propertyType,
        };
    });

    const properties: DocEntryMap = {
        [interfaceName]: {
            ...orderedProps,
        },
    };
    const interfaceDeclaration = getInterfaceWithGenericParams(interfaceName, interfaceData.meta);
    const description =
        config.description == null
            ? `Properties available on the \`${interfaceDeclaration}\` interface.`
            : config.description;
    const meta = {
        displayName: interfaceName,
        description,
        ...interfaceOverrides.meta,
    };

    return { type: 'properties', properties, meta };
}

function getDocCode({
    interfaceName,
    framework,
    exclude,
    interfaceLookup,
    config,
}: {
    interfaceName: string;
    framework: Framework;
    exclude: string[];
    interfaceLookup: Record<string, InterfaceEntry>;
    config: Config;
}): DocCode {
    const interfacesToWrite = getInterfacesToWrite({
        name: interfaceName,
        definition: interfaceName,
        interfaceLookup,
    });

    if (interfacesToWrite.length < 1) {
        throwDevWarning({
            message: `Could not find interface ${interfaceName} for interface-documentation component!`,
        });
    }
    const lines = [];
    lines.push(
        ...writeAllInterfaces(interfacesToWrite.slice(0, 1), framework, {
            lineBetweenProps: config.lineBetweenProps ?? true,
            hideName: config.hideName,
            exclude,
            applyOptionalOrdering: true,
        })
    );
    const code = escapeGenericCode(lines);

    return {
        type: 'code',
        code,
    };
}

export function getInterfaceDocumentationModel({
    framework,
    interfaceName,
    overrides,
    names = [],
    exclude = [],
    config = {},
    interfaceLookup,
    codeLookup,
}: Params): DocModel {
    const codeData = codeLookup[interfaceName];
    const model = config.asCode
        ? getDocCode({
              interfaceName,
              framework,
              exclude,
              interfaceLookup,
              config,
          })
        : getProperties({
              framework,
              interfaceName,
              interfaceData: interfaceLookup[interfaceName],
              interfaceLookup,
              overrides,
              names,
              exclude,
              codeData,
              config,
          });

    return model;
}
