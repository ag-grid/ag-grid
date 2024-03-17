"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    buildInterfaceProps: function() {
        return buildInterfaceProps;
    },
    getColumn: function() {
        return getColumn;
    },
    getColumnOptions: function() {
        return getColumnOptions;
    },
    getGridApi: function() {
        return getGridApi;
    },
    getGridOptions: function() {
        return getGridOptions;
    },
    getInterfaces: function() {
        return getInterfaces;
    },
    getRowNode: function() {
        return getRowNode;
    }
});
const _extends = require("@swc/helpers/_/_extends");
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _fs = /*#__PURE__*/ _interop_require_wildcard._(require("fs"));
const _typescript = /*#__PURE__*/ _interop_require_default._(require("typescript"));
const _eventKeys = require("./_copiedFromCore/eventKeys");
const _formatAST = require("./formatAST");
const { formatNode, findNode, getFullJsDoc, getJsDoc } = (0, _formatAST.getFormatterForTS)(_typescript.default);
function getCallbackForEvent(eventName) {
    if (!eventName || eventName.length < 2) {
        return eventName;
    }
    return 'on' + eventName[0].toUpperCase() + eventName.substring(1);
}
const EVENTS = Object.values(_eventKeys.Events);
const EVENT_LOOKUP = new Set(EVENTS.map((event)=>getCallbackForEvent(event)));
function findAllInNodesTree(node) {
    var _getFullJsDoc;
    const kind = _typescript.default.SyntaxKind[node.kind];
    let interfaces = [];
    const interfaceNode = kind == 'InterfaceDeclaration' || kind == 'EnumDeclaration' || kind == 'TypeAliasDeclaration';
    const classNode = kind == 'ClassDeclaration' && ((_getFullJsDoc = getFullJsDoc(node)) == null ? void 0 : _getFullJsDoc.indexOf('@docsInterface')) >= 0;
    if (interfaceNode || classNode) {
        interfaces.push(node);
    }
    _typescript.default.forEachChild(node, (n)=>{
        const nodeInterfaces = findAllInNodesTree(n);
        if (nodeInterfaces.length > 0) {
            interfaces = [
                ...interfaces,
                ...nodeInterfaces
            ];
        }
    });
    return interfaces;
}
function getArgTypes(parameters, file) {
    const args = {};
    (parameters || []).forEach((p)=>{
        const initValue = formatNode(p.initializer, file);
        const argName = `${p.name.escapedText}${p.questionToken ? '?' : ''}`;
        args[argName] = `${formatNode(p.type, file)}${initValue ? ` = ${initValue}` : ''}`;
    });
    return args;
}
function toCamelCase(value) {
    return value[0].toLowerCase() + value.substring(1);
}
function extractTypesFromNode(node, srcFile, includeQuestionMark) {
    let nodeMembers = {};
    const kind = _typescript.default.SyntaxKind[node.kind];
    let name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();
    let optional = includeQuestionMark ? node && !!node.questionToken : undefined;
    if (kind == 'PropertySignature') {
        if (node.type && node.type.parameters) {
            // sendToClipboard?: (params: SendToClipboardParams) => void;
            const methodArgs = getArgTypes(node.type.parameters, srcFile);
            returnType = formatNode(node.type.type, srcFile);
            nodeMembers[name] = {
                meta: getJsDoc(node),
                type: {
                    arguments: methodArgs,
                    returnType,
                    optional
                }
            };
        } else {
            // i.e colWidth?: number;             
            nodeMembers[name] = {
                meta: getJsDoc(node),
                type: {
                    returnType,
                    optional
                }
            };
        }
    } else if (kind == 'MethodSignature' || kind == 'MethodDeclaration') {
        // i.e isExternalFilterPresent?(): boolean;
        // i.e doesExternalFilterPass?(node: IRowNode): boolean;        
        const methodArgs = getArgTypes(node.parameters, srcFile);
        nodeMembers[name] = {
            meta: getJsDoc(node),
            type: {
                arguments: methodArgs,
                returnType,
                optional
            }
        };
        if (EVENT_LOOKUP.has(name)) {
            // Duplicate events without their prefix
            let shortName = name.substring(2);
            shortName = toCamelCase(shortName);
            nodeMembers[shortName] = _extends._({}, nodeMembers[name], {
                meta: _extends._({}, nodeMembers[name].meta, {
                    isEvent: true,
                    name
                })
            });
            nodeMembers[name] = _extends._({}, nodeMembers[name], {
                meta: _extends._({}, nodeMembers[name].meta, {
                    isEvent: true,
                    name
                })
            });
        }
    }
    return nodeMembers;
}
function parseFile(sourceFile) {
    const src = _fs.readFileSync(sourceFile, 'utf8');
    return _typescript.default.createSourceFile('tempFile.ts', src, _typescript.default.ScriptTarget.Latest, true);
}
function getInterfaces(globs) {
    let interfaces = {};
    let extensions = {};
    globs.forEach((file)=>{
        const parsedFile = parseFile(file);
        interfaces = _extends._({}, interfaces, extractInterfaces(parsedFile, extensions));
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
        ancestors = [
            ...ancestors,
            ...parents
        ];
        parents.forEach((p)=>{
            if (p.extends === 'Omit') {
                // Omit: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
                // Special logic to handle the removing of properties via the Omit utility when a type is defined via extension.
                // e.g. export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'> { }
                p = p.params[0];
            }
            ancestors = [
                ...ancestors,
                ...getAncestors(extensions, p)
            ];
        });
    }
    return ancestors;
}
function isBuiltinUtilityType(type) {
    return type === 'Required' || type === 'Omit' || type === 'Pick' || type === 'Readonly' || type === 'Optional';
}
function mergeAncestorProps(isDocStyle, parent, child, getProps) {
    const props = _extends._({}, getProps(child));
    let mergedProps = props;
    // If the parent has a generic params lets apply the child's specific types
    if (parent.params && parent.params.length > 0) {
        if (child.meta && child.meta.typeParams) {
            child.meta.typeParams.forEach((t, i)=>{
                Object.entries(props).forEach(([k, v])=>{
                    delete mergedProps[k];
                    // Replace the generic params. Regex to make sure you are not just replacing 
                    // random letters in variable names.
                    var rep = `(?<!\\w)${t}(?!\\w)`;
                    var re = new RegExp(rep, "g");
                    var newKey = k.replace(re, parent.params[i]);
                    if (v) {
                        if (isDocStyle) {
                            if (v.type) {
                                let newArgs = undefined;
                                if (v.type.arguments) {
                                    newArgs = {};
                                    Object.entries(v.type.arguments).forEach(([ak, av])=>{
                                        newArgs[ak] = av.replace(re, parent.params[i]);
                                    });
                                }
                                const newReturnType = v.type.returnType.replace(re, parent.params[i]);
                                newValue = _extends._({}, v, {
                                    type: _extends._({}, v.type, {
                                        returnType: newReturnType,
                                        arguments: newArgs
                                    })
                                });
                            }
                        } else {
                            var newValue = v.replace(re, parent.params[i]);
                        }
                    }
                    mergedProps[newKey] = newValue;
                });
            });
        } else if (!isBuiltinUtilityType(parent.extends)) {
            throw new Error(`Parent interface ${parent.extends} takes generic params: [${parent.params.join()}] but child does not have typeParams.`);
        }
    }
    return mergedProps;
}
function mergeRespectingChildOverrides(parent, child) {
    let merged = _extends._({}, child);
    // We want the child properties to be list first for better doc reading experience
    // Normal spread merge to get the correct order wipes out child overrides
    // Hence the manual approach to the merge here.
    Object.entries(parent).forEach(([k, v])=>{
        if (!merged[k]) {
            merged[k] = v;
        }
    });
    return merged;
}
function applyInheritance(extensions, interfaces, isDocStyle) {
    Object.entries(extensions).forEach(([i])=>{
        const allAncestors = getAncestors(extensions, i);
        let extendedInterface = interfaces[i];
        // TODO: Inherited Generic types do not get passed through
        // Would need to make this tree work so that the params applied lower down  get sent up the tree and correctly applied
        // Example interface is ICellEditorComp
        allAncestors.forEach((a)=>{
            let extended = a.extends;
            let extInt = undefined;
            let omitFields = [];
            if (extended === 'Omit') {
                // Omit: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
                // Special logic to handle the removing of properties via the Omit utility when a type is defined via extension.
                // e.g. export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'> { }
                extended = a.params[0].replace(/<.*>/, '');
                a.params.slice(1).forEach((toRemove)=>{
                    toRemove.split("|").forEach((property)=>{
                        const typeName = property.replace(/'/g, "").trim();
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
                throw new Error('Missing interface: ' + JSON.stringify(a));
            }
            if (isDocStyle) {
                if (extInt) {
                    extendedInterface = mergeRespectingChildOverrides(mergeAncestorProps(isDocStyle, a, extInt, (a)=>a), extendedInterface);
                }
                omitFields.forEach((f)=>{
                    delete extendedInterface[f];
                });
            } else {
                if (extInt && extInt.type) {
                    extendedInterface.type = mergeRespectingChildOverrides(mergeAncestorProps(isDocStyle, a, extInt, (a)=>a.type), extendedInterface.type);
                }
                if (extInt && extInt.docs) {
                    extendedInterface.docs = mergeRespectingChildOverrides(mergeAncestorProps(isDocStyle, a, extInt, (a)=>a.docs), extendedInterface.docs);
                }
                omitFields.forEach((f)=>{
                    var _extendedInterface_docs, _extendedInterface_meta, _extendedInterface_type;
                    (_extendedInterface_docs = extendedInterface.docs) == null ? true : delete _extendedInterface_docs[f];
                    (_extendedInterface_meta = extendedInterface.meta) == null ? true : delete _extendedInterface_meta[f];
                    (_extendedInterface_type = extendedInterface.type) == null ? true : delete _extendedInterface_type[f];
                });
            }
        });
        interfaces[i] = extendedInterface;
    });
}
function extractInterfaces(srcFile, extension) {
    const interfaces = findAllInNodesTree(srcFile);
    const iLookup = {};
    interfaces.forEach((node)=>{
        const name = node && node.name && node.name.escapedText;
        const kind = _typescript.default.SyntaxKind[node.kind];
        if (node.heritageClauses) {
            node.heritageClauses.forEach((h)=>{
                if (h.types && h.types.length > 0) {
                    extension[name] = h.types.map((h)=>({
                            extends: formatNode(h.expression, srcFile),
                            params: h.typeArguments ? h.typeArguments.map((t)=>formatNode(t, srcFile)) : undefined
                        }));
                }
            });
        }
        if (kind == 'EnumDeclaration') {
            iLookup[name] = {
                meta: {
                    isEnum: true
                },
                type: node.members.map((n)=>formatNode(n, srcFile)),
                docs: node.members.map((n)=>getFullJsDoc(n))
            };
        } else if (kind == 'TypeAliasDeclaration') {
            iLookup[name] = {
                meta: {
                    isTypeAlias: true,
                    typeParams: node.typeParameters ? node.typeParameters.map((tp)=>formatNode(tp, srcFile)) : undefined
                },
                type: formatNode(node.type, srcFile)
            };
        } else {
            let isCallSignature = false;
            let members = {};
            let docs = {};
            let callSignatureMembers = {};
            if (node.members && node.members.length > 0) {
                node.members.map((p)=>{
                    isCallSignature = isCallSignature || _typescript.default.SyntaxKind[p.kind] == 'CallSignature';
                    if (isCallSignature) {
                        const argTypes = getArgTypes(p.parameters, srcFile);
                        callSignatureMembers = {
                            arguments: argTypes,
                            returnType: formatNode(p.type, srcFile)
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
                    throw new Error('Have a callSignature interface with more than one member! We were not expecting this to be possible!');
                }
            }
            if (isCallSignature) {
                iLookup[name] = {
                    meta: {
                        isCallSignature
                    },
                    type: callSignatureMembers
                };
            } else {
                let meta = {};
                iLookup[name] = {
                    meta,
                    type: members,
                    docs: Object.entries(docs).length > 0 ? docs : undefined
                };
            }
            if (node.typeParameters) {
                const orig = iLookup[name];
                iLookup[name] = _extends._({}, orig, {
                    meta: _extends._({}, orig.meta, {
                        typeParams: node.typeParameters.map((tp)=>formatNode(tp, srcFile))
                    })
                });
            }
            const doc = getFullJsDoc(node);
            if (doc) {
                const orig = iLookup[name];
                iLookup[name] = _extends._({}, orig, {
                    meta: _extends._({}, orig.meta, {
                        doc
                    })
                });
            }
        }
    });
    return iLookup;
}
function getClassProperties(filePath, className) {
    const srcFile = parseFile(filePath);
    const classNode = findNode(className, srcFile, 'ClassDeclaration');
    let members = {};
    _typescript.default.forEachChild(classNode, (n)=>{
        members = _extends._({}, members, extractMethodsAndPropsFromNode(n, srcFile));
    });
    return members;
}
function buildInterfaceProps(globs) {
    let interfaces = {
        _config_: {}
    };
    let extensions = {};
    globs.forEach((file)=>{
        const parsedFile = parseFile(file);
        // Using this method to build the extensions lookup required to get inheritance correct
        extractInterfaces(parsedFile, extensions);
        const interfacesInFile = findAllInNodesTree(parsedFile);
        interfacesInFile.forEach((iNode)=>{
            let props = {};
            iNode.forEachChild((ch)=>{
                const prop = extractTypesFromNode(ch, parsedFile, true);
                props = _extends._({}, props, prop);
            });
            const kind = _typescript.default.SyntaxKind[iNode.kind];
            if (kind == 'TypeAliasDeclaration') {
            // We do not support types here but have not seen this needed in the docs yet.
            }
            if (iNode.typeParameters) {
                props = _extends._({}, props, {
                    meta: _extends._({}, props.meta, {
                        typeParams: iNode.typeParameters.map((tp)=>formatNode(tp, parsedFile))
                    })
                });
            }
            const iName = formatNode(iNode.name, parsedFile, true);
            interfaces[iName] = props;
        });
    });
    applyInheritance(extensions, interfaces, true);
    return interfaces;
}
function hasPublicModifier(node) {
    if (node.modifiers) {
        return node.modifiers.some((m)=>_typescript.default.SyntaxKind[m.kind] == 'PublicKeyword');
    }
    return false;
}
function extractMethodsAndPropsFromNode(node, srcFile) {
    let nodeMembers = {};
    const kind = _typescript.default.SyntaxKind[node.kind];
    let name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();
    if (!hasPublicModifier(node)) {
        return nodeMembers;
    }
    if (kind == 'MethodDeclaration') {
        const methodArgs = getArgTypes(node.parameters, srcFile);
        nodeMembers[name] = {
            meta: getJsDoc(node),
            type: {
                arguments: methodArgs,
                returnType
            }
        };
    } else if (kind == 'PropertyDeclaration') {
        nodeMembers[name] = {
            meta: getJsDoc(node),
            type: {
                returnType: returnType
            }
        };
    }
    return nodeMembers;
}
function getGridOptions(gridOpsFile) {
    const srcFile = parseFile(gridOpsFile);
    const gridOptionsNode = findNode('GridOptions', srcFile);
    let gridOpsMembers = {};
    _typescript.default.forEachChild(gridOptionsNode, (n)=>{
        gridOpsMembers = _extends._({}, gridOpsMembers, extractTypesFromNode(n, srcFile, false));
    });
    return gridOpsMembers;
}
function getColumnOptions(colDefFile, filterFile) {
    const srcFile = parseFile(colDefFile);
    const abstractColDefNode = findNode('AbstractColDef', srcFile);
    const colGroupDefNode = findNode('ColGroupDef', srcFile);
    const colDefNode = findNode('ColDef', srcFile);
    const srcFilterFile = parseFile(filterFile);
    const filterNode = findNode('IFilterDef', srcFilterFile);
    let members = {};
    const addToMembers = (node, src)=>{
        _typescript.default.forEachChild(node, (n)=>{
            members = _extends._({}, members, extractTypesFromNode(n, src, false));
        });
    };
    addToMembers(abstractColDefNode, srcFile);
    addToMembers(colGroupDefNode, srcFile);
    addToMembers(colDefNode, srcFile);
    addToMembers(filterNode, srcFilterFile);
    return members;
}
function getGridApi(gridApiFile) {
    return getClassProperties(gridApiFile, 'GridApi');
}
function getRowNode(rowNodeFile) {
    const srcFile = parseFile(rowNodeFile);
    const iRowNode = findNode('IRowNode', srcFile);
    const baseRowNode = findNode('BaseRowNode', srcFile);
    const groupRowNode = findNode('GroupRowNode', srcFile);
    let rowNodeMembers = {};
    const addToMembers = (node)=>{
        _typescript.default.forEachChild(node, (n)=>{
            rowNodeMembers = _extends._({}, rowNodeMembers, extractTypesFromNode(n, srcFile, false));
        });
    };
    addToMembers(baseRowNode);
    addToMembers(groupRowNode);
    addToMembers(iRowNode);
    return rowNodeMembers;
}
function getColumn(columnFile) {
    return getClassProperties(columnFile, 'Column');
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leGVjdXRvcnMvZ2VuZXJhdGUvZ2VuZXJhdGUtY29kZS1yZWZlcmVuY2UtZmlsZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgeyBFdmVudHMgfSBmcm9tICcuL19jb3BpZWRGcm9tQ29yZS9ldmVudEtleXMnO1xuaW1wb3J0IHtnZXRGb3JtYXR0ZXJGb3JUU30gZnJvbSAnLi9mb3JtYXRBU1QnO1xuXG5jb25zdCB7IGZvcm1hdE5vZGUsIGZpbmROb2RlLCBnZXRGdWxsSnNEb2MsIGdldEpzRG9jIH0gPSBnZXRGb3JtYXR0ZXJGb3JUUyh0cyk7XG5cbmZ1bmN0aW9uIGdldENhbGxiYWNrRm9yRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghZXZlbnROYW1lIHx8IGV2ZW50TmFtZS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiBldmVudE5hbWU7XG4gICAgfVxuICAgIHJldHVybiAnb24nICsgZXZlbnROYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBldmVudE5hbWUuc3Vic3RyaW5nKDEpO1xufVxuXG5jb25zdCBFVkVOVFMgPSBPYmplY3QudmFsdWVzKEV2ZW50cylcbmNvbnN0IEVWRU5UX0xPT0tVUCA9IG5ldyBTZXQoRVZFTlRTLm1hcChldmVudCA9PiBnZXRDYWxsYmFja0ZvckV2ZW50KGV2ZW50KSkpO1xuXG5mdW5jdGlvbiBmaW5kQWxsSW5Ob2Rlc1RyZWUobm9kZSkge1xuICAgIGNvbnN0IGtpbmQgPSB0cy5TeW50YXhLaW5kW25vZGUua2luZF07XG4gICAgbGV0IGludGVyZmFjZXMgPSBbXTtcblxuICAgIGNvbnN0IGludGVyZmFjZU5vZGUgPSBraW5kID09ICdJbnRlcmZhY2VEZWNsYXJhdGlvbicgfHwga2luZCA9PSAnRW51bURlY2xhcmF0aW9uJyB8fCBraW5kID09ICdUeXBlQWxpYXNEZWNsYXJhdGlvbic7XG4gICAgY29uc3QgY2xhc3NOb2RlID0ga2luZCA9PSAnQ2xhc3NEZWNsYXJhdGlvbicgJiYgZ2V0RnVsbEpzRG9jKG5vZGUpPy5pbmRleE9mKCdAZG9jc0ludGVyZmFjZScpID49IDA7XG4gICAgaWYgKGludGVyZmFjZU5vZGUgfHwgY2xhc3NOb2RlKSB7XG4gICAgICAgIGludGVyZmFjZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIG4gPT4ge1xuICAgICAgICBjb25zdCBub2RlSW50ZXJmYWNlcyA9IGZpbmRBbGxJbk5vZGVzVHJlZShuKTtcbiAgICAgICAgaWYgKG5vZGVJbnRlcmZhY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGludGVyZmFjZXMgPSBbLi4uaW50ZXJmYWNlcywgLi4ubm9kZUludGVyZmFjZXNdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW50ZXJmYWNlcztcbn1cblxuZnVuY3Rpb24gZ2V0QXJnVHlwZXMocGFyYW1ldGVycywgZmlsZSkge1xuICAgIGNvbnN0IGFyZ3MgPSB7fTtcbiAgICAocGFyYW1ldGVycyB8fCBbXSkuZm9yRWFjaChwID0+IHtcbiAgICAgICAgY29uc3QgaW5pdFZhbHVlID0gZm9ybWF0Tm9kZShwLmluaXRpYWxpemVyLCBmaWxlKTtcbiAgICAgICAgY29uc3QgYXJnTmFtZSA9IGAke3AubmFtZS5lc2NhcGVkVGV4dH0ke3AucXVlc3Rpb25Ub2tlbiA/ICc/JyA6ICcnfWBcbiAgICAgICAgYXJnc1thcmdOYW1lXSA9IGAke2Zvcm1hdE5vZGUocC50eXBlLCBmaWxlKX0ke2luaXRWYWx1ZSA/IGAgPSAke2luaXRWYWx1ZX1gIDogJyd9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gYXJncztcbn1cblxuZnVuY3Rpb24gdG9DYW1lbENhc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWVbMF0udG9Mb3dlckNhc2UoKSArIHZhbHVlLnN1YnN0cmluZygxKTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFR5cGVzRnJvbU5vZGUobm9kZSwgc3JjRmlsZSwgaW5jbHVkZVF1ZXN0aW9uTWFyaykge1xuICAgIGxldCBub2RlTWVtYmVycyA9IHt9O1xuICAgIGNvbnN0IGtpbmQgPSB0cy5TeW50YXhLaW5kW25vZGUua2luZF07XG5cblxuICAgIGxldCBuYW1lID0gbm9kZSAmJiBub2RlLm5hbWUgJiYgbm9kZS5uYW1lLmVzY2FwZWRUZXh0O1xuICAgIGxldCByZXR1cm5UeXBlID0gbm9kZSAmJiBub2RlLnR5cGUgJiYgbm9kZS50eXBlLmdldEZ1bGxUZXh0KCkudHJpbSgpO1xuICAgIGxldCBvcHRpb25hbCA9IGluY2x1ZGVRdWVzdGlvbk1hcmsgPyBub2RlICYmICEhbm9kZS5xdWVzdGlvblRva2VuIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGtpbmQgPT0gJ1Byb3BlcnR5U2lnbmF0dXJlJykge1xuXG4gICAgICAgIGlmIChub2RlLnR5cGUgJiYgbm9kZS50eXBlLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIC8vIHNlbmRUb0NsaXBib2FyZD86IChwYXJhbXM6IFNlbmRUb0NsaXBib2FyZFBhcmFtcykgPT4gdm9pZDtcbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZEFyZ3MgPSBnZXRBcmdUeXBlcyhub2RlLnR5cGUucGFyYW1ldGVycywgc3JjRmlsZSk7XG4gICAgICAgICAgICByZXR1cm5UeXBlID0gZm9ybWF0Tm9kZShub2RlLnR5cGUudHlwZSwgc3JjRmlsZSk7XG4gICAgICAgICAgICBub2RlTWVtYmVyc1tuYW1lXSA9IHtcbiAgICAgICAgICAgICAgICBtZXRhOiBnZXRKc0RvYyhub2RlKSxcbiAgICAgICAgICAgICAgICB0eXBlOiB7IGFyZ3VtZW50czogbWV0aG9kQXJncywgcmV0dXJuVHlwZSwgb3B0aW9uYWwgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGkuZSBjb2xXaWR0aD86IG51bWJlcjsgICAgICAgICAgICAgXG4gICAgICAgICAgICBub2RlTWVtYmVyc1tuYW1lXSA9IHsgbWV0YTogZ2V0SnNEb2Mobm9kZSksIHR5cGU6IHsgcmV0dXJuVHlwZSwgb3B0aW9uYWwgfSB9O1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChraW5kID09ICdNZXRob2RTaWduYXR1cmUnIHx8IGtpbmQgPT0gJ01ldGhvZERlY2xhcmF0aW9uJykge1xuICAgICAgICAvLyBpLmUgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ/KCk6IGJvb2xlYW47XG4gICAgICAgIC8vIGkuZSBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzPyhub2RlOiBJUm93Tm9kZSk6IGJvb2xlYW47ICAgICAgICBcbiAgICAgICAgY29uc3QgbWV0aG9kQXJncyA9IGdldEFyZ1R5cGVzKG5vZGUucGFyYW1ldGVycywgc3JjRmlsZSk7XG5cbiAgICAgICAgbm9kZU1lbWJlcnNbbmFtZV0gPSB7XG4gICAgICAgICAgICBtZXRhOiBnZXRKc0RvYyhub2RlKSxcbiAgICAgICAgICAgIHR5cGU6IHsgYXJndW1lbnRzOiBtZXRob2RBcmdzLCByZXR1cm5UeXBlLCBvcHRpb25hbCB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKEVWRU5UX0xPT0tVUC5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZSBldmVudHMgd2l0aG91dCB0aGVpciBwcmVmaXhcbiAgICAgICAgICAgIGxldCBzaG9ydE5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIHNob3J0TmFtZSA9IHRvQ2FtZWxDYXNlKHNob3J0TmFtZSk7XG5cbiAgICAgICAgICAgIG5vZGVNZW1iZXJzW3Nob3J0TmFtZV0gPSB7IC4uLm5vZGVNZW1iZXJzW25hbWVdLCBtZXRhOiB7IC4uLm5vZGVNZW1iZXJzW25hbWVdLm1ldGEsIGlzRXZlbnQ6IHRydWUsIG5hbWUgfSB9O1xuICAgICAgICAgICAgbm9kZU1lbWJlcnNbbmFtZV0gPSB7IC4uLm5vZGVNZW1iZXJzW25hbWVdLCBtZXRhOiB7IC4uLm5vZGVNZW1iZXJzW25hbWVdLm1ldGEsIGlzRXZlbnQ6IHRydWUsIG5hbWUgfSB9O1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVNZW1iZXJzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUZpbGUoc291cmNlRmlsZSkge1xuICAgIGNvbnN0IHNyYyA9IGZzLnJlYWRGaWxlU3luYyhzb3VyY2VGaWxlLCAndXRmOCcpO1xuICAgIHJldHVybiB0cy5jcmVhdGVTb3VyY2VGaWxlKCd0ZW1wRmlsZS50cycsIHNyYywgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnRlcmZhY2VzKGdsb2JzKSB7XG4gICAgbGV0IGludGVyZmFjZXMgPSB7fTtcbiAgICBsZXQgZXh0ZW5zaW9ucyA9IHt9O1xuICAgIGdsb2JzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNlZEZpbGUgPSBwYXJzZUZpbGUoZmlsZSk7XG4gICAgICAgIGludGVyZmFjZXMgPSB7IC4uLmludGVyZmFjZXMsIC4uLmV4dHJhY3RJbnRlcmZhY2VzKHBhcnNlZEZpbGUsIGV4dGVuc2lvbnMpIH07XG4gICAgfSk7XG5cbiAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIHJlY29yZGVkIGFsbCB0aGUgaW50ZXJmYWNlcyB3ZSBjYW4gYXBwbHkgdGhlIGV4dGVuc2lvbiBwcm9wZXJ0aWVzLlxuICAgIC8vIEZvciBleGFtcGxlIENlbGxQb3NpdGlvbiBleHRlbmRzIFJvd1Bvc2l0aW9uIGFuZCB3ZSB3YW50IHRoZSBqc29uIHRvIGFkZCB0aGUgUm93UG9zaXRpb24gcHJvcGVydGllcyB0byB0aGUgQ2VsbFBvc2l0aW9uXG4gICAgYXBwbHlJbmhlcml0YW5jZShleHRlbnNpb25zLCBpbnRlcmZhY2VzLCBmYWxzZSk7XG4gICAgcmV0dXJuIGludGVyZmFjZXM7XG59XG5cbmZ1bmN0aW9uIGdldEFuY2VzdG9ycyhleHRlbnNpb25zLCBjaGlsZCkge1xuICAgIGxldCBhbmNlc3RvcnMgPSBbXTtcbiAgICBjb25zdCBleHRlbmRlZCA9IHR5cGVvZiAoY2hpbGQpID09PSAnc3RyaW5nJyA/IGNoaWxkIDogY2hpbGQuZXh0ZW5kcztcbiAgICBjb25zdCBwYXJlbnRzID0gZXh0ZW5zaW9uc1tleHRlbmRlZF07XG4gICAgaWYgKHBhcmVudHMpIHtcbiAgICAgICAgYW5jZXN0b3JzID0gWy4uLmFuY2VzdG9ycywgLi4ucGFyZW50c107XG4gICAgICAgIHBhcmVudHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIGlmIChwLmV4dGVuZHMgPT09ICdPbWl0Jykge1xuICAgICAgICAgICAgICAgIC8vIE9taXQ6IGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL3V0aWxpdHktdHlwZXMuaHRtbCNvbWl0dHlwZS1rZXlzXG4gICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBsb2dpYyB0byBoYW5kbGUgdGhlIHJlbW92aW5nIG9mIHByb3BlcnRpZXMgdmlhIHRoZSBPbWl0IHV0aWxpdHkgd2hlbiBhIHR5cGUgaXMgZGVmaW5lZCB2aWEgZXh0ZW5zaW9uLlxuICAgICAgICAgICAgICAgIC8vIGUuZy4gZXhwb3J0IGludGVyZmFjZSBBZ051bWJlckF4aXNUaGVtZU9wdGlvbnMgZXh0ZW5kcyBPbWl0PEFnTnVtYmVyQXhpc09wdGlvbnMsICd0eXBlJz4geyB9XG4gICAgICAgICAgICAgICAgcCA9IHAucGFyYW1zWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhbmNlc3RvcnMgPSBbLi4uYW5jZXN0b3JzLCAuLi5nZXRBbmNlc3RvcnMoZXh0ZW5zaW9ucywgcCldXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBhbmNlc3RvcnM7XG59XG5cbmZ1bmN0aW9uIGlzQnVpbHRpblV0aWxpdHlUeXBlKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ1JlcXVpcmVkJyB8fCB0eXBlID09PSAnT21pdCcgfHwgdHlwZSA9PT0gJ1BpY2snIHx8IHR5cGUgPT09ICdSZWFkb25seScgfHwgdHlwZSA9PT0gJ09wdGlvbmFsJztcbn1cblxuZnVuY3Rpb24gbWVyZ2VBbmNlc3RvclByb3BzKGlzRG9jU3R5bGUsIHBhcmVudCwgY2hpbGQsIGdldFByb3BzKSB7XG4gICAgY29uc3QgcHJvcHMgPSB7IC4uLmdldFByb3BzKGNoaWxkKSB9O1xuICAgIGxldCBtZXJnZWRQcm9wcyA9IHByb3BzO1xuICAgIC8vIElmIHRoZSBwYXJlbnQgaGFzIGEgZ2VuZXJpYyBwYXJhbXMgbGV0cyBhcHBseSB0aGUgY2hpbGQncyBzcGVjaWZpYyB0eXBlc1xuICAgIGlmIChwYXJlbnQucGFyYW1zICYmIHBhcmVudC5wYXJhbXMubGVuZ3RoID4gMCkge1xuXG4gICAgICAgIGlmIChjaGlsZC5tZXRhICYmIGNoaWxkLm1ldGEudHlwZVBhcmFtcykge1xuICAgICAgICAgICAgY2hpbGQubWV0YS50eXBlUGFyYW1zLmZvckVhY2goKHQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhwcm9wcykuZm9yRWFjaCgoW2ssIHZdOltzdHJpbmcsYW55XSkgPT4geyAvLy5maWx0ZXIoKFtrLCB2XSkgPT4gayAhPT0gJ21ldGEnKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbWVyZ2VkUHJvcHNba107XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIGdlbmVyaWMgcGFyYW1zLiBSZWdleCB0byBtYWtlIHN1cmUgeW91IGFyZSBub3QganVzdCByZXBsYWNpbmcgXG4gICAgICAgICAgICAgICAgICAgIC8vIHJhbmRvbSBsZXR0ZXJzIGluIHZhcmlhYmxlIG5hbWVzLlxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVwID0gYCg/PCFcXFxcdykke3R9KD8hXFxcXHcpYDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChyZXAsIFwiZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0tleSA9IGsucmVwbGFjZShyZSwgcGFyZW50LnBhcmFtc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0RvY1N0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3QXJncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYudHlwZS5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FyZ3MgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHYudHlwZS5hcmd1bWVudHMpLmZvckVhY2goKFthaywgYXZdOlthbnksYW55XSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FyZ3NbYWtdID0gYXYucmVwbGFjZShyZSwgcGFyZW50LnBhcmFtc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UmV0dXJuVHlwZSA9IHYudHlwZS5yZXR1cm5UeXBlLnJlcGxhY2UocmUsIHBhcmVudC5wYXJhbXNbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0geyAuLi52LCB0eXBlOiB7IC4uLnYudHlwZSwgcmV0dXJuVHlwZTogbmV3UmV0dXJuVHlwZSwgYXJndW1lbnRzOiBuZXdBcmdzIH0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdi5yZXBsYWNlKHJlLCBwYXJlbnQucGFyYW1zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb3BzW25ld0tleV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKCFpc0J1aWx0aW5VdGlsaXR5VHlwZShwYXJlbnQuZXh0ZW5kcykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGFyZW50IGludGVyZmFjZSAke3BhcmVudC5leHRlbmRzfSB0YWtlcyBnZW5lcmljIHBhcmFtczogWyR7cGFyZW50LnBhcmFtcy5qb2luKCl9XSBidXQgY2hpbGQgZG9lcyBub3QgaGF2ZSB0eXBlUGFyYW1zLmApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZWRQcm9wcztcbn07XG5cbmZ1bmN0aW9uIG1lcmdlUmVzcGVjdGluZ0NoaWxkT3ZlcnJpZGVzKHBhcmVudCwgY2hpbGQpIHtcbiAgICBsZXQgbWVyZ2VkID0geyAuLi5jaGlsZCB9O1xuICAgIC8vIFdlIHdhbnQgdGhlIGNoaWxkIHByb3BlcnRpZXMgdG8gYmUgbGlzdCBmaXJzdCBmb3IgYmV0dGVyIGRvYyByZWFkaW5nIGV4cGVyaWVuY2VcbiAgICAvLyBOb3JtYWwgc3ByZWFkIG1lcmdlIHRvIGdldCB0aGUgY29ycmVjdCBvcmRlciB3aXBlcyBvdXQgY2hpbGQgb3ZlcnJpZGVzXG4gICAgLy8gSGVuY2UgdGhlIG1hbnVhbCBhcHByb2FjaCB0byB0aGUgbWVyZ2UgaGVyZS5cbiAgICBPYmplY3QuZW50cmllcyhwYXJlbnQpLmZvckVhY2goKFtrLCB2XSkgPT4ge1xuICAgICAgICBpZiAoIW1lcmdlZFtrXSkge1xuICAgICAgICAgICAgbWVyZ2VkW2tdID0gdjtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG1lcmdlZDtcbn1cblxuZnVuY3Rpb24gYXBwbHlJbmhlcml0YW5jZShleHRlbnNpb25zLCBpbnRlcmZhY2VzLCBpc0RvY1N0eWxlKSB7XG4gICAgT2JqZWN0LmVudHJpZXMoZXh0ZW5zaW9ucykuZm9yRWFjaCgoW2ksXSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGFsbEFuY2VzdG9ycyA9IGdldEFuY2VzdG9ycyhleHRlbnNpb25zLCBpKTtcbiAgICAgICAgbGV0IGV4dGVuZGVkSW50ZXJmYWNlID0gaW50ZXJmYWNlc1tpXTtcblxuICAgICAgICAvLyBUT0RPOiBJbmhlcml0ZWQgR2VuZXJpYyB0eXBlcyBkbyBub3QgZ2V0IHBhc3NlZCB0aHJvdWdoXG4gICAgICAgIC8vIFdvdWxkIG5lZWQgdG8gbWFrZSB0aGlzIHRyZWUgd29yayBzbyB0aGF0IHRoZSBwYXJhbXMgYXBwbGllZCBsb3dlciBkb3duICBnZXQgc2VudCB1cCB0aGUgdHJlZSBhbmQgY29ycmVjdGx5IGFwcGxpZWRcbiAgICAgICAgLy8gRXhhbXBsZSBpbnRlcmZhY2UgaXMgSUNlbGxFZGl0b3JDb21wXG5cbiAgICAgICAgYWxsQW5jZXN0b3JzLmZvckVhY2goYSA9PiB7XG4gICAgICAgICAgICBsZXQgZXh0ZW5kZWQgPSBhLmV4dGVuZHM7XG5cbiAgICAgICAgICAgIGxldCBleHRJbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBsZXQgb21pdEZpZWxkcyA9IFtdO1xuICAgICAgICAgICAgaWYgKGV4dGVuZGVkID09PSAnT21pdCcpIHtcbiAgICAgICAgICAgICAgICAvLyBPbWl0OiBodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay91dGlsaXR5LXR5cGVzLmh0bWwjb21pdHR5cGUta2V5c1xuICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgbG9naWMgdG8gaGFuZGxlIHRoZSByZW1vdmluZyBvZiBwcm9wZXJ0aWVzIHZpYSB0aGUgT21pdCB1dGlsaXR5IHdoZW4gYSB0eXBlIGlzIGRlZmluZWQgdmlhIGV4dGVuc2lvbi5cbiAgICAgICAgICAgICAgICAvLyBlLmcuIGV4cG9ydCBpbnRlcmZhY2UgQWdOdW1iZXJBeGlzVGhlbWVPcHRpb25zIGV4dGVuZHMgT21pdDxBZ051bWJlckF4aXNPcHRpb25zLCAndHlwZSc+IHsgfVxuICAgICAgICAgICAgICAgIGV4dGVuZGVkID0gYS5wYXJhbXNbMF0ucmVwbGFjZSgvPC4qPi8sICcnKTtcbiAgICAgICAgICAgICAgICBhLnBhcmFtcy5zbGljZSgxKS5mb3JFYWNoKHRvUmVtb3ZlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuc3BsaXQoXCJ8XCIpLmZvckVhY2gocHJvcGVydHkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZU5hbWUgPSBwcm9wZXJ0eS5yZXBsYWNlKC8nL2csIFwiXCIpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9taXRGaWVsZHMucHVzaCh0eXBlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0J1aWx0aW5VdGlsaXR5VHlwZShleHRlbmRlZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXF1aXJlZDogaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svdXRpbGl0eS10eXBlcy5odG1sXG4gICAgICAgICAgICAgICAgZXh0ZW5kZWQgPSBhLnBhcmFtc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4dEludCA9IGludGVyZmFjZXNbZXh0ZW5kZWRdO1xuXG4gICAgICAgICAgICBpZiAoIWV4dEludCkge1xuICAgICAgICAgICAgICAgIC8vQ2hlY2sgZm9yIHR5cGUgcGFyYW1zXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGludGVyZmFjZTogJyArIEpTT04uc3RyaW5naWZ5KGEpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzRG9jU3R5bGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0SW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZGVkSW50ZXJmYWNlID0gbWVyZ2VSZXNwZWN0aW5nQ2hpbGRPdmVycmlkZXMobWVyZ2VBbmNlc3RvclByb3BzKGlzRG9jU3R5bGUsIGEsIGV4dEludCwgYSA9PiBhKSwgZXh0ZW5kZWRJbnRlcmZhY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvbWl0RmllbGRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV4dGVuZGVkSW50ZXJmYWNlW2ZdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0SW50ICYmIGV4dEludC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZGVkSW50ZXJmYWNlLnR5cGUgPSBtZXJnZVJlc3BlY3RpbmdDaGlsZE92ZXJyaWRlcyhtZXJnZUFuY2VzdG9yUHJvcHMoaXNEb2NTdHlsZSwgYSwgZXh0SW50LCBhID0+IGEudHlwZSksIGV4dGVuZGVkSW50ZXJmYWNlLnR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXh0SW50ICYmIGV4dEludC5kb2NzKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZGVkSW50ZXJmYWNlLmRvY3MgPSBtZXJnZVJlc3BlY3RpbmdDaGlsZE92ZXJyaWRlcyhtZXJnZUFuY2VzdG9yUHJvcHMoaXNEb2NTdHlsZSwgYSwgZXh0SW50LCBhID0+IGEuZG9jcyksIGV4dGVuZGVkSW50ZXJmYWNlLmRvY3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvbWl0RmllbGRzLmZvckVhY2goKGYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV4dGVuZGVkSW50ZXJmYWNlLmRvY3M/LltmXTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV4dGVuZGVkSW50ZXJmYWNlLm1ldGE/LltmXTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV4dGVuZGVkSW50ZXJmYWNlLnR5cGU/LltmXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGludGVyZmFjZXNbaV0gPSBleHRlbmRlZEludGVyZmFjZTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEludGVyZmFjZXMoc3JjRmlsZSwgZXh0ZW5zaW9uKSB7XG4gICAgY29uc3QgaW50ZXJmYWNlcyA9IGZpbmRBbGxJbk5vZGVzVHJlZShzcmNGaWxlKTtcbiAgICBjb25zdCBpTG9va3VwID0ge307XG4gICAgaW50ZXJmYWNlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gbm9kZSAmJiBub2RlLm5hbWUgJiYgbm9kZS5uYW1lLmVzY2FwZWRUZXh0O1xuICAgICAgICBjb25zdCBraW5kID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdO1xuXG4gICAgICAgIGlmIChub2RlLmhlcml0YWdlQ2xhdXNlcykge1xuICAgICAgICAgICAgbm9kZS5oZXJpdGFnZUNsYXVzZXMuZm9yRWFjaChoID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaC50eXBlcyAmJiBoLnR5cGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uW25hbWVdID0gaC50eXBlcy5tYXAoaCA9PiAoeyBleHRlbmRzOiBmb3JtYXROb2RlKGguZXhwcmVzc2lvbiwgc3JjRmlsZSksIHBhcmFtczogaC50eXBlQXJndW1lbnRzID8gaC50eXBlQXJndW1lbnRzLm1hcCh0ID0+IGZvcm1hdE5vZGUodCwgc3JjRmlsZSkpIDogdW5kZWZpbmVkIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChraW5kID09ICdFbnVtRGVjbGFyYXRpb24nKSB7XG4gICAgICAgICAgICBpTG9va3VwW25hbWVdID0ge1xuICAgICAgICAgICAgICAgIG1ldGE6IHsgaXNFbnVtOiB0cnVlIH0sIHR5cGU6IG5vZGUubWVtYmVycy5tYXAobiA9PiBmb3JtYXROb2RlKG4sIHNyY0ZpbGUpKSxcbiAgICAgICAgICAgICAgICBkb2NzOiBub2RlLm1lbWJlcnMubWFwKG4gPT4gZ2V0RnVsbEpzRG9jKG4pKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT0gJ1R5cGVBbGlhc0RlY2xhcmF0aW9uJykge1xuICAgICAgICAgICAgaUxvb2t1cFtuYW1lXSA9IHtcbiAgICAgICAgICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGlzVHlwZUFsaWFzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlUGFyYW1zOiBub2RlLnR5cGVQYXJhbWV0ZXJzID8gbm9kZS50eXBlUGFyYW1ldGVycy5tYXAodHAgPT4gZm9ybWF0Tm9kZSh0cCwgc3JjRmlsZSkpIDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0eXBlOiBmb3JtYXROb2RlKG5vZGUudHlwZSwgc3JjRmlsZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgbGV0IGlzQ2FsbFNpZ25hdHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IG1lbWJlcnMgPSB7fTtcbiAgICAgICAgICAgIGxldCBkb2NzID0ge307XG4gICAgICAgICAgICBsZXQgY2FsbFNpZ25hdHVyZU1lbWJlcnMgPSB7fTtcblxuICAgICAgICAgICAgaWYgKG5vZGUubWVtYmVycyAmJiBub2RlLm1lbWJlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG5vZGUubWVtYmVycy5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlzQ2FsbFNpZ25hdHVyZSA9IGlzQ2FsbFNpZ25hdHVyZSB8fCB0cy5TeW50YXhLaW5kW3Aua2luZF0gPT0gJ0NhbGxTaWduYXR1cmUnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDYWxsU2lnbmF0dXJlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyZ1R5cGVzID0gZ2V0QXJnVHlwZXMocC5wYXJhbWV0ZXJzLCBzcmNGaWxlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFNpZ25hdHVyZU1lbWJlcnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzOiBhcmdUeXBlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlOiBmb3JtYXROb2RlKHAudHlwZSwgc3JjRmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wTmFtZSA9IGZvcm1hdE5vZGUocCwgc3JjRmlsZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wVHlwZSA9IGZvcm1hdE5vZGUocC50eXBlLCBzcmNGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbcHJvcE5hbWVdID0gcHJvcFR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBnZXRGdWxsSnNEb2MocCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jc1twcm9wTmFtZV0gPSBnZXRGdWxsSnNEb2MocCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzQ2FsbFNpZ25hdHVyZSAmJiBub2RlLm1lbWJlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhdmUgYSBjYWxsU2lnbmF0dXJlIGludGVyZmFjZSB3aXRoIG1vcmUgdGhhbiBvbmUgbWVtYmVyISBXZSB3ZXJlIG5vdCBleHBlY3RpbmcgdGhpcyB0byBiZSBwb3NzaWJsZSEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNDYWxsU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgaUxvb2t1cFtuYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YTogeyBpc0NhbGxTaWduYXR1cmUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogY2FsbFNpZ25hdHVyZU1lbWJlcnNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBtZXRhID0ge307XG4gICAgICAgICAgICAgICAgaUxvb2t1cFtuYW1lXSA9IHsgbWV0YSwgdHlwZTogbWVtYmVycywgZG9jczogT2JqZWN0LmVudHJpZXMoZG9jcykubGVuZ3RoID4gMCA/IGRvY3MgOiB1bmRlZmluZWQgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlUGFyYW1ldGVycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWcgPSBpTG9va3VwW25hbWVdO1xuICAgICAgICAgICAgICAgIGlMb29rdXBbbmFtZV0gPSB7IC4uLm9yaWcsIG1ldGE6IHsgLi4ub3JpZy5tZXRhLCB0eXBlUGFyYW1zOiBub2RlLnR5cGVQYXJhbWV0ZXJzLm1hcCh0cCA9PiBmb3JtYXROb2RlKHRwLCBzcmNGaWxlKSkgfSB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGdldEZ1bGxKc0RvYyhub2RlKTtcbiAgICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcmlnID0gaUxvb2t1cFtuYW1lXTtcbiAgICAgICAgICAgICAgICBpTG9va3VwW25hbWVdID0geyAuLi5vcmlnLCBtZXRhOiB7IC4uLm9yaWcubWV0YSwgZG9jIH0gfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGlMb29rdXA7XG59XG5cblxuXG5mdW5jdGlvbiBnZXRDbGFzc1Byb3BlcnRpZXMoZmlsZVBhdGgsIGNsYXNzTmFtZSkge1xuICAgIGNvbnN0IHNyY0ZpbGUgPSBwYXJzZUZpbGUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGNsYXNzTm9kZSA9IGZpbmROb2RlKGNsYXNzTmFtZSwgc3JjRmlsZSwgJ0NsYXNzRGVjbGFyYXRpb24nKTtcblxuICAgIGxldCBtZW1iZXJzID0ge307XG4gICAgdHMuZm9yRWFjaENoaWxkKGNsYXNzTm9kZSwgbiA9PiB7XG4gICAgICAgIG1lbWJlcnMgPSB7IC4uLm1lbWJlcnMsIC4uLmV4dHJhY3RNZXRob2RzQW5kUHJvcHNGcm9tTm9kZShuLCBzcmNGaWxlKSB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbWVtYmVycztcbn1cblxuLyoqIEJ1aWxkIHRoZSBpbnRlcmZhY2UgZmlsZSBpbiB0aGUgZm9ybWF0IHRoYXQgY2FuIGJlIHVzZWQgYnkgPGludGVyZmFjZS1kb2N1bWVudGF0aW9uPiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkSW50ZXJmYWNlUHJvcHMoZ2xvYnMpIHtcblxuICAgIGxldCBpbnRlcmZhY2VzID0ge1xuICAgICAgICBfY29uZmlnXzoge30sXG4gICAgfTtcbiAgICBsZXQgZXh0ZW5zaW9ucyA9IHt9O1xuICAgIGdsb2JzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNlZEZpbGUgPSBwYXJzZUZpbGUoZmlsZSk7XG5cbiAgICAgICAgLy8gVXNpbmcgdGhpcyBtZXRob2QgdG8gYnVpbGQgdGhlIGV4dGVuc2lvbnMgbG9va3VwIHJlcXVpcmVkIHRvIGdldCBpbmhlcml0YW5jZSBjb3JyZWN0XG4gICAgICAgIGV4dHJhY3RJbnRlcmZhY2VzKHBhcnNlZEZpbGUsIGV4dGVuc2lvbnMpO1xuXG4gICAgICAgIGNvbnN0IGludGVyZmFjZXNJbkZpbGUgPSBmaW5kQWxsSW5Ob2Rlc1RyZWUocGFyc2VkRmlsZSk7XG4gICAgICAgIGludGVyZmFjZXNJbkZpbGUuZm9yRWFjaChpTm9kZSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvcHM6IGFueSA9IHt9O1xuICAgICAgICAgICAgaU5vZGUuZm9yRWFjaENoaWxkKGNoID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wID0gZXh0cmFjdFR5cGVzRnJvbU5vZGUoY2gsIHBhcnNlZEZpbGUsIHRydWUpO1xuICAgICAgICAgICAgICAgIHByb3BzID0geyAuLi5wcm9wcywgLi4ucHJvcCB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBjb25zdCBraW5kID0gdHMuU3ludGF4S2luZFtpTm9kZS5raW5kXTtcbiAgICAgICAgICAgIGlmIChraW5kID09ICdUeXBlQWxpYXNEZWNsYXJhdGlvbicpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBkbyBub3Qgc3VwcG9ydCB0eXBlcyBoZXJlIGJ1dCBoYXZlIG5vdCBzZWVuIHRoaXMgbmVlZGVkIGluIHRoZSBkb2NzIHlldC5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlOb2RlLnR5cGVQYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMgPSB7IC4uLnByb3BzLCBtZXRhOiB7IC4uLnByb3BzLm1ldGEsIHR5cGVQYXJhbXM6IGlOb2RlLnR5cGVQYXJhbWV0ZXJzLm1hcCh0cCA9PiBmb3JtYXROb2RlKHRwLCBwYXJzZWRGaWxlKSkgfSB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGlOYW1lID0gZm9ybWF0Tm9kZShpTm9kZS5uYW1lLCBwYXJzZWRGaWxlLCB0cnVlKTtcbiAgICAgICAgICAgIGludGVyZmFjZXNbaU5hbWVdID0gcHJvcHM7XG4gICAgICAgIH0pXG4gICAgfSk7XG5cbiAgICBhcHBseUluaGVyaXRhbmNlKGV4dGVuc2lvbnMsIGludGVyZmFjZXMsIHRydWUpO1xuXG4gICAgcmV0dXJuIGludGVyZmFjZXM7XG59XG5cbmZ1bmN0aW9uIGhhc1B1YmxpY01vZGlmaWVyKG5vZGUpIHtcbiAgICBpZiAobm9kZS5tb2RpZmllcnMpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubW9kaWZpZXJzLnNvbWUobSA9PiB0cy5TeW50YXhLaW5kW20ua2luZF0gPT0gJ1B1YmxpY0tleXdvcmQnKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RNZXRob2RzQW5kUHJvcHNGcm9tTm9kZShub2RlLCBzcmNGaWxlKSB7XG4gICAgbGV0IG5vZGVNZW1iZXJzID0ge307XG4gICAgY29uc3Qga2luZCA9IHRzLlN5bnRheEtpbmRbbm9kZS5raW5kXTtcbiAgICBsZXQgbmFtZSA9IG5vZGUgJiYgbm9kZS5uYW1lICYmIG5vZGUubmFtZS5lc2NhcGVkVGV4dDtcbiAgICBsZXQgcmV0dXJuVHlwZSA9IG5vZGUgJiYgbm9kZS50eXBlICYmIG5vZGUudHlwZS5nZXRGdWxsVGV4dCgpLnRyaW0oKTtcblxuXG4gICAgaWYgKCFoYXNQdWJsaWNNb2RpZmllcihub2RlKSkge1xuICAgICAgICByZXR1cm4gbm9kZU1lbWJlcnM7XG4gICAgfVxuXG4gICAgaWYgKGtpbmQgPT0gJ01ldGhvZERlY2xhcmF0aW9uJykge1xuICAgICAgICBjb25zdCBtZXRob2RBcmdzID0gZ2V0QXJnVHlwZXMobm9kZS5wYXJhbWV0ZXJzLCBzcmNGaWxlKTtcblxuICAgICAgICBub2RlTWVtYmVyc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIG1ldGE6IGdldEpzRG9jKG5vZGUpLFxuICAgICAgICAgICAgdHlwZTogeyBhcmd1bWVudHM6IG1ldGhvZEFyZ3MsIHJldHVyblR5cGUgfVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PSAnUHJvcGVydHlEZWNsYXJhdGlvbicpIHtcbiAgICAgICAgbm9kZU1lbWJlcnNbbmFtZV0gPSB7XG4gICAgICAgICAgICBtZXRhOiBnZXRKc0RvYyhub2RlKSxcbiAgICAgICAgICAgIHR5cGU6IHsgcmV0dXJuVHlwZTogcmV0dXJuVHlwZSB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVNZW1iZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JpZE9wdGlvbnMoZ3JpZE9wc0ZpbGU6IHN0cmluZykge1xuICAgIGNvbnN0IHNyY0ZpbGUgPSBwYXJzZUZpbGUoZ3JpZE9wc0ZpbGUpO1xuICAgIGNvbnN0IGdyaWRPcHRpb25zTm9kZSA9IGZpbmROb2RlKCdHcmlkT3B0aW9ucycsIHNyY0ZpbGUpO1xuXG4gICAgbGV0IGdyaWRPcHNNZW1iZXJzID0ge307XG4gICAgdHMuZm9yRWFjaENoaWxkKGdyaWRPcHRpb25zTm9kZSwgbiA9PiB7XG4gICAgICAgIGdyaWRPcHNNZW1iZXJzID0geyAuLi5ncmlkT3BzTWVtYmVycywgLi4uZXh0cmFjdFR5cGVzRnJvbU5vZGUobiwgc3JjRmlsZSwgZmFsc2UpIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBncmlkT3BzTWVtYmVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbHVtbk9wdGlvbnMoY29sRGVmRmlsZTogc3RyaW5nLCBmaWx0ZXJGaWxlOiBzdHJpbmcpIHsgICAgXG4gICAgY29uc3Qgc3JjRmlsZSA9IHBhcnNlRmlsZShjb2xEZWZGaWxlKTtcbiAgICBjb25zdCBhYnN0cmFjdENvbERlZk5vZGUgPSBmaW5kTm9kZSgnQWJzdHJhY3RDb2xEZWYnLCBzcmNGaWxlKTtcbiAgICBjb25zdCBjb2xHcm91cERlZk5vZGUgPSBmaW5kTm9kZSgnQ29sR3JvdXBEZWYnLCBzcmNGaWxlKTtcbiAgICBjb25zdCBjb2xEZWZOb2RlID0gZmluZE5vZGUoJ0NvbERlZicsIHNyY0ZpbGUpO1xuICAgIGNvbnN0IHNyY0ZpbHRlckZpbGUgPSBwYXJzZUZpbGUoZmlsdGVyRmlsZSk7XG4gICAgY29uc3QgZmlsdGVyTm9kZSA9IGZpbmROb2RlKCdJRmlsdGVyRGVmJywgc3JjRmlsdGVyRmlsZSk7XG5cbiAgICBsZXQgbWVtYmVycyA9IHt9O1xuICAgIGNvbnN0IGFkZFRvTWVtYmVycyA9IChub2RlLCBzcmMpID0+IHtcbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIG4gPT4ge1xuICAgICAgICAgICAgbWVtYmVycyA9IHsgLi4ubWVtYmVycywgLi4uZXh0cmFjdFR5cGVzRnJvbU5vZGUobiwgc3JjLCBmYWxzZSkgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWRkVG9NZW1iZXJzKGFic3RyYWN0Q29sRGVmTm9kZSwgc3JjRmlsZSk7XG4gICAgYWRkVG9NZW1iZXJzKGNvbEdyb3VwRGVmTm9kZSwgc3JjRmlsZSk7XG4gICAgYWRkVG9NZW1iZXJzKGNvbERlZk5vZGUsIHNyY0ZpbGUpO1xuICAgIGFkZFRvTWVtYmVycyhmaWx0ZXJOb2RlLCBzcmNGaWx0ZXJGaWxlKTtcblxuICAgIHJldHVybiBtZW1iZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JpZEFwaShncmlkQXBpRmlsZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGdldENsYXNzUHJvcGVydGllcyhncmlkQXBpRmlsZSwgJ0dyaWRBcGknKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3dOb2RlKHJvd05vZGVGaWxlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzcmNGaWxlID0gcGFyc2VGaWxlKHJvd05vZGVGaWxlKTtcbiAgICBjb25zdCBpUm93Tm9kZSA9IGZpbmROb2RlKCdJUm93Tm9kZScsIHNyY0ZpbGUpO1xuICAgIGNvbnN0IGJhc2VSb3dOb2RlID0gZmluZE5vZGUoJ0Jhc2VSb3dOb2RlJywgc3JjRmlsZSk7XG4gICAgY29uc3QgZ3JvdXBSb3dOb2RlID0gZmluZE5vZGUoJ0dyb3VwUm93Tm9kZScsIHNyY0ZpbGUpO1xuXG4gICAgbGV0IHJvd05vZGVNZW1iZXJzID0ge307XG4gICAgY29uc3QgYWRkVG9NZW1iZXJzID0gKG5vZGUpID0+IHtcbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIG4gPT4ge1xuICAgICAgICAgICAgcm93Tm9kZU1lbWJlcnMgPSB7IC4uLnJvd05vZGVNZW1iZXJzLCAuLi5leHRyYWN0VHlwZXNGcm9tTm9kZShuLCBzcmNGaWxlLCBmYWxzZSkgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWRkVG9NZW1iZXJzKGJhc2VSb3dOb2RlKTtcbiAgICBhZGRUb01lbWJlcnMoZ3JvdXBSb3dOb2RlKTtcbiAgICBhZGRUb01lbWJlcnMoaVJvd05vZGUpO1xuXG4gICAgcmV0dXJuIHJvd05vZGVNZW1iZXJzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbHVtbihjb2x1bW5GaWxlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0Q2xhc3NQcm9wZXJ0aWVzKGNvbHVtbkZpbGUsICdDb2x1bW4nKTtcbn1cblxuXG5cblxuIl0sIm5hbWVzIjpbImJ1aWxkSW50ZXJmYWNlUHJvcHMiLCJnZXRDb2x1bW4iLCJnZXRDb2x1bW5PcHRpb25zIiwiZ2V0R3JpZEFwaSIsImdldEdyaWRPcHRpb25zIiwiZ2V0SW50ZXJmYWNlcyIsImdldFJvd05vZGUiLCJmb3JtYXROb2RlIiwiZmluZE5vZGUiLCJnZXRGdWxsSnNEb2MiLCJnZXRKc0RvYyIsImdldEZvcm1hdHRlckZvclRTIiwidHMiLCJnZXRDYWxsYmFja0ZvckV2ZW50IiwiZXZlbnROYW1lIiwibGVuZ3RoIiwidG9VcHBlckNhc2UiLCJzdWJzdHJpbmciLCJFVkVOVFMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJFdmVudHMiLCJFVkVOVF9MT09LVVAiLCJTZXQiLCJtYXAiLCJldmVudCIsImZpbmRBbGxJbk5vZGVzVHJlZSIsIm5vZGUiLCJraW5kIiwiU3ludGF4S2luZCIsImludGVyZmFjZXMiLCJpbnRlcmZhY2VOb2RlIiwiY2xhc3NOb2RlIiwiaW5kZXhPZiIsInB1c2giLCJmb3JFYWNoQ2hpbGQiLCJuIiwibm9kZUludGVyZmFjZXMiLCJnZXRBcmdUeXBlcyIsInBhcmFtZXRlcnMiLCJmaWxlIiwiYXJncyIsImZvckVhY2giLCJwIiwiaW5pdFZhbHVlIiwiaW5pdGlhbGl6ZXIiLCJhcmdOYW1lIiwibmFtZSIsImVzY2FwZWRUZXh0IiwicXVlc3Rpb25Ub2tlbiIsInR5cGUiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJleHRyYWN0VHlwZXNGcm9tTm9kZSIsInNyY0ZpbGUiLCJpbmNsdWRlUXVlc3Rpb25NYXJrIiwibm9kZU1lbWJlcnMiLCJyZXR1cm5UeXBlIiwiZ2V0RnVsbFRleHQiLCJ0cmltIiwib3B0aW9uYWwiLCJ1bmRlZmluZWQiLCJtZXRob2RBcmdzIiwibWV0YSIsImFyZ3VtZW50cyIsImhhcyIsInNob3J0TmFtZSIsImlzRXZlbnQiLCJwYXJzZUZpbGUiLCJzb3VyY2VGaWxlIiwic3JjIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJjcmVhdGVTb3VyY2VGaWxlIiwiU2NyaXB0VGFyZ2V0IiwiTGF0ZXN0IiwiZ2xvYnMiLCJleHRlbnNpb25zIiwicGFyc2VkRmlsZSIsImV4dHJhY3RJbnRlcmZhY2VzIiwiYXBwbHlJbmhlcml0YW5jZSIsImdldEFuY2VzdG9ycyIsImNoaWxkIiwiYW5jZXN0b3JzIiwiZXh0ZW5kZWQiLCJleHRlbmRzIiwicGFyZW50cyIsInBhcmFtcyIsImlzQnVpbHRpblV0aWxpdHlUeXBlIiwibWVyZ2VBbmNlc3RvclByb3BzIiwiaXNEb2NTdHlsZSIsInBhcmVudCIsImdldFByb3BzIiwicHJvcHMiLCJtZXJnZWRQcm9wcyIsInR5cGVQYXJhbXMiLCJ0IiwiaSIsImVudHJpZXMiLCJrIiwidiIsInJlcCIsInJlIiwiUmVnRXhwIiwibmV3S2V5IiwicmVwbGFjZSIsIm5ld0FyZ3MiLCJhayIsImF2IiwibmV3UmV0dXJuVHlwZSIsIm5ld1ZhbHVlIiwiRXJyb3IiLCJqb2luIiwibWVyZ2VSZXNwZWN0aW5nQ2hpbGRPdmVycmlkZXMiLCJtZXJnZWQiLCJhbGxBbmNlc3RvcnMiLCJleHRlbmRlZEludGVyZmFjZSIsImEiLCJleHRJbnQiLCJvbWl0RmllbGRzIiwic2xpY2UiLCJ0b1JlbW92ZSIsInNwbGl0IiwicHJvcGVydHkiLCJ0eXBlTmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJmIiwiZG9jcyIsImV4dGVuc2lvbiIsImlMb29rdXAiLCJoZXJpdGFnZUNsYXVzZXMiLCJoIiwidHlwZXMiLCJleHByZXNzaW9uIiwidHlwZUFyZ3VtZW50cyIsImlzRW51bSIsIm1lbWJlcnMiLCJpc1R5cGVBbGlhcyIsInR5cGVQYXJhbWV0ZXJzIiwidHAiLCJpc0NhbGxTaWduYXR1cmUiLCJjYWxsU2lnbmF0dXJlTWVtYmVycyIsImFyZ1R5cGVzIiwicHJvcE5hbWUiLCJwcm9wVHlwZSIsImRvYyIsIm9yaWciLCJnZXRDbGFzc1Byb3BlcnRpZXMiLCJmaWxlUGF0aCIsImNsYXNzTmFtZSIsImV4dHJhY3RNZXRob2RzQW5kUHJvcHNGcm9tTm9kZSIsIl9jb25maWdfIiwiaW50ZXJmYWNlc0luRmlsZSIsImlOb2RlIiwiY2giLCJwcm9wIiwiaU5hbWUiLCJoYXNQdWJsaWNNb2RpZmllciIsIm1vZGlmaWVycyIsInNvbWUiLCJtIiwiZ3JpZE9wc0ZpbGUiLCJncmlkT3B0aW9uc05vZGUiLCJncmlkT3BzTWVtYmVycyIsImNvbERlZkZpbGUiLCJmaWx0ZXJGaWxlIiwiYWJzdHJhY3RDb2xEZWZOb2RlIiwiY29sR3JvdXBEZWZOb2RlIiwiY29sRGVmTm9kZSIsInNyY0ZpbHRlckZpbGUiLCJmaWx0ZXJOb2RlIiwiYWRkVG9NZW1iZXJzIiwiZ3JpZEFwaUZpbGUiLCJyb3dOb2RlRmlsZSIsImlSb3dOb2RlIiwiYmFzZVJvd05vZGUiLCJncm91cFJvd05vZGUiLCJyb3dOb2RlTWVtYmVycyIsImNvbHVtbkZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBeVdnQkEsbUJBQW1CO2VBQW5CQTs7SUFnSUFDLFNBQVM7ZUFBVEE7O0lBM0NBQyxnQkFBZ0I7ZUFB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