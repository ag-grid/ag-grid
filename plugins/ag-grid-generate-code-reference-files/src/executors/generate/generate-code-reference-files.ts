import * as fs from 'fs';
import path from 'path';
import ts from 'typescript';

import { _GET_ALL_EVENTS } from './_copiedFromCore/eventTypes';
import { getFormatterForTS } from './formatAST';

const { formatNode, findNode, getFullJsDoc, getJsDoc } = getFormatterForTS(ts);

function _getCallbackForEvent(eventName: string): string {
    if (!eventName || eventName.length < 2) {
        return eventName;
    }
    return 'on' + eventName[0].toUpperCase() + eventName.substring(1);
}
const EVENT_LOOKUP = new Set(_GET_ALL_EVENTS().map((event) => _getCallbackForEvent(event)));

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

function silentFindNode(text: string, srcFile: ts.SourceFile, auxSrcFiles: AuxSrcFiles): ts.Node | undefined {
    let typeRef: ts.Node | undefined = undefined;
    try {
        typeRef = findInAllTrees(text, srcFile, auxSrcFiles);
    } catch {
        try {
            typeRef = findInAllTrees(text, srcFile, auxSrcFiles, 'TypeAliasDeclaration');
        } catch {
            // Do nothing
        }
    }
    return typeRef;
}

/** Index of declaration names to nodes, keyed by `${kindToMatch}::${name}` */
type DeclarationIndex = Map<string, ts.Node>;

function buildDeclarationIndex(srcFiles: ts.SourceFile[]): DeclarationIndex {
    const index: DeclarationIndex = new Map();
    const indexKinds = new Set(['InterfaceDeclaration', 'TypeAliasDeclaration', 'EnumDeclaration', 'ClassDeclaration']);

    for (const srcFile of srcFiles) {
        const visit = (node: ts.Node) => {
            const kind = ts.SyntaxKind[node.kind];
            if (indexKinds.has(kind)) {
                const name = (node as any).name?.escapedText;
                if (name) {
                    const key = `${kind}::${name}`;
                    if (!index.has(key)) {
                        index.set(key, node);
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(srcFile);
    }
    return index;
}

function extractNestedTypes<T extends ts.Node>(
    node: T,
    srcFile: ts.SourceFile,
    includeQuestionMark: boolean,
    results: Record<string, any>,
    visited: Set<ts.Node>,
    auxSrcFiles: ts.SourceFile[]
): void {
    if (visited.has(node)) {
        return;
    }

    if (ts.isTypeReferenceNode(node)) {
        const typeRef = silentFindNode(node.typeName.getText(), srcFile, auxSrcFiles);
        if (typeRef === undefined) {
            // console.error('failed to find', node.typeName.getText());
            return;
        }
        visited.add(node);
        extractNestedTypes(typeRef, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        return;
    }

    if (ts.isTypeAliasDeclaration(node)) {
        visited.add(node);
        extractNestedTypes(node.type, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        return;
    }

    if (ts.isInterfaceDeclaration(node)) {
        visited.add(node);
        node.heritageClauses?.map((n) =>
            extractNestedTypes(n, srcFile, includeQuestionMark, results, visited, auxSrcFiles)
        );
        node.members.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited, auxSrcFiles));
        return;
    }

    if (ts.isHeritageClause(node)) {
        node.types.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited, auxSrcFiles));
        return;
    }

    if (ts.isUnionTypeNode(node)) {
        node.types.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited, auxSrcFiles));
        return;
    }

    if (ts.isArrayTypeNode(node)) {
        extractNestedTypes(node.elementType, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        return;
    }

    if (ts.isParenthesizedTypeNode(node)) {
        extractNestedTypes(node.type, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        return;
    }

    if (ts.isExpressionWithTypeArguments(node)) {
        extractNestedTypes(node.expression, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        return;
    }

    if (ts.isPropertySignature(node)) {
        results[node.name.getText()] = getJsDoc(node);
        if (node.type) {
            extractNestedTypes(node.type, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        }
        return;
    }

    if (ts.isIdentifier(node)) {
        const ref = silentFindNode(node.getText(), srcFile, auxSrcFiles);
        if (ref) {
            extractNestedTypes(ref, srcFile, includeQuestionMark, results, visited, auxSrcFiles);
        }
        return;
    }

    if (ts.isTypeLiteralNode(node)) {
        node.members.map((n) => extractNestedTypes(n, srcFile, includeQuestionMark, results, visited, auxSrcFiles));
        return;
    }
}

/**
 * Merges `newEntries` into `existing`, preserving the `meta` (JSDoc) from the existing entry
 * when the incoming entry has none. This handles TypeScript function overloads where JSDoc
 * is on the first overload signature but subsequent signatures have no JSDoc.
 */
function mergeMembersPreservingMeta(
    existing: Record<string, any>,
    newEntries: Record<string, any>
): Record<string, any> {
    const result = { ...existing };
    for (const [key, value] of Object.entries(newEntries)) {
        if (result[key] !== undefined && value?.meta == null && result[key]?.meta != null) {
            // Overload without JSDoc: keep existing meta from the first overload
            result[key] = { ...value, meta: result[key].meta };
        } else {
            result[key] = value;
        }
    }
    return result;
}

function extractTypesFromNode(
    node,
    srcFile: ts.SourceFile,
    includeQuestionMark: boolean,
    extractNested = false,
    auxSrcFiles: AuxSrcFiles = []
) {
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
                extractNestedTypes(node.type, srcFile, includeQuestionMark, nested, new Set(), auxSrcFiles);
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

const parseFileCache = new Map<string, ts.SourceFile>();

function parseFile(sourceFile: string): ts.SourceFile {
    const cached = parseFileCache.get(sourceFile);
    if (cached) {
        return cached;
    }
    const src = fs.readFileSync(sourceFile, 'utf8');
    const result = ts.createSourceFile(sourceFile, src, ts.ScriptTarget.Latest, true);
    parseFileCache.set(sourceFile, result);
    return result;
}

export function getInterfaces(globs: string[]) {
    let interfaces = {};
    const extensions = {};
    globs.forEach((file) => {
        const parsedFile = parseFile(file);

        // check for clashing interfaces
        const allInterfaces = extractInterfaces(parsedFile, extensions);

        Object.entries(allInterfaces).forEach(([k, v]) => {
            if (interfaces[k]) {
                // deep equality check
                if (JSON.stringify(interfaces[k]) !== JSON.stringify(v)) {
                    throw new Error(
                        `Interface ${k} already exists in interfaces.AUTO.json and is different! ${JSON.stringify(interfaces[k])} vs ${JSON.stringify(v)}`
                    );
                } else {
                    // console.warn(`Interface ${k} looks to be duplicated interfaces.AUTO.json.`);
                }
            }
        });

        interfaces = { ...interfaces, ...allInterfaces };
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

function isBuiltinUtilityType(type: string): type is 'Required' | 'Omit' | 'Pick' | 'Readonly' | 'Optional' {
    return type === 'Required' || type === 'Omit' || type === 'Pick' || type === 'Readonly' || type === 'Optional';
}

function mergeAncestorProps(isDocStyle: boolean, parent, child, getProps) {
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

function mergeRespectingChildOverrides(parent, child, pickFields = []) {
    // only pick the fields that are in the pickFields array
    let filteredParent = {};
    if (pickFields.length > 0) {
        pickFields.forEach((f) => {
            if (parent[f]) {
                filteredParent[f] = parent[f];
            }
        });
    } else {
        filteredParent = { ...parent };
    }

    const merged = { ...child };
    // We want the child properties to be list first for better doc reading experience
    // Normal spread merge to get the correct order wipes out child overrides
    // Hence the manual approach to the merge here.
    Object.entries(filteredParent).forEach(([k, v]) => {
        const optionalKey = k.endsWith('?') ? k.slice(0, -1) : `${k}?`;
        if (!merged[k] && !merged[optionalKey]) {
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

            const omitFields = [];
            const pickFields = [];
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
            } else if (extended === 'Pick') {
                extended = a.params[0].replace(/<.*>/, '');
                a.params.slice(1).forEach((toPick) => {
                    toPick.split('|').forEach((property) => {
                        const typeName = property.replace(/'/g, '').trim();
                        pickFields.push(typeName);
                        pickFields.push(typeName + '?'); // Enable support for optional fields as their keys are suffixed with '?'
                    });
                });
            } else if (isBuiltinUtilityType(extended)) {
                // Required: https://www.typescriptlang.org/docs/handbook/utility-types.html
                extended = a.params[0];
            }
            const extInt = interfaces[extended];

            if (!extInt) {
                //Check for type params

                // spl here - todo
                console.error(`${i} extends ${extended} but  ${extended} is not part of interfaces.AUTO.json.`);
            }

            if (isDocStyle) {
                if (extInt) {
                    extendedInterface = mergeRespectingChildOverrides(
                        mergeAncestorProps(isDocStyle, a, extInt, (a) => a),
                        extendedInterface,
                        pickFields
                    );
                }
                omitFields.forEach((f) => {
                    delete extendedInterface[f];
                });
            } else {
                if (extInt && extInt.type) {
                    extendedInterface.type = mergeRespectingChildOverrides(
                        mergeAncestorProps(isDocStyle, a, extInt, (a) => a.type),
                        extendedInterface.type,
                        pickFields
                    );
                }
                if (extInt && extInt.docs) {
                    extendedInterface.docs = mergeRespectingChildOverrides(
                        mergeAncestorProps(isDocStyle, a, extInt, (a) => a.docs),
                        extendedInterface.docs,
                        pickFields
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
export function buildInterfaceProps(globs: string[]) {
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
                props = mergeMembersPreservingMeta(props, prop);
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

function parseImportedDefinitions(
    dir: string,
    srcFile: ts.SourceFile,
    definitions = new Map<string, ts.SourceFile>()
): AuxSrcFiles {
    srcFile.forEachChild((child) => {
        if (ts.isImportDeclaration(child)) {
            const modulePath = child.moduleSpecifier.getFullText().trim().replaceAll("'", '');
            // only look at local imports for now
            if (modulePath.startsWith('.') && !modulePath.endsWith('.css')) {
                const absPath = require.resolve(path.resolve(dir, `${modulePath}.ts`));
                if (definitions.has(absPath)) {
                    return;
                }
                const parsed = parseFile(absPath);
                definitions.set(absPath, parsed);
                parseImportedDefinitions(path.dirname(absPath), parsed, definitions);
                return;
            }
        }
    });

    const files = Array.from(definitions.values());
    return files as AuxSrcFiles;
}

type AuxSrcFiles = ts.SourceFile[] & { _declarationIndex?: DeclarationIndex };

function getOrBuildIndex(auxSrcFiles: AuxSrcFiles): DeclarationIndex {
    if (!auxSrcFiles._declarationIndex) {
        auxSrcFiles._declarationIndex = buildDeclarationIndex(auxSrcFiles);
    }
    return auxSrcFiles._declarationIndex;
}

function findInAllTrees(
    typeName: string,
    sourceFile: ts.SourceFile,
    auxSrcFiles: AuxSrcFiles,
    type = 'InterfaceDeclaration'
): ts.TypeNode | undefined {
    // Try primary file first
    try {
        return findNode(typeName, sourceFile, type);
    } catch {
        // not found in primary
    }

    // Use declaration index for O(1) lookup instead of linear scan through all files
    if (auxSrcFiles.length > 0) {
        const index = getOrBuildIndex(auxSrcFiles);
        const node = index.get(`${type}::${typeName}`);
        if (node) {
            return node as ts.TypeNode;
        }
    }

    throw `Unable to locate ${type} ${typeName} in AST parsed.`;
}

export function getGridOptions(gridOpsFile: string) {
    const srcFile = parseFile(gridOpsFile);
    const otherTrees = parseImportedDefinitions(path.dirname(gridOpsFile), srcFile);
    const gridOptionsNode = findNode('GridOptions', srcFile);

    let gridOpsMembers = {};
    ts.forEachChild(gridOptionsNode, (n) => {
        gridOpsMembers = mergeMembersPreservingMeta(
            gridOpsMembers,
            extractTypesFromNode(n, srcFile, false, true, otherTrees)
        );
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
            members = mergeMembersPreservingMeta(members, extractTypesFromNode(n, src, false));
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

        members = mergeMembersPreservingMeta(members, typesFromNode);
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
            rowNodeMembers = mergeMembersPreservingMeta(rowNodeMembers, extractTypesFromNode(n, srcFile, false));
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
            members = mergeMembersPreservingMeta(members, extractTypesFromNode(n, srcFile, false));
        });
    };

    interfaces.forEach((interfaceName) => {
        const node = findNode(interfaceName, srcFile);
        addToMembers(node);
    });

    return members;
}

export function getThemeParams(themesFile: string, stackThemesFile: string) {
    const srcFile = parseFile(themesFile);
    const auxSrcFiles = parseImportedDefinitions(path.dirname(themesFile), srcFile);
    const stackSrcFile = parseFile(stackThemesFile);
    const stackAuxSrcFiles = parseImportedDefinitions(path.dirname(stackThemesFile), stackSrcFile);

    let members = {};

    const resolveAndCollect = (name: string) => {
        let node = silentFindNode(name, srcFile, auxSrcFiles);
        if (!node) {
            node = silentFindNode(name, stackSrcFile, stackAuxSrcFiles);
        }
        if (node) {
            collectMembers(node);
        }
    };

    // Collect all properties from the type - we're running on the TS AST so we
    // don't have the fully resolved type object available, we have to traverse
    // the source to get properties, taking into account inheritance, aliases
    // and intersections
    const collectMembers = (node: ts.Node) => {
        const nodeFile = node.getSourceFile();
        if (ts.isTypeAliasDeclaration(node)) {
            if (ts.isIntersectionTypeNode(node.type)) {
                for (const t of node.type.types) {
                    if (ts.isTypeReferenceNode(t)) {
                        resolveAndCollect(t.typeName.getText(nodeFile));
                    }
                }
            } else if (ts.isTypeReferenceNode(node.type)) {
                resolveAndCollect(node.type.typeName.getText(nodeFile));
            } else if (ts.isTypeLiteralNode(node.type)) {
                node.type.members.forEach(
                    (m) => (members = mergeMembersPreservingMeta(members, extractTypesFromNode(m, nodeFile, false)))
                );
            }
        } else if (ts.isInterfaceDeclaration(node)) {
            // Process parents first (e.g. CoreParams extends SharedThemeParams)
            node.heritageClauses?.forEach((clause) => {
                clause.types.forEach((t) => resolveAndCollect(formatNode(t.expression, nodeFile)));
            });
            ts.forEachChild(node, (n) => {
                members = mergeMembersPreservingMeta(members, extractTypesFromNode(n, nodeFile, false));
            });
        }
    };

    resolveAndCollect('AllThemeParamsForAPIDocumentation');
    resolveAndCollect('SharedThemeParams');
    return members;
}
