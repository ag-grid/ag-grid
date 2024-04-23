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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leGVjdXRvcnMvZ2VuZXJhdGUvZ2VuZXJhdGUtY29kZS1yZWZlcmVuY2UtZmlsZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgeyBFdmVudHMgfSBmcm9tICcuL19jb3BpZWRGcm9tQ29yZS9ldmVudEtleXMnO1xuaW1wb3J0IHtnZXRGb3JtYXR0ZXJGb3JUU30gZnJvbSAnLi9mb3JtYXRBU1QnO1xuXG5jb25zdCB7IGZvcm1hdE5vZGUsIGZpbmROb2RlLCBnZXRGdWxsSnNEb2MsIGdldEpzRG9jIH0gPSBnZXRGb3JtYXR0ZXJGb3JUUyh0cyk7XG5cbmZ1bmN0aW9uIGdldENhbGxiYWNrRm9yRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghZXZlbnROYW1lIHx8IGV2ZW50TmFtZS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiBldmVudE5hbWU7XG4gICAgfVxuICAgIHJldHVybiAnb24nICsgZXZlbnROYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBldmVudE5hbWUuc3Vic3RyaW5nKDEpO1xufVxuY29uc3QgRVZFTlRTID0gT2JqZWN0LnZhbHVlcyhFdmVudHMpXG5jb25zdCBFVkVOVF9MT09LVVAgPSBuZXcgU2V0KEVWRU5UUy5tYXAoZXZlbnQgPT4gZ2V0Q2FsbGJhY2tGb3JFdmVudChldmVudCkpKTtcblxuZnVuY3Rpb24gZmluZEFsbEluTm9kZXNUcmVlKG5vZGUpIHtcbiAgICBjb25zdCBraW5kID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdO1xuICAgIGxldCBpbnRlcmZhY2VzID0gW107XG5cbiAgICBjb25zdCBpbnRlcmZhY2VOb2RlID0ga2luZCA9PSAnSW50ZXJmYWNlRGVjbGFyYXRpb24nIHx8IGtpbmQgPT0gJ0VudW1EZWNsYXJhdGlvbicgfHwga2luZCA9PSAnVHlwZUFsaWFzRGVjbGFyYXRpb24nO1xuICAgIGNvbnN0IGNsYXNzTm9kZSA9IGtpbmQgPT0gJ0NsYXNzRGVjbGFyYXRpb24nICYmIGdldEZ1bGxKc0RvYyhub2RlKT8uaW5kZXhPZignQGRvY3NJbnRlcmZhY2UnKSA+PSAwO1xuICAgIGlmIChpbnRlcmZhY2VOb2RlIHx8IGNsYXNzTm9kZSkge1xuICAgICAgICBpbnRlcmZhY2VzLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCBuID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZUludGVyZmFjZXMgPSBmaW5kQWxsSW5Ob2Rlc1RyZWUobik7XG4gICAgICAgIGlmIChub2RlSW50ZXJmYWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpbnRlcmZhY2VzID0gWy4uLmludGVyZmFjZXMsIC4uLm5vZGVJbnRlcmZhY2VzXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGludGVyZmFjZXM7XG59XG5cbmZ1bmN0aW9uIGdldEFyZ1R5cGVzKHBhcmFtZXRlcnMsIGZpbGUpIHtcbiAgICBjb25zdCBhcmdzID0ge307XG4gICAgKHBhcmFtZXRlcnMgfHwgW10pLmZvckVhY2gocCA9PiB7XG4gICAgICAgIGNvbnN0IGluaXRWYWx1ZSA9IGZvcm1hdE5vZGUocC5pbml0aWFsaXplciwgZmlsZSk7XG4gICAgICAgIGNvbnN0IGFyZ05hbWUgPSBgJHtwLm5hbWUuZXNjYXBlZFRleHR9JHtwLnF1ZXN0aW9uVG9rZW4gPyAnPycgOiAnJ31gXG4gICAgICAgIGFyZ3NbYXJnTmFtZV0gPSBgJHtmb3JtYXROb2RlKHAudHlwZSwgZmlsZSl9JHtpbml0VmFsdWUgPyBgID0gJHtpbml0VmFsdWV9YCA6ICcnfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFyZ3M7XG59XG5cbmZ1bmN0aW9uIHRvQ2FtZWxDYXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlWzBdLnRvTG93ZXJDYXNlKCkgKyB2YWx1ZS5zdWJzdHJpbmcoMSk7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RUeXBlc0Zyb21Ob2RlKG5vZGUsIHNyY0ZpbGUsIGluY2x1ZGVRdWVzdGlvbk1hcmspIHtcbiAgICBsZXQgbm9kZU1lbWJlcnMgPSB7fTtcbiAgICBjb25zdCBraW5kID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdO1xuXG5cbiAgICBsZXQgbmFtZSA9IG5vZGUgJiYgbm9kZS5uYW1lICYmIG5vZGUubmFtZS5lc2NhcGVkVGV4dDtcbiAgICBsZXQgcmV0dXJuVHlwZSA9IG5vZGUgJiYgbm9kZS50eXBlICYmIG5vZGUudHlwZS5nZXRGdWxsVGV4dCgpLnRyaW0oKTtcbiAgICBsZXQgb3B0aW9uYWwgPSBpbmNsdWRlUXVlc3Rpb25NYXJrID8gbm9kZSAmJiAhIW5vZGUucXVlc3Rpb25Ub2tlbiA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChraW5kID09ICdQcm9wZXJ0eVNpZ25hdHVyZScpIHtcblxuICAgICAgICBpZiAobm9kZS50eXBlICYmIG5vZGUudHlwZS5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICAvLyBzZW5kVG9DbGlwYm9hcmQ/OiAocGFyYW1zOiBTZW5kVG9DbGlwYm9hcmRQYXJhbXMpID0+IHZvaWQ7XG4gICAgICAgICAgICBjb25zdCBtZXRob2RBcmdzID0gZ2V0QXJnVHlwZXMobm9kZS50eXBlLnBhcmFtZXRlcnMsIHNyY0ZpbGUpO1xuICAgICAgICAgICAgcmV0dXJuVHlwZSA9IGZvcm1hdE5vZGUobm9kZS50eXBlLnR5cGUsIHNyY0ZpbGUpO1xuICAgICAgICAgICAgbm9kZU1lbWJlcnNbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgbWV0YTogZ2V0SnNEb2Mobm9kZSksXG4gICAgICAgICAgICAgICAgdHlwZTogeyBhcmd1bWVudHM6IG1ldGhvZEFyZ3MsIHJldHVyblR5cGUsIG9wdGlvbmFsIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpLmUgY29sV2lkdGg/OiBudW1iZXI7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgbm9kZU1lbWJlcnNbbmFtZV0gPSB7IG1ldGE6IGdldEpzRG9jKG5vZGUpLCB0eXBlOiB7IHJldHVyblR5cGUsIG9wdGlvbmFsIH0gfTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2luZCA9PSAnTWV0aG9kU2lnbmF0dXJlJyB8fCBraW5kID09ICdNZXRob2REZWNsYXJhdGlvbicpIHtcbiAgICAgICAgLy8gaS5lIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50PygpOiBib29sZWFuO1xuICAgICAgICAvLyBpLmUgZG9lc0V4dGVybmFsRmlsdGVyUGFzcz8obm9kZTogSVJvd05vZGUpOiBib29sZWFuOyAgICAgICAgXG4gICAgICAgIGNvbnN0IG1ldGhvZEFyZ3MgPSBnZXRBcmdUeXBlcyhub2RlLnBhcmFtZXRlcnMsIHNyY0ZpbGUpO1xuXG4gICAgICAgIG5vZGVNZW1iZXJzW25hbWVdID0ge1xuICAgICAgICAgICAgbWV0YTogZ2V0SnNEb2Mobm9kZSksXG4gICAgICAgICAgICB0eXBlOiB7IGFyZ3VtZW50czogbWV0aG9kQXJncywgcmV0dXJuVHlwZSwgb3B0aW9uYWwgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFxuICAgICAgICBpZiAoRVZFTlRfTE9PS1VQLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgLy8gRHVwbGljYXRlIGV2ZW50cyB3aXRob3V0IHRoZWlyIHByZWZpeFxuICAgICAgICAgICAgbGV0IHNob3J0TmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgc2hvcnROYW1lID0gdG9DYW1lbENhc2Uoc2hvcnROYW1lKTtcblxuICAgICAgICAgICAgbm9kZU1lbWJlcnNbc2hvcnROYW1lXSA9IHsgLi4ubm9kZU1lbWJlcnNbbmFtZV0sIG1ldGE6IHsgLi4ubm9kZU1lbWJlcnNbbmFtZV0ubWV0YSwgaXNFdmVudDogdHJ1ZSwgbmFtZSB9IH07XG4gICAgICAgICAgICBub2RlTWVtYmVyc1tuYW1lXSA9IHsgLi4ubm9kZU1lbWJlcnNbbmFtZV0sIG1ldGE6IHsgLi4ubm9kZU1lbWJlcnNbbmFtZV0ubWV0YSwgaXNFdmVudDogdHJ1ZSwgbmFtZSB9IH07XG4gICAgICAgIH1cblxuICAgIH1cbiAgICByZXR1cm4gbm9kZU1lbWJlcnM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRmlsZShzb3VyY2VGaWxlKSB7XG4gICAgY29uc3Qgc3JjID0gZnMucmVhZEZpbGVTeW5jKHNvdXJjZUZpbGUsICd1dGY4Jyk7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoJ3RlbXBGaWxlLnRzJywgc3JjLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVyZmFjZXMoZ2xvYnMpIHtcbiAgICBsZXQgaW50ZXJmYWNlcyA9IHt9O1xuICAgIGxldCBleHRlbnNpb25zID0ge307XG4gICAgZ2xvYnMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRmlsZSA9IHBhcnNlRmlsZShmaWxlKTtcbiAgICAgICAgaW50ZXJmYWNlcyA9IHsgLi4uaW50ZXJmYWNlcywgLi4uZXh0cmFjdEludGVyZmFjZXMocGFyc2VkRmlsZSwgZXh0ZW5zaW9ucykgfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgcmVjb3JkZWQgYWxsIHRoZSBpbnRlcmZhY2VzIHdlIGNhbiBhcHBseSB0aGUgZXh0ZW5zaW9uIHByb3BlcnRpZXMuXG4gICAgLy8gRm9yIGV4YW1wbGUgQ2VsbFBvc2l0aW9uIGV4dGVuZHMgUm93UG9zaXRpb24gYW5kIHdlIHdhbnQgdGhlIGpzb24gdG8gYWRkIHRoZSBSb3dQb3NpdGlvbiBwcm9wZXJ0aWVzIHRvIHRoZSBDZWxsUG9zaXRpb25cbiAgICBhcHBseUluaGVyaXRhbmNlKGV4dGVuc2lvbnMsIGludGVyZmFjZXMsIGZhbHNlKTtcbiAgICByZXR1cm4gaW50ZXJmYWNlcztcbn1cblxuZnVuY3Rpb24gZ2V0QW5jZXN0b3JzKGV4dGVuc2lvbnMsIGNoaWxkKSB7XG4gICAgbGV0IGFuY2VzdG9ycyA9IFtdO1xuICAgIGNvbnN0IGV4dGVuZGVkID0gdHlwZW9mIChjaGlsZCkgPT09ICdzdHJpbmcnID8gY2hpbGQgOiBjaGlsZC5leHRlbmRzO1xuICAgIGNvbnN0IHBhcmVudHMgPSBleHRlbnNpb25zW2V4dGVuZGVkXTtcbiAgICBpZiAocGFyZW50cykge1xuICAgICAgICBhbmNlc3RvcnMgPSBbLi4uYW5jZXN0b3JzLCAuLi5wYXJlbnRzXTtcbiAgICAgICAgcGFyZW50cy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgaWYgKHAuZXh0ZW5kcyA9PT0gJ09taXQnKSB7XG4gICAgICAgICAgICAgICAgLy8gT21pdDogaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svdXRpbGl0eS10eXBlcy5odG1sI29taXR0eXBlLWtleXNcbiAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIGxvZ2ljIHRvIGhhbmRsZSB0aGUgcmVtb3Zpbmcgb2YgcHJvcGVydGllcyB2aWEgdGhlIE9taXQgdXRpbGl0eSB3aGVuIGEgdHlwZSBpcyBkZWZpbmVkIHZpYSBleHRlbnNpb24uXG4gICAgICAgICAgICAgICAgLy8gZS5nLiBleHBvcnQgaW50ZXJmYWNlIEFnTnVtYmVyQXhpc1RoZW1lT3B0aW9ucyBleHRlbmRzIE9taXQ8QWdOdW1iZXJBeGlzT3B0aW9ucywgJ3R5cGUnPiB7IH1cbiAgICAgICAgICAgICAgICBwID0gcC5wYXJhbXNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFuY2VzdG9ycyA9IFsuLi5hbmNlc3RvcnMsIC4uLmdldEFuY2VzdG9ycyhleHRlbnNpb25zLCBwKV1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIGFuY2VzdG9ycztcbn1cblxuZnVuY3Rpb24gaXNCdWlsdGluVXRpbGl0eVR5cGUodHlwZSkge1xuICAgIHJldHVybiB0eXBlID09PSAnUmVxdWlyZWQnIHx8IHR5cGUgPT09ICdPbWl0JyB8fCB0eXBlID09PSAnUGljaycgfHwgdHlwZSA9PT0gJ1JlYWRvbmx5JyB8fCB0eXBlID09PSAnT3B0aW9uYWwnO1xufVxuXG5mdW5jdGlvbiBtZXJnZUFuY2VzdG9yUHJvcHMoaXNEb2NTdHlsZSwgcGFyZW50LCBjaGlsZCwgZ2V0UHJvcHMpIHtcbiAgICBjb25zdCBwcm9wcyA9IHsgLi4uZ2V0UHJvcHMoY2hpbGQpIH07XG4gICAgbGV0IG1lcmdlZFByb3BzID0gcHJvcHM7XG4gICAgLy8gSWYgdGhlIHBhcmVudCBoYXMgYSBnZW5lcmljIHBhcmFtcyBsZXRzIGFwcGx5IHRoZSBjaGlsZCdzIHNwZWNpZmljIHR5cGVzXG4gICAgaWYgKHBhcmVudC5wYXJhbXMgJiYgcGFyZW50LnBhcmFtcy5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgaWYgKGNoaWxkLm1ldGEgJiYgY2hpbGQubWV0YS50eXBlUGFyYW1zKSB7XG4gICAgICAgICAgICBjaGlsZC5tZXRhLnR5cGVQYXJhbXMuZm9yRWFjaCgodCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHByb3BzKS5mb3JFYWNoKChbaywgdl06W3N0cmluZyxhbnldKSA9PiB7IC8vLmZpbHRlcigoW2ssIHZdKSA9PiBrICE9PSAnbWV0YScpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXJnZWRQcm9wc1trXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgZ2VuZXJpYyBwYXJhbXMuIFJlZ2V4IHRvIG1ha2Ugc3VyZSB5b3UgYXJlIG5vdCBqdXN0IHJlcGxhY2luZyBcbiAgICAgICAgICAgICAgICAgICAgLy8gcmFuZG9tIGxldHRlcnMgaW4gdmFyaWFibGUgbmFtZXMuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXAgPSBgKD88IVxcXFx3KSR7dH0oPyFcXFxcdylgO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKHJlcCwgXCJnXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3S2V5ID0gay5yZXBsYWNlKHJlLCBwYXJlbnQucGFyYW1zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRG9jU3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdBcmdzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodi50eXBlLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJncyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXModi50eXBlLmFyZ3VtZW50cykuZm9yRWFjaCgoW2FrLCBhdl06W2FueSxhbnldKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXJnc1tha10gPSBhdi5yZXBsYWNlKHJlLCBwYXJlbnQucGFyYW1zW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdSZXR1cm5UeXBlID0gdi50eXBlLnJldHVyblR5cGUucmVwbGFjZShyZSwgcGFyZW50LnBhcmFtc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUgPSB7IC4uLnYsIHR5cGU6IHsgLi4udi50eXBlLCByZXR1cm5UeXBlOiBuZXdSZXR1cm5UeXBlLCBhcmd1bWVudHM6IG5ld0FyZ3MgfSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB2LnJlcGxhY2UocmUsIHBhcmVudC5wYXJhbXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUHJvcHNbbmV3S2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzQnVpbHRpblV0aWxpdHlUeXBlKHBhcmVudC5leHRlbmRzKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYXJlbnQgaW50ZXJmYWNlICR7cGFyZW50LmV4dGVuZHN9IHRha2VzIGdlbmVyaWMgcGFyYW1zOiBbJHtwYXJlbnQucGFyYW1zLmpvaW4oKX1dIGJ1dCBjaGlsZCBkb2VzIG5vdCBoYXZlIHR5cGVQYXJhbXMuYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZFByb3BzO1xufTtcblxuZnVuY3Rpb24gbWVyZ2VSZXNwZWN0aW5nQ2hpbGRPdmVycmlkZXMocGFyZW50LCBjaGlsZCkge1xuICAgIGxldCBtZXJnZWQgPSB7IC4uLmNoaWxkIH07XG4gICAgLy8gV2Ugd2FudCB0aGUgY2hpbGQgcHJvcGVydGllcyB0byBiZSBsaXN0IGZpcnN0IGZvciBiZXR0ZXIgZG9jIHJlYWRpbmcgZXhwZXJpZW5jZVxuICAgIC8vIE5vcm1hbCBzcHJlYWQgbWVyZ2UgdG8gZ2V0IHRoZSBjb3JyZWN0IG9yZGVyIHdpcGVzIG91dCBjaGlsZCBvdmVycmlkZXNcbiAgICAvLyBIZW5jZSB0aGUgbWFudWFsIGFwcHJvYWNoIHRvIHRoZSBtZXJnZSBoZXJlLlxuICAgIE9iamVjdC5lbnRyaWVzKHBhcmVudCkuZm9yRWFjaCgoW2ssIHZdKSA9PiB7XG4gICAgICAgIGlmICghbWVyZ2VkW2tdKSB7XG4gICAgICAgICAgICBtZXJnZWRba10gPSB2O1xuICAgICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gbWVyZ2VkO1xufVxuXG5mdW5jdGlvbiBhcHBseUluaGVyaXRhbmNlKGV4dGVuc2lvbnMsIGludGVyZmFjZXMsIGlzRG9jU3R5bGUpIHtcbiAgICBPYmplY3QuZW50cmllcyhleHRlbnNpb25zKS5mb3JFYWNoKChbaSxdKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYWxsQW5jZXN0b3JzID0gZ2V0QW5jZXN0b3JzKGV4dGVuc2lvbnMsIGkpO1xuICAgICAgICBsZXQgZXh0ZW5kZWRJbnRlcmZhY2UgPSBpbnRlcmZhY2VzW2ldO1xuXG4gICAgICAgIC8vIFRPRE86IEluaGVyaXRlZCBHZW5lcmljIHR5cGVzIGRvIG5vdCBnZXQgcGFzc2VkIHRocm91Z2hcbiAgICAgICAgLy8gV291bGQgbmVlZCB0byBtYWtlIHRoaXMgdHJlZSB3b3JrIHNvIHRoYXQgdGhlIHBhcmFtcyBhcHBsaWVkIGxvd2VyIGRvd24gIGdldCBzZW50IHVwIHRoZSB0cmVlIGFuZCBjb3JyZWN0bHkgYXBwbGllZFxuICAgICAgICAvLyBFeGFtcGxlIGludGVyZmFjZSBpcyBJQ2VsbEVkaXRvckNvbXBcblxuICAgICAgICBhbGxBbmNlc3RvcnMuZm9yRWFjaChhID0+IHtcbiAgICAgICAgICAgIGxldCBleHRlbmRlZCA9IGEuZXh0ZW5kcztcblxuICAgICAgICAgICAgbGV0IGV4dEludCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGxldCBvbWl0RmllbGRzID0gW107XG4gICAgICAgICAgICBpZiAoZXh0ZW5kZWQgPT09ICdPbWl0Jykge1xuICAgICAgICAgICAgICAgIC8vIE9taXQ6IGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL3V0aWxpdHktdHlwZXMuaHRtbCNvbWl0dHlwZS1rZXlzXG4gICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBsb2dpYyB0byBoYW5kbGUgdGhlIHJlbW92aW5nIG9mIHByb3BlcnRpZXMgdmlhIHRoZSBPbWl0IHV0aWxpdHkgd2hlbiBhIHR5cGUgaXMgZGVmaW5lZCB2aWEgZXh0ZW5zaW9uLlxuICAgICAgICAgICAgICAgIC8vIGUuZy4gZXhwb3J0IGludGVyZmFjZSBBZ051bWJlckF4aXNUaGVtZU9wdGlvbnMgZXh0ZW5kcyBPbWl0PEFnTnVtYmVyQXhpc09wdGlvbnMsICd0eXBlJz4geyB9XG4gICAgICAgICAgICAgICAgZXh0ZW5kZWQgPSBhLnBhcmFtc1swXS5yZXBsYWNlKC88Lio+LywgJycpO1xuICAgICAgICAgICAgICAgIGEucGFyYW1zLnNsaWNlKDEpLmZvckVhY2godG9SZW1vdmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0b1JlbW92ZS5zcGxpdChcInxcIikuZm9yRWFjaChwcm9wZXJ0eSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlTmFtZSA9IHByb3BlcnR5LnJlcGxhY2UoLycvZywgXCJcIikudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb21pdEZpZWxkcy5wdXNoKHR5cGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzQnVpbHRpblV0aWxpdHlUeXBlKGV4dGVuZGVkKSkge1xuICAgICAgICAgICAgICAgIC8vIFJlcXVpcmVkOiBodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay91dGlsaXR5LXR5cGVzLmh0bWxcbiAgICAgICAgICAgICAgICBleHRlbmRlZCA9IGEucGFyYW1zWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXh0SW50ID0gaW50ZXJmYWNlc1tleHRlbmRlZF07XG5cbiAgICAgICAgICAgIGlmICghZXh0SW50KSB7XG4gICAgICAgICAgICAgICAgLy9DaGVjayBmb3IgdHlwZSBwYXJhbXNcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgaW50ZXJmYWNlOiAnICsgSlNPTi5zdHJpbmdpZnkoYSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNEb2NTdHlsZSkge1xuICAgICAgICAgICAgICAgIGlmIChleHRJbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kZWRJbnRlcmZhY2UgPSBtZXJnZVJlc3BlY3RpbmdDaGlsZE92ZXJyaWRlcyhtZXJnZUFuY2VzdG9yUHJvcHMoaXNEb2NTdHlsZSwgYSwgZXh0SW50LCBhID0+IGEpLCBleHRlbmRlZEludGVyZmFjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9taXRGaWVsZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZXh0ZW5kZWRJbnRlcmZhY2VbZl07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChleHRJbnQgJiYgZXh0SW50LnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kZWRJbnRlcmZhY2UudHlwZSA9IG1lcmdlUmVzcGVjdGluZ0NoaWxkT3ZlcnJpZGVzKG1lcmdlQW5jZXN0b3JQcm9wcyhpc0RvY1N0eWxlLCBhLCBleHRJbnQsIGEgPT4gYS50eXBlKSwgZXh0ZW5kZWRJbnRlcmZhY2UudHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChleHRJbnQgJiYgZXh0SW50LmRvY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kZWRJbnRlcmZhY2UuZG9jcyA9IG1lcmdlUmVzcGVjdGluZ0NoaWxkT3ZlcnJpZGVzKG1lcmdlQW5jZXN0b3JQcm9wcyhpc0RvY1N0eWxlLCBhLCBleHRJbnQsIGEgPT4gYS5kb2NzKSwgZXh0ZW5kZWRJbnRlcmZhY2UuZG9jcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9taXRGaWVsZHMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZXh0ZW5kZWRJbnRlcmZhY2UuZG9jcz8uW2ZdO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZXh0ZW5kZWRJbnRlcmZhY2UubWV0YT8uW2ZdO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZXh0ZW5kZWRJbnRlcmZhY2UudHlwZT8uW2ZdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaW50ZXJmYWNlc1tpXSA9IGV4dGVuZGVkSW50ZXJmYWNlO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0SW50ZXJmYWNlcyhzcmNGaWxlLCBleHRlbnNpb24pIHtcbiAgICBjb25zdCBpbnRlcmZhY2VzID0gZmluZEFsbEluTm9kZXNUcmVlKHNyY0ZpbGUpO1xuICAgIGNvbnN0IGlMb29rdXAgPSB7fTtcbiAgICBpbnRlcmZhY2VzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBub2RlICYmIG5vZGUubmFtZSAmJiBub2RlLm5hbWUuZXNjYXBlZFRleHQ7XG4gICAgICAgIGNvbnN0IGtpbmQgPSB0cy5TeW50YXhLaW5kW25vZGUua2luZF07XG5cbiAgICAgICAgaWYgKG5vZGUuaGVyaXRhZ2VDbGF1c2VzKSB7XG4gICAgICAgICAgICBub2RlLmhlcml0YWdlQ2xhdXNlcy5mb3JFYWNoKGggPT4ge1xuICAgICAgICAgICAgICAgIGlmIChoLnR5cGVzICYmIGgudHlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25bbmFtZV0gPSBoLnR5cGVzLm1hcChoID0+ICh7IGV4dGVuZHM6IGZvcm1hdE5vZGUoaC5leHByZXNzaW9uLCBzcmNGaWxlKSwgcGFyYW1zOiBoLnR5cGVBcmd1bWVudHMgPyBoLnR5cGVBcmd1bWVudHMubWFwKHQgPT4gZm9ybWF0Tm9kZSh0LCBzcmNGaWxlKSkgOiB1bmRlZmluZWQgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtpbmQgPT0gJ0VudW1EZWNsYXJhdGlvbicpIHtcbiAgICAgICAgICAgIGlMb29rdXBbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgbWV0YTogeyBpc0VudW06IHRydWUgfSwgdHlwZTogbm9kZS5tZW1iZXJzLm1hcChuID0+IGZvcm1hdE5vZGUobiwgc3JjRmlsZSkpLFxuICAgICAgICAgICAgICAgIGRvY3M6IG5vZGUubWVtYmVycy5tYXAobiA9PiBnZXRGdWxsSnNEb2MobikpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PSAnVHlwZUFsaWFzRGVjbGFyYXRpb24nKSB7XG4gICAgICAgICAgICBpTG9va3VwW25hbWVdID0ge1xuICAgICAgICAgICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAgICAgICAgICAgaXNUeXBlQWxpYXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVQYXJhbXM6IG5vZGUudHlwZVBhcmFtZXRlcnMgPyBub2RlLnR5cGVQYXJhbWV0ZXJzLm1hcCh0cCA9PiBmb3JtYXROb2RlKHRwLCBzcmNGaWxlKSkgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHR5cGU6IGZvcm1hdE5vZGUobm9kZS50eXBlLCBzcmNGaWxlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBsZXQgaXNDYWxsU2lnbmF0dXJlID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgbWVtYmVycyA9IHt9O1xuICAgICAgICAgICAgbGV0IGRvY3MgPSB7fTtcbiAgICAgICAgICAgIGxldCBjYWxsU2lnbmF0dXJlTWVtYmVycyA9IHt9O1xuXG4gICAgICAgICAgICBpZiAobm9kZS5tZW1iZXJzICYmIG5vZGUubWVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5tZW1iZXJzLm1hcChwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXNDYWxsU2lnbmF0dXJlID0gaXNDYWxsU2lnbmF0dXJlIHx8IHRzLlN5bnRheEtpbmRbcC5raW5kXSA9PSAnQ2FsbFNpZ25hdHVyZSc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NhbGxTaWduYXR1cmUpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJnVHlwZXMgPSBnZXRBcmdUeXBlcyhwLnBhcmFtZXRlcnMsIHNyY0ZpbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsU2lnbmF0dXJlTWVtYmVycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHM6IGFyZ1R5cGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGU6IGZvcm1hdE5vZGUocC50eXBlLCBzcmNGaWxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gZm9ybWF0Tm9kZShwLCBzcmNGaWxlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BUeXBlID0gZm9ybWF0Tm9kZShwLnR5cGUsIHNyY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1twcm9wTmFtZV0gPSBwcm9wVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvYyA9IGdldEZ1bGxKc0RvYyhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2NzW3Byb3BOYW1lXSA9IGdldEZ1bGxKc0RvYyhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNDYWxsU2lnbmF0dXJlICYmIG5vZGUubWVtYmVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGF2ZSBhIGNhbGxTaWduYXR1cmUgaW50ZXJmYWNlIHdpdGggbW9yZSB0aGFuIG9uZSBtZW1iZXIhIFdlIHdlcmUgbm90IGV4cGVjdGluZyB0aGlzIHRvIGJlIHBvc3NpYmxlIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0NhbGxTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICBpTG9va3VwW25hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICBtZXRhOiB7IGlzQ2FsbFNpZ25hdHVyZSB9LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBjYWxsU2lnbmF0dXJlTWVtYmVyc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG1ldGEgPSB7fTtcbiAgICAgICAgICAgICAgICBpTG9va3VwW25hbWVdID0geyBtZXRhLCB0eXBlOiBtZW1iZXJzLCBkb2NzOiBPYmplY3QuZW50cmllcyhkb2NzKS5sZW5ndGggPiAwID8gZG9jcyA6IHVuZGVmaW5lZCB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub2RlLnR5cGVQYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JpZyA9IGlMb29rdXBbbmFtZV07XG4gICAgICAgICAgICAgICAgaUxvb2t1cFtuYW1lXSA9IHsgLi4ub3JpZywgbWV0YTogeyAuLi5vcmlnLm1ldGEsIHR5cGVQYXJhbXM6IG5vZGUudHlwZVBhcmFtZXRlcnMubWFwKHRwID0+IGZvcm1hdE5vZGUodHAsIHNyY0ZpbGUpKSB9IH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZG9jID0gZ2V0RnVsbEpzRG9jKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWcgPSBpTG9va3VwW25hbWVdO1xuICAgICAgICAgICAgICAgIGlMb29rdXBbbmFtZV0gPSB7IC4uLm9yaWcsIG1ldGE6IHsgLi4ub3JpZy5tZXRhLCBkb2MgfSB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaUxvb2t1cDtcbn1cblxuXG5cbmZ1bmN0aW9uIGdldENsYXNzUHJvcGVydGllcyhmaWxlUGF0aCwgY2xhc3NOYW1lKSB7XG4gICAgY29uc3Qgc3JjRmlsZSA9IHBhcnNlRmlsZShmaWxlUGF0aCk7XG4gICAgY29uc3QgY2xhc3NOb2RlID0gZmluZE5vZGUoY2xhc3NOYW1lLCBzcmNGaWxlLCAnQ2xhc3NEZWNsYXJhdGlvbicpO1xuXG4gICAgbGV0IG1lbWJlcnMgPSB7fTtcbiAgICB0cy5mb3JFYWNoQ2hpbGQoY2xhc3NOb2RlLCBuID0+IHtcbiAgICAgICAgbWVtYmVycyA9IHsgLi4ubWVtYmVycywgLi4uZXh0cmFjdE1ldGhvZHNBbmRQcm9wc0Zyb21Ob2RlKG4sIHNyY0ZpbGUpIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBtZW1iZXJzO1xufVxuXG4vKiogQnVpbGQgdGhlIGludGVyZmFjZSBmaWxlIGluIHRoZSBmb3JtYXQgdGhhdCBjYW4gYmUgdXNlZCBieSA8aW50ZXJmYWNlLWRvY3VtZW50YXRpb24+ICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRJbnRlcmZhY2VQcm9wcyhnbG9icykge1xuXG4gICAgbGV0IGludGVyZmFjZXMgPSB7XG4gICAgICAgIF9jb25maWdfOiB7fSxcbiAgICB9O1xuICAgIGxldCBleHRlbnNpb25zID0ge307XG4gICAgZ2xvYnMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgICAgY29uc3QgcGFyc2VkRmlsZSA9IHBhcnNlRmlsZShmaWxlKTtcblxuICAgICAgICAvLyBVc2luZyB0aGlzIG1ldGhvZCB0byBidWlsZCB0aGUgZXh0ZW5zaW9ucyBsb29rdXAgcmVxdWlyZWQgdG8gZ2V0IGluaGVyaXRhbmNlIGNvcnJlY3RcbiAgICAgICAgZXh0cmFjdEludGVyZmFjZXMocGFyc2VkRmlsZSwgZXh0ZW5zaW9ucyk7XG5cbiAgICAgICAgY29uc3QgaW50ZXJmYWNlc0luRmlsZSA9IGZpbmRBbGxJbk5vZGVzVHJlZShwYXJzZWRGaWxlKTtcbiAgICAgICAgaW50ZXJmYWNlc0luRmlsZS5mb3JFYWNoKGlOb2RlID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9wczogYW55ID0ge307XG4gICAgICAgICAgICBpTm9kZS5mb3JFYWNoQ2hpbGQoY2ggPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb3AgPSBleHRyYWN0VHlwZXNGcm9tTm9kZShjaCwgcGFyc2VkRmlsZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcHJvcHMgPSB7IC4uLnByb3BzLCAuLi5wcm9wIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGNvbnN0IGtpbmQgPSB0cy5TeW50YXhLaW5kW2lOb2RlLmtpbmRdO1xuICAgICAgICAgICAgaWYgKGtpbmQgPT0gJ1R5cGVBbGlhc0RlY2xhcmF0aW9uJykge1xuICAgICAgICAgICAgICAgIC8vIFdlIGRvIG5vdCBzdXBwb3J0IHR5cGVzIGhlcmUgYnV0IGhhdmUgbm90IHNlZW4gdGhpcyBuZWVkZWQgaW4gdGhlIGRvY3MgeWV0LlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaU5vZGUudHlwZVBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgICBwcm9wcyA9IHsgLi4ucHJvcHMsIG1ldGE6IHsgLi4ucHJvcHMubWV0YSwgdHlwZVBhcmFtczogaU5vZGUudHlwZVBhcmFtZXRlcnMubWFwKHRwID0+IGZvcm1hdE5vZGUodHAsIHBhcnNlZEZpbGUpKSB9IH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaU5hbWUgPSBmb3JtYXROb2RlKGlOb2RlLm5hbWUsIHBhcnNlZEZpbGUsIHRydWUpO1xuICAgICAgICAgICAgaW50ZXJmYWNlc1tpTmFtZV0gPSBwcm9wcztcbiAgICAgICAgfSlcbiAgICB9KTtcblxuICAgIGFwcGx5SW5oZXJpdGFuY2UoZXh0ZW5zaW9ucywgaW50ZXJmYWNlcywgdHJ1ZSk7XG5cbiAgICByZXR1cm4gaW50ZXJmYWNlcztcbn1cblxuZnVuY3Rpb24gaGFzUHVibGljTW9kaWZpZXIobm9kZSkge1xuICAgIGlmIChub2RlLm1vZGlmaWVycykge1xuICAgICAgICByZXR1cm4gbm9kZS5tb2RpZmllcnMuc29tZShtID0+IHRzLlN5bnRheEtpbmRbbS5raW5kXSA9PSAnUHVibGljS2V5d29yZCcpXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdE1ldGhvZHNBbmRQcm9wc0Zyb21Ob2RlKG5vZGUsIHNyY0ZpbGUpIHtcbiAgICBsZXQgbm9kZU1lbWJlcnMgPSB7fTtcbiAgICBjb25zdCBraW5kID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdO1xuICAgIGxldCBuYW1lID0gbm9kZSAmJiBub2RlLm5hbWUgJiYgbm9kZS5uYW1lLmVzY2FwZWRUZXh0O1xuICAgIGxldCByZXR1cm5UeXBlID0gbm9kZSAmJiBub2RlLnR5cGUgJiYgbm9kZS50eXBlLmdldEZ1bGxUZXh0KCkudHJpbSgpO1xuXG5cbiAgICBpZiAoIWhhc1B1YmxpY01vZGlmaWVyKG5vZGUpKSB7XG4gICAgICAgIHJldHVybiBub2RlTWVtYmVycztcbiAgICB9XG5cbiAgICBpZiAoa2luZCA9PSAnTWV0aG9kRGVjbGFyYXRpb24nKSB7XG4gICAgICAgIGNvbnN0IG1ldGhvZEFyZ3MgPSBnZXRBcmdUeXBlcyhub2RlLnBhcmFtZXRlcnMsIHNyY0ZpbGUpO1xuXG4gICAgICAgIG5vZGVNZW1iZXJzW25hbWVdID0ge1xuICAgICAgICAgICAgbWV0YTogZ2V0SnNEb2Mobm9kZSksXG4gICAgICAgICAgICB0eXBlOiB7IGFyZ3VtZW50czogbWV0aG9kQXJncywgcmV0dXJuVHlwZSB9XG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChraW5kID09ICdQcm9wZXJ0eURlY2xhcmF0aW9uJykge1xuICAgICAgICBub2RlTWVtYmVyc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIG1ldGE6IGdldEpzRG9jKG5vZGUpLFxuICAgICAgICAgICAgdHlwZTogeyByZXR1cm5UeXBlOiByZXR1cm5UeXBlIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZU1lbWJlcnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcmlkT3B0aW9ucyhncmlkT3BzRmlsZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc3JjRmlsZSA9IHBhcnNlRmlsZShncmlkT3BzRmlsZSk7XG4gICAgY29uc3QgZ3JpZE9wdGlvbnNOb2RlID0gZmluZE5vZGUoJ0dyaWRPcHRpb25zJywgc3JjRmlsZSk7XG5cbiAgICBsZXQgZ3JpZE9wc01lbWJlcnMgPSB7fTtcbiAgICB0cy5mb3JFYWNoQ2hpbGQoZ3JpZE9wdGlvbnNOb2RlLCBuID0+IHtcbiAgICAgICAgZ3JpZE9wc01lbWJlcnMgPSB7IC4uLmdyaWRPcHNNZW1iZXJzLCAuLi5leHRyYWN0VHlwZXNGcm9tTm9kZShuLCBzcmNGaWxlLCBmYWxzZSkgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGdyaWRPcHNNZW1iZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sdW1uT3B0aW9ucyhjb2xEZWZGaWxlOiBzdHJpbmcsIGZpbHRlckZpbGU6IHN0cmluZykgeyAgICBcbiAgICBjb25zdCBzcmNGaWxlID0gcGFyc2VGaWxlKGNvbERlZkZpbGUpO1xuICAgIGNvbnN0IGFic3RyYWN0Q29sRGVmTm9kZSA9IGZpbmROb2RlKCdBYnN0cmFjdENvbERlZicsIHNyY0ZpbGUpO1xuICAgIGNvbnN0IGNvbEdyb3VwRGVmTm9kZSA9IGZpbmROb2RlKCdDb2xHcm91cERlZicsIHNyY0ZpbGUpO1xuICAgIGNvbnN0IGNvbERlZk5vZGUgPSBmaW5kTm9kZSgnQ29sRGVmJywgc3JjRmlsZSk7XG4gICAgY29uc3Qgc3JjRmlsdGVyRmlsZSA9IHBhcnNlRmlsZShmaWx0ZXJGaWxlKTtcbiAgICBjb25zdCBmaWx0ZXJOb2RlID0gZmluZE5vZGUoJ0lGaWx0ZXJEZWYnLCBzcmNGaWx0ZXJGaWxlKTtcblxuICAgIGxldCBtZW1iZXJzID0ge307XG4gICAgY29uc3QgYWRkVG9NZW1iZXJzID0gKG5vZGUsIHNyYykgPT4ge1xuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgbiA9PiB7XG4gICAgICAgICAgICBtZW1iZXJzID0geyAuLi5tZW1iZXJzLCAuLi5leHRyYWN0VHlwZXNGcm9tTm9kZShuLCBzcmMsIGZhbHNlKSB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhZGRUb01lbWJlcnMoYWJzdHJhY3RDb2xEZWZOb2RlLCBzcmNGaWxlKTtcbiAgICBhZGRUb01lbWJlcnMoY29sR3JvdXBEZWZOb2RlLCBzcmNGaWxlKTtcbiAgICBhZGRUb01lbWJlcnMoY29sRGVmTm9kZSwgc3JjRmlsZSk7XG4gICAgYWRkVG9NZW1iZXJzKGZpbHRlck5vZGUsIHNyY0ZpbHRlckZpbGUpO1xuXG4gICAgcmV0dXJuIG1lbWJlcnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcmlkQXBpKGdyaWRBcGlGaWxlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0Q2xhc3NQcm9wZXJ0aWVzKGdyaWRBcGlGaWxlLCAnR3JpZEFwaScpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvd05vZGUocm93Tm9kZUZpbGU6IHN0cmluZykge1xuICAgIGNvbnN0IHNyY0ZpbGUgPSBwYXJzZUZpbGUocm93Tm9kZUZpbGUpO1xuICAgIGNvbnN0IGlSb3dOb2RlID0gZmluZE5vZGUoJ0lSb3dOb2RlJywgc3JjRmlsZSk7XG4gICAgY29uc3QgYmFzZVJvd05vZGUgPSBmaW5kTm9kZSgnQmFzZVJvd05vZGUnLCBzcmNGaWxlKTtcbiAgICBjb25zdCBncm91cFJvd05vZGUgPSBmaW5kTm9kZSgnR3JvdXBSb3dOb2RlJywgc3JjRmlsZSk7XG5cbiAgICBsZXQgcm93Tm9kZU1lbWJlcnMgPSB7fTtcbiAgICBjb25zdCBhZGRUb01lbWJlcnMgPSAobm9kZSkgPT4ge1xuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgbiA9PiB7XG4gICAgICAgICAgICByb3dOb2RlTWVtYmVycyA9IHsgLi4ucm93Tm9kZU1lbWJlcnMsIC4uLmV4dHJhY3RUeXBlc0Zyb21Ob2RlKG4sIHNyY0ZpbGUsIGZhbHNlKSB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhZGRUb01lbWJlcnMoYmFzZVJvd05vZGUpO1xuICAgIGFkZFRvTWVtYmVycyhncm91cFJvd05vZGUpO1xuICAgIGFkZFRvTWVtYmVycyhpUm93Tm9kZSk7XG5cbiAgICByZXR1cm4gcm93Tm9kZU1lbWJlcnM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sdW1uKGNvbHVtbkZpbGU6IHN0cmluZykge1xuICAgIHJldHVybiBnZXRDbGFzc1Byb3BlcnRpZXMoY29sdW1uRmlsZSwgJ0NvbHVtbicpO1xufVxuXG5cblxuXG4iXSwibmFtZXMiOlsiYnVpbGRJbnRlcmZhY2VQcm9wcyIsImdldENvbHVtbiIsImdldENvbHVtbk9wdGlvbnMiLCJnZXRHcmlkQXBpIiwiZ2V0R3JpZE9wdGlvbnMiLCJnZXRJbnRlcmZhY2VzIiwiZ2V0Um93Tm9kZSIsImZvcm1hdE5vZGUiLCJmaW5kTm9kZSIsImdldEZ1bGxKc0RvYyIsImdldEpzRG9jIiwiZ2V0Rm9ybWF0dGVyRm9yVFMiLCJ0cyIsImdldENhbGxiYWNrRm9yRXZlbnQiLCJldmVudE5hbWUiLCJsZW5ndGgiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0cmluZyIsIkVWRU5UUyIsIk9iamVjdCIsInZhbHVlcyIsIkV2ZW50cyIsIkVWRU5UX0xPT0tVUCIsIlNldCIsIm1hcCIsImV2ZW50IiwiZmluZEFsbEluTm9kZXNUcmVlIiwibm9kZSIsImtpbmQiLCJTeW50YXhLaW5kIiwiaW50ZXJmYWNlcyIsImludGVyZmFjZU5vZGUiLCJjbGFzc05vZGUiLCJpbmRleE9mIiwicHVzaCIsImZvckVhY2hDaGlsZCIsIm4iLCJub2RlSW50ZXJmYWNlcyIsImdldEFyZ1R5cGVzIiwicGFyYW1ldGVycyIsImZpbGUiLCJhcmdzIiwiZm9yRWFjaCIsInAiLCJpbml0VmFsdWUiLCJpbml0aWFsaXplciIsImFyZ05hbWUiLCJuYW1lIiwiZXNjYXBlZFRleHQiLCJxdWVzdGlvblRva2VuIiwidHlwZSIsInRvQ2FtZWxDYXNlIiwidmFsdWUiLCJ0b0xvd2VyQ2FzZSIsImV4dHJhY3RUeXBlc0Zyb21Ob2RlIiwic3JjRmlsZSIsImluY2x1ZGVRdWVzdGlvbk1hcmsiLCJub2RlTWVtYmVycyIsInJldHVyblR5cGUiLCJnZXRGdWxsVGV4dCIsInRyaW0iLCJvcHRpb25hbCIsInVuZGVmaW5lZCIsIm1ldGhvZEFyZ3MiLCJtZXRhIiwiYXJndW1lbnRzIiwiaGFzIiwic2hvcnROYW1lIiwiaXNFdmVudCIsInBhcnNlRmlsZSIsInNvdXJjZUZpbGUiLCJzcmMiLCJmcyIsInJlYWRGaWxlU3luYyIsImNyZWF0ZVNvdXJjZUZpbGUiLCJTY3JpcHRUYXJnZXQiLCJMYXRlc3QiLCJnbG9icyIsImV4dGVuc2lvbnMiLCJwYXJzZWRGaWxlIiwiZXh0cmFjdEludGVyZmFjZXMiLCJhcHBseUluaGVyaXRhbmNlIiwiZ2V0QW5jZXN0b3JzIiwiY2hpbGQiLCJhbmNlc3RvcnMiLCJleHRlbmRlZCIsImV4dGVuZHMiLCJwYXJlbnRzIiwicGFyYW1zIiwiaXNCdWlsdGluVXRpbGl0eVR5cGUiLCJtZXJnZUFuY2VzdG9yUHJvcHMiLCJpc0RvY1N0eWxlIiwicGFyZW50IiwiZ2V0UHJvcHMiLCJwcm9wcyIsIm1lcmdlZFByb3BzIiwidHlwZVBhcmFtcyIsInQiLCJpIiwiZW50cmllcyIsImsiLCJ2IiwicmVwIiwicmUiLCJSZWdFeHAiLCJuZXdLZXkiLCJyZXBsYWNlIiwibmV3QXJncyIsImFrIiwiYXYiLCJuZXdSZXR1cm5UeXBlIiwibmV3VmFsdWUiLCJFcnJvciIsImpvaW4iLCJtZXJnZVJlc3BlY3RpbmdDaGlsZE92ZXJyaWRlcyIsIm1lcmdlZCIsImFsbEFuY2VzdG9ycyIsImV4dGVuZGVkSW50ZXJmYWNlIiwiYSIsImV4dEludCIsIm9taXRGaWVsZHMiLCJzbGljZSIsInRvUmVtb3ZlIiwic3BsaXQiLCJwcm9wZXJ0eSIsInR5cGVOYW1lIiwiSlNPTiIsInN0cmluZ2lmeSIsImYiLCJkb2NzIiwiZXh0ZW5zaW9uIiwiaUxvb2t1cCIsImhlcml0YWdlQ2xhdXNlcyIsImgiLCJ0eXBlcyIsImV4cHJlc3Npb24iLCJ0eXBlQXJndW1lbnRzIiwiaXNFbnVtIiwibWVtYmVycyIsImlzVHlwZUFsaWFzIiwidHlwZVBhcmFtZXRlcnMiLCJ0cCIsImlzQ2FsbFNpZ25hdHVyZSIsImNhbGxTaWduYXR1cmVNZW1iZXJzIiwiYXJnVHlwZXMiLCJwcm9wTmFtZSIsInByb3BUeXBlIiwiZG9jIiwib3JpZyIsImdldENsYXNzUHJvcGVydGllcyIsImZpbGVQYXRoIiwiY2xhc3NOYW1lIiwiZXh0cmFjdE1ldGhvZHNBbmRQcm9wc0Zyb21Ob2RlIiwiX2NvbmZpZ18iLCJpbnRlcmZhY2VzSW5GaWxlIiwiaU5vZGUiLCJjaCIsInByb3AiLCJpTmFtZSIsImhhc1B1YmxpY01vZGlmaWVyIiwibW9kaWZpZXJzIiwic29tZSIsIm0iLCJncmlkT3BzRmlsZSIsImdyaWRPcHRpb25zTm9kZSIsImdyaWRPcHNNZW1iZXJzIiwiY29sRGVmRmlsZSIsImZpbHRlckZpbGUiLCJhYnN0cmFjdENvbERlZk5vZGUiLCJjb2xHcm91cERlZk5vZGUiLCJjb2xEZWZOb2RlIiwic3JjRmlsdGVyRmlsZSIsImZpbHRlck5vZGUiLCJhZGRUb01lbWJlcnMiLCJncmlkQXBpRmlsZSIsInJvd05vZGVGaWxlIiwiaVJvd05vZGUiLCJiYXNlUm93Tm9kZSIsImdyb3VwUm93Tm9kZSIsInJvd05vZGVNZW1iZXJzIiwiY29sdW1uRmlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUF5V2dCQSxtQkFBbUI7ZUFBbkJBOztJQWdJQUMsU0FBUztlQUFUQTs7SUEzQ0FDLGdC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