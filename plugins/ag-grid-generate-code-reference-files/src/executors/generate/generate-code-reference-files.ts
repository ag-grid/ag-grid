import * as fs from 'fs';
import ts from 'typescript';

import { _ALL_EVENTS } from './_copiedFromCore/eventTypes';
import { getFormatterForTS } from './formatAST';

const { formatNode, findNode, getFullJsDoc, getJsDoc } = getFormatterForTS(ts);

function _getCallbackForEvent(eventName: string): string {
    if (!eventName || eventName.length < 2) {
        return eventName;
    }
    return 'on' + eventName[0].toUpperCase() + eventName.substring(1);
}
const EVENT_LOOKUP = new Set(_ALL_EVENTS.map((event) => _getCallbackForEvent(event)));

function findAllInNodesTree(node) {
    const kind = ts.SyntaxKind[node.kind];
    let interfaces = [];

    const interfaceNode = kind == 'InterfaceDeclaration' || kind == 'EnumDeclaration' || kind == 'TypeAliasDeclaration';
    const classNode = kind == 'ClassDeclaration' && getFullJsDoc(node)?.indexOf('@docsInterface') >= 0;
    if (interfaceNode || classNode) {
        interfaces.push(node);
    }
    ts.forEachChild(node, (n) => {
        const nodeInterfaces = findAllInNodesTree(n);
        if (nodeInterfaces.length > 0) {
            interfaces = [...interfaces, ...nodeInterfaces];
        }
    });

    return interfaces;
}

function getArgTypes(parameters, file) {
    const args = {};
    (parameters || []).forEach((p) => {
        const initValue = formatNode(p.initializer, file);
        const argName = `${p.name.escapedText}${p.questionToken ? '?' : ''}`;
        args[argName] = `${formatNode(p.type, file)}${initValue ? ` = ${initValue}` : ''}`;
    });
    return args;
}

function toCamelCase(value) {
    return value[0].toLowerCase() + value.substring(1);
}

function silentFindNode(text: string, srcFile: ts.SourceFile): ts.Node | undefined {
    let typeRef: ts.Node | undefined = undefined;
    try {
        typeRef = findNode(text, srcFile);
    } catch {
        try {
            typeRef = findNode(text, srcFile, 'TypeAliasDeclaration');
        } catch {
            // Do nothing
        }
    }
    return typeRef;
}

function extractNestedTypes<T extends ts.Node>(
    node: T,
    srcFile: ts.SourceFile,
    includeQuestionMark: boolean,
    results: Record<string, any>,
    visited: Set<ts.Node>
): void {
    if (visited.has(node)) {
        return;
    }

    if (ts.isTypeReferenceNode(node)) {
        const typeRef = silentFindNode(node.typeName.getText(), srcFile);
        if (typeRef === undefined) {
            return;
        }
        visited.add(node);
        extractNestedTypes(typeRef, srcFile, includeQuestionMark, results, visited);
        return;
    }

    if (ts.isTypeAliasDeclaration(node)) {
        visited.add(node);
        extractNestedTypes(node.type, srcFile, includeQuestionMark, results, visited);
        return;
    }

    if (ts.isInterfaceDeclaration(node)) {
        visited.add(node);
        node.heritageClauses?.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited));
        node.members.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited));
        return;
    }

    if (ts.isHeritageClause(node)) {
        node.types.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited));
        return;
    }

    if (ts.isUnionTypeNode(node)) {
        node.types.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited));
        return;
    }

    if (ts.isExpressionWithTypeArguments(node)) {
        extractNestedTypes(node.expression, srcFile, includeQuestionMark, results, visited);
        return;
    }

    if (ts.isPropertySignature(node)) {
        results[node.name.getText()] = getJsDoc(node);
        node.type && extractNestedTypes(node.type, srcFile, includeQuestionMark, results, visited);
        return;
    }

    if (ts.isIdentifier(node)) {
        const ref = findNode(node.escapedText, srcFile);
        extractNestedTypes(ref, srcFile, includeQuestionMark, results, visited);
        return;
    }

    if (ts.isTypeLiteralNode(node)) {
        node.members.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited));
        return;
    }
}

function extractTypesFromNode(node, srcFile, includeQuestionMark, extractNested = false) {
    const nodeMembers = {};
    const kind = ts.SyntaxKind[node.kind];

    const name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();
    const optional = includeQuestionMark ? node && !!node.questionToken : undefined;

    if (kind == 'PropertySignature') {
        if (node.type && node.type.parameters) {
            // sendToClipboard?: (params: SendToClipboardParams) => void;
            const methodArgs = getArgTypes(node.type.parameters, srcFile);
            returnType = formatNode(node.type.type, srcFile);
            nodeMembers[name] = {
                meta: getJsDoc(node),
                type: { arguments: methodArgs, returnType, optional },
            };
        } else {
            // i.e colWidth?: number;
            const type: { returnType: string; optional: boolean; nested?: Record<string, any> } = {
                returnType,
                optional,
            };
            if (extractNested) {
                const nested = {};
                extractNestedTypes(node.type, srcFile, includeQuestionMark, nested, new Set());
                type.nested = nested;
            }
            nodeMembers[name] = { meta: getJsDoc(node), type };
        }
    } else if (kind == 'MethodSignature' || kind == 'MethodDeclaration') {
        // i.e isExternalFilterPresent?(): boolean;
        // i.e doesExternalFilterPass?(node: IRowNode): boolean;
        const methodArgs = getArgTypes(node.parameters, srcFile);

        nodeMembers[name] = {
            meta: getJsDoc(node),
            type: { arguments: methodArgs, returnType, optional },
        };

        if (EVENT_LOOKUP.has(name)) {
            // Duplicate events without their prefix
            let shortName = name.substring(2);
            shortName = toCamelCase(shortName);

            nodeMembers[shortName] = { ...nodeMembers[name], meta: { ...nodeMembers[name].meta, isEvent: true, name } };
            nodeMembers[name] = { ...nodeMembers[name], meta: { ...nodeMembers[name].meta, isEvent: true, name } };
        }
    }
    return nodeMembers;
}

function parseFile(sourceFile) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

export function getInterfaces(globs) {
    let interfaces = {};
    const extensions = {};
    globs.forEach((file) => {
        const parsedFile = parseFile(file);
        interfaces = { ...interfaces, ...extractInterfaces(parsedFile, extensions) };
    });

    // Now that we have recorded all the interfaces we can apply the extension properties.
    // For example CellPosition extends RowPosition and we want the json to add the RowPosition properties to the CellPosition
    applyInheritance(extensions, interfaces, false);
    return interfaces;
}

function getAncestors(extensions, child) {
    let ancestors = [];
    const extended = typeof child === 'string' ? child : child.extends;
    const parents = extensions[extended];
    if (parents) {
        ancestors = [...ancestors, ...parents];
        parents.forEach((p) => {
            if (p.extends === 'Omit') {
                // Omit: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
                // Special logic to handle the removing of properties via the Omit utility when a type is defined via extension.
                // e.g. export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'> { }
                p = p.params[0];
            }

            ancestors = [...ancestors, ...getAncestors(extensions, p)];
        });
    }
    return ancestors;
}

function isBuiltinUtilityType(type) {
    return type === 'Required' || type === 'Omit' || type === 'Pick' || type === 'Readonly' || type === 'Optional';
}

function mergeAncestorProps(isDocStyle, parent, child, getProps) {
    const props = { ...getProps(child) };
    const mergedProps = props;
    // If the parent has a generic params lets apply the child's specific types
    if (parent.params && parent.params.length > 0) {
        let globalEventType = undefined;
        if (parent.extends === 'AgGlobalEvent') {
            // Special handling for global event types. This should be generic but this is a lot quicker for now.
            globalEventType = parent.params[0];
        }

        if (child.meta && child.meta.typeParams) {
            child.meta.typeParams.forEach((t, i) => {
                Object.entries(props).forEach(([k, v]: [string, any]) => {
                    if (globalEventType && k === 'type' && v === 'TEventType') {
                        v = globalEventType;
                    }
                    delete mergedProps[k];
                    // Replace the generic params. Regex to make sure you are not just replacing
                    // random letters in variable names.
                    const rep = `(?<!\\w)${t}(?!\\w)`;
                    const re = new RegExp(rep, 'g');
                    const newKey = k.replace(re, parent.params[i]);
                    let newValue;
                    if (v) {
                        if (isDocStyle) {
                            if (v.type) {
                                let newArgs = undefined;
                                if (v.type.arguments) {
                                    newArgs = {};
                                    Object.entries(v.type.arguments).forEach(([ak, av]: [any, any]) => {
                                        newArgs[ak] = av.replace(re, parent.params[i]);
                                    });
                                }
                                const newReturnType = v.type.returnType.replace(re, parent.params[i]);
                                newValue = { ...v, type: { ...v.type, returnType: newReturnType, arguments: newArgs } };
                            }
                        } else {
                            newValue = v.replace(re, parent.params[i]);
                        }
                    }

                    mergedProps[newKey] = newValue;
                });
            });
        } else if (!isBuiltinUtilityType(parent.extends)) {
            throw new Error(
                `Parent interface ${parent.extends} takes generic params: [${parent.params.join()}] but child does not have typeParams.`
            );
        }
    }
    return mergedProps;
}

function mergeRespectingChildOverrides(parent, child) {
    const merged = { ...child };
    // We want the child properties to be list first for better doc reading experience
    // Normal spread merge to get the correct order wipes out child overrides
    // Hence the manual approach to the merge here.
    Object.entries(parent).forEach(([k, v]) => {
        if (!merged[k]) {
            merged[k] = v;
        }
    });
    return merged;
}

function applyInheritance(extensions, interfaces, isDocStyle) {
    Object.entries(extensions).forEach(([i]) => {
        const allAncestors = getAncestors(extensions, i);
        let extendedInterface = interfaces[i];

        // TODO: Inherited Generic types do not get passed through
        // Would need to make this tree work so that the params applied lower down  get sent up the tree and correctly applied
        // Example interface is ICellEditorComp

        allAncestors.forEach((a) => {
            let extended = a.extends;

            let extInt = undefined;
            const omitFields = [];
            if (extended === 'Omit') {
                // Omit: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
                // Special logic to handle the removing of properties via the Omit utility when a type is defined via extension.
                // e.g. export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'> { }
                extended = a.params[0].replace(/<.*>/, '');
                a.params.slice(1).forEach((toRemove) => {
                    toRemove.split('|').forEach((property) => {
                        const typeName = property.replace(/'/g, '').trim();
                        omitFields.push(typeName);
                    });
                });
            } else if (isBuiltinUtilityType(extended)) {
                // Required: https://www.typescriptlang.org/docs/handbook/utility-types.html
                extended = a.params[0];
            }
            extInt = interfaces[extended];

            if (!extInt) {
                //Check for type params

                // spl here - todo
                console.error(`${i} extends ${extended} but  ${extended} is not part of interfaces.AUTO.json.`);
            }

            if (isDocStyle) {
                if (extInt) {
                    extendedInterface = mergeRespectingChildOverrides(
                        mergeAncestorProps(isDocStyle, a, extInt, (a) => a),
                        extendedInterface
                    );
                }
                omitFields.forEach((f) => {
                    delete extendedInterface[f];
                });
            } else {
                if (extInt && extInt.type) {
                    extendedInterface.type = mergeRespectingChildOverrides(
                        mergeAncestorProps(isDocStyle, a, extInt, (a) => a.type),
                        extendedInterface.type
                    );
                }
                if (extInt && extInt.docs) {
                    extendedInterface.docs = mergeRespectingChildOverrides(
                        mergeAncestorProps(isDocStyle, a, extInt, (a) => a.docs),
                        extendedInterface.docs
                    );
                }
                omitFields.forEach((f) => {
                    delete extendedInterface.docs?.[f];
                    delete extendedInterface.meta?.[f];
                    delete extendedInterface.type?.[f];
                });
            }
        });
        interfaces[i] = extendedInterface;
    });
}

function extractInterfaces(srcFile, extension) {
    const interfaces = findAllInNodesTree(srcFile);
    const iLookup = {};
    interfaces.forEach((node) => {
        const name = node && node.name && node.name.escapedText;
        const kind = ts.SyntaxKind[node.kind];

        if (node.heritageClauses) {
            node.heritageClauses.forEach((h) => {
                if (h.types && h.types.length > 0) {
                    extension[name] = h.types.map((h) => ({
                        extends: formatNode(h.expression, srcFile),
                        params: h.typeArguments ? h.typeArguments.map((t) => formatNode(t, srcFile)) : undefined,
                    }));
                }
            });
        }

        if (kind == 'EnumDeclaration') {
            iLookup[name] = {
                meta: { isEnum: true },
                type: node.members.map((n) => formatNode(n, srcFile)),
                docs: node.members.map((n) => getFullJsDoc(n)),
            };
        } else if (kind == 'TypeAliasDeclaration') {
            iLookup[name] = {
                meta: {
                    isTypeAlias: true,
                    typeParams: node.typeParameters
                        ? node.typeParameters.map((tp) => formatNode(tp, srcFile))
                        : undefined,
                },
                type: formatNode(node.type, srcFile),
            };
        } else {
            let isCallSignature = false;
            const members = {};
            const docs = {};
            let callSignatureMembers = {};

            if (node.members && node.members.length > 0) {
                node.members.map((p) => {
                    isCallSignature = isCallSignature || ts.SyntaxKind[p.kind] == 'CallSignature';
                    if (isCallSignature) {
                        const argTypes = getArgTypes(p.parameters, srcFile);

                        callSignatureMembers = {
                            arguments: argTypes,
                            returnType: formatNode(p.type, srcFile),
                        };
                    } else {
                        const propName = formatNode(p, srcFile, true);
                        const propType = formatNode(p.type, srcFile);
                        members[propName] = propType;
                        const doc = getFullJsDoc(p);
                        if (doc) {
                            docs[propName] = getFullJsDoc(p);
                        }
                    }
                });

                if (isCallSignature && node.members.length > 1) {
                    throw new Error(
                        'Have a callSignature interface with more than one member! We were not expecting this to be possible!'
                    );
                }
            }
            if (isCallSignature) {
                iLookup[name] = {
                    meta: { isCallSignature },
                    type: callSignatureMembers,
                };
            } else {
                const meta = {};
                iLookup[name] = { meta, type: members, docs: Object.entries(docs).length > 0 ? docs : undefined };
            }

            if (node.typeParameters) {
                const orig = iLookup[name];
                iLookup[name] = {
                    ...orig,
                    meta: { ...orig.meta, typeParams: node.typeParameters.map((tp) => formatNode(tp, srcFile)) },
                };
            }

            const doc = getFullJsDoc(node);
            if (doc) {
                const orig = iLookup[name];
                iLookup[name] = { ...orig, meta: { ...orig.meta, doc } };
            }
        }
    });
    return iLookup;
}

/** Build the interface file in the format that can be used by <interface-documentation> */
export function buildInterfaceProps(globs) {
    const interfaces = {
        _config_: {},
    };
    const extensions = {};
    globs.forEach((file) => {
        const parsedFile = parseFile(file);

        // Using this method to build the extensions lookup required to get inheritance correct
        extractInterfaces(parsedFile, extensions);

        const interfacesInFile = findAllInNodesTree(parsedFile);
        interfacesInFile.forEach((iNode) => {
            let props: any = {};
            iNode.forEachChild((ch) => {
                const prop = extractTypesFromNode(ch, parsedFile, true);
                props = { ...props, ...prop };
            });

            const kind = ts.SyntaxKind[iNode.kind];
            if (kind == 'TypeAliasDeclaration') {
                // We do not support types here but have not seen this needed in the docs yet.
            }

            if (iNode.typeParameters) {
                props = {
                    ...props,
                    meta: { ...props.meta, typeParams: iNode.typeParameters.map((tp) => formatNode(tp, parsedFile)) },
                };
            }

            const iName = formatNode(iNode.name, parsedFile, true);
            interfaces[iName] = props;
        });
    });

    applyInheritance(extensions, interfaces, true);

    return interfaces;
}

export function getGridOptions(gridOpsFile: string) {
    const srcFile = parseFile(gridOpsFile);
    const gridOptionsNode = findNode('GridOptions', srcFile);

    let gridOpsMembers = {};
    ts.forEachChild(gridOptionsNode, (n) => {
        gridOpsMembers = { ...gridOpsMembers, ...extractTypesFromNode(n, srcFile, false, true) };
    });

    return gridOpsMembers;
}

export function getColumnOptions(colDefFile: string, filterFile: string) {
    const srcFile = parseFile(colDefFile);
    const abstractColDefNode = findNode('AbstractColDef', srcFile);
    const colGroupDefNode = findNode('ColGroupDef', srcFile);
    const colDefNode = findNode('ColDef', srcFile);
    const srcFilterFile = parseFile(filterFile);
    const filterNode = findNode('IFilterDef', srcFilterFile);

    let members = {};
    const addToMembers = (node, src) => {
        ts.forEachChild(node, (n) => {
            members = { ...members, ...extractTypesFromNode(n, src, false) };
        });
    };
    addToMembers(abstractColDefNode, srcFile);
    addToMembers(colGroupDefNode, srcFile);
    addToMembers(colDefNode, srcFile);
    addToMembers(filterNode, srcFilterFile);

    return members;
}

export function getGridApi(gridApiFile: string) {
    const srcFile = parseFile(gridApiFile);
    const gridApi: ts.InterfaceDeclaration = findNode('GridApi', srcFile);

    let members = {};

    const errors: string[] = [];

    const apiToTypeMap = new Map<string, string>();

    const addType = (typeName: string, n: ts.Node) => {
        const typesFromNode = extractTypesFromNode(n, srcFile, false);

        for (const apiName of Object.keys(typesFromNode)) {
            const apiTypeName = apiToTypeMap.get(apiName);
            if (apiTypeName !== undefined && apiTypeName !== typeName) {
                errors.push(`API ${apiName} already exists in both ${apiTypeName} and ${typeName}`);
            } else {
                apiToTypeMap.set(apiName, typeName);
            }
        }

        members = { ...members, ...typesFromNode };
    };

    const processedInterfaces = new Set<ts.InterfaceDeclaration>();

    const processInterface = (declaration: ts.InterfaceDeclaration) => {
        if (processedInterfaces.has(declaration)) {
            return;
        }
        processedInterfaces.add(declaration);
        declaration.heritageClauses?.forEach((h) => {
            h.types.forEach((t) => {
                const typeName = formatNode(t.expression, srcFile);
                const typeNode = findNode(typeName, srcFile);
                if (!typeNode) {
                    errors.push(`Could not find base interface for ${typeName}`);
                } else {
                    if (ts.isInterfaceDeclaration(typeNode)) {
                        processInterface(typeNode);
                    }
                    ts.forEachChild(typeNode, (n) => addType(typeName, n));
                }
            });
        });
    };

    processInterface(gridApi);

    ts.forEachChild(gridApi, (n) => addType('GridApi', n));

    if (errors.length > 0) {
        throw new Error('getGridApi validation failed:\n' + errors.join('\n'));
    }

    return members;
}
export function getRowNode(rowNodeFile: string) {
    const srcFile = parseFile(rowNodeFile);
    const iRowNode = findNode('IRowNode', srcFile);
    const baseRowNode = findNode('BaseRowNode', srcFile);
    const groupRowNode = findNode('GroupRowNode', srcFile);

    let rowNodeMembers = {};
    const addToMembers = (node) => {
        ts.forEachChild(node, (n) => {
            rowNodeMembers = { ...rowNodeMembers, ...extractTypesFromNode(n, srcFile, false) };
        });
    };
    addToMembers(baseRowNode);
    addToMembers(groupRowNode);
    addToMembers(iRowNode);

    return rowNodeMembers;
}

export function getColumnTypes(columnFile: string, interfaces: string[]) {
    const srcFile = parseFile(columnFile);
    let members = {};

    const addToMembers = (node) => {
        ts.forEachChild(node, (n) => {
            members = { ...members, ...extractTypesFromNode(n, srcFile, false) };
        });
    };

    interfaces.forEach((interfaceName) => {
        const node = findNode(interfaceName, srcFile);
        addToMembers(node);
    });

    return members;
}
