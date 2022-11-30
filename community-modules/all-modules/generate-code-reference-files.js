const fs = require('fs');
const ts = require('typescript');
const glob = require('glob');
const gulp = require('gulp');
const prettier = require('gulp-prettier');
const { ComponentUtil } = require("@ag-grid-community/core");
const { getFormatterForTS } = require('../../scripts/formatAST');
const prettierJs = require('prettier');

const { formatNode, findNode, getJsDoc } = getFormatterForTS(ts);

const EVENT_LOOKUP = ComponentUtil.EVENT_CALLBACKS;

const VERIFY_MODE = process.argv.some(v => v === '--check');

function buildGlob(basePath) {
    const opts = { ignore: [`${basePath}/**/*.test.ts`, `${basePath}/**/*.spec.ts`] };
    return glob.sync(`${basePath}/**/*.ts`, opts);
}

// Matches the paths used in grid-packages-ag-grid-docs/dev-server.js
const INTERFACE_GLOBS = [
    ...buildGlob('../core/src/ts'),
    ...buildGlob('../../enterprise-modules/set-filter/src'),
    ...buildGlob('../../enterprise-modules/filter-tool-panel/src'),
    ...buildGlob('../../enterprise-modules/multi-filter/src'),
    ...buildGlob('../angular/projects/ag-grid-angular/src/lib'),
    ...buildGlob('../react/src/shared'),
];
const CHARTS_INTERFACE_GLOBS = [
    ...buildGlob('../../charts-packages/ag-charts-community/src'),
];

const TEST_INTERFACE_GLOBS = [
    ...buildGlob('../../grid-packages/ag-grid-docs/documentation/src/components/expandable-snippet'),
];

function findAllInNodesTree(node) {
    const kind = ts.SyntaxKind[node.kind];
    let interfaces = [];

    const interfaceNode = kind == 'InterfaceDeclaration' || kind == 'EnumDeclaration' || kind == 'TypeAliasDeclaration';
    const classNode = kind == 'ClassDeclaration' && getJsDoc(node)?.indexOf('@docsInterface') >= 0;
    if (interfaceNode || classNode) {
        interfaces.push(node);
    }
    ts.forEachChild(node, n => {
        const nodeInterfaces = findAllInNodesTree(n);
        if (nodeInterfaces.length > 0) {
            interfaces = [...interfaces, ...nodeInterfaces];
        }
    });

    return interfaces;
}

function getArgTypes(parameters, file) {
    const args = {};
    (parameters || []).forEach(p => {
        const initValue = formatNode(p.initializer, file);
        const argName = `${p.name.escapedText}${p.questionToken ? '?' : ''}`
        args[argName] = `${formatNode(p.type, file)}${initValue ? ` = ${initValue}` : ''}`;
    });
    return args;
}

function toCamelCase(value) {
    return value[0].toLowerCase() + value.substr(1);
}

function extractTypesFromNode(node, srcFile, includeQuestionMark) {
    let nodeMembers = {};
    const kind = ts.SyntaxKind[node.kind];


    let name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();
    let optional = includeQuestionMark ? node && !!node.questionToken : undefined;

    if (kind == 'PropertySignature') {

        if (node.type && node.type.parameters) {
            // sendToClipboard?: (params: SendToClipboardParams) => void;
            const methodArgs = getArgTypes(node.type.parameters, srcFile);
            returnType = formatNode(node.type.type, srcFile);
            nodeMembers[name] = {
                description: getJsDoc(node),
                type: { arguments: methodArgs, returnType, optional }
            };
        } else {
            // i.e colWidth?: number;             
            nodeMembers[name] = { description: getJsDoc(node), type: { returnType, optional } };
        }
    } else if (kind == 'MethodSignature' || kind == 'MethodDeclaration') {
        // i.e isExternalFilterPresent?(): boolean;
        // i.e doesExternalFilterPass?(node: RowNode): boolean;        
        const methodArgs = getArgTypes(node.parameters, srcFile);

        nodeMembers[name] = {
            description: getJsDoc(node),
            type: { arguments: methodArgs, returnType, optional }
        };

        if (EVENT_LOOKUP.includes(name)) {
            // Duplicate events without their prefix
            let shortName = name.substr(2);
            shortName = toCamelCase(shortName);

            nodeMembers[shortName] = { ...nodeMembers[name], meta: { isEvent: true, name } };
            nodeMembers[name] = { ...nodeMembers[name], meta: { isEvent: true, name } };
        }

    }
    return nodeMembers;
}

function parseFile(sourceFile) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

function getInterfaces(globs) {
    let interfaces = {};
    let extensions = {};
    globs.forEach(file => {
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
    const extended = typeof (child) === 'string' ? child : child.extends;
    const parents = extensions[extended];
    if (parents) {
        ancestors = [...ancestors, ...parents];
        parents.forEach(p => {
            if (p.extends === 'Omit') {
                // Omit: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
                // Special logic to handle the removing of properties via the Omit utility when a type is defined via extension.
                // e.g. export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'> { }
                p = p.params[0];
            }
            
            ancestors = [...ancestors, ...getAncestors(extensions, p)]
        })
    }
    return ancestors;
}

function isBuiltinUtilityType(type) {
    return type === 'Required' || type === 'Omit' || type === 'Pick' || type === 'Readonly' || type === 'Optional';
}

function mergeAncestorProps(isDocStyle, parent, child, getProps) {
    const props = { ...getProps(child) };
    let mergedProps = props;
    // If the parent has a generic params lets apply the child's specific types
    if (parent.params && parent.params.length > 0) {

        if (child.meta && child.meta.typeParams) {
            child.meta.typeParams.forEach((t, i) => {
                Object.entries(props).forEach(([k, v]) => { //.filter(([k, v]) => k !== 'meta')
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
                                    Object.entries(v.type.arguments).forEach(([ak, av]) => {
                                        newArgs[ak] = av.replace(re, parent.params[i])
                                    })
                                }
                                const newReturnType = v.type.returnType.replace(re, parent.params[i])
                                newValue = { ...v, type: { ...v.type, returnType: newReturnType, arguments: newArgs } }
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
};

function mergeRespectingChildOverrides(parent, child) {
    let merged = { ...child };
    // We want the child properties to be list first for better doc reading experience
    // Normal spread merge to get the correct order wipes out child overrides
    // Hence the manual approach to the merge here.
    Object.entries(parent).forEach(([k, v]) => {
        if (!merged[k]) {
            merged[k] = v;
        }
    })
    return merged;
}

function applyInheritance(extensions, interfaces, isDocStyle) {
    Object.entries(extensions).forEach(([i,]) => {

        const allAncestors = getAncestors(extensions, i);
        let extendedInterface = interfaces[i];

        // TODO: Inherited Generic types do not get passed through
        // Would need to make this tree work so that the params applied lower down  get sent up the tree and correctly applied
        // Example interface is ICellEditorComp

        allAncestors.forEach(a => {
            let extended = a.extends;

            let extInt = undefined;
            let omitFields = [];
            if (extended === 'Omit') {
                // Omit: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
                // Special logic to handle the removing of properties via the Omit utility when a type is defined via extension.
                // e.g. export interface AgNumberAxisThemeOptions extends Omit<AgNumberAxisOptions, 'type'> { }
                extended = a.params[0];
                const fullInterface = interfaces[extended];
                a.params.slice(1).forEach(toRemove => {
                    toRemove.split("|").forEach(property => {
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
                    extendedInterface = mergeRespectingChildOverrides(mergeAncestorProps(isDocStyle, a, extInt, a => a), extendedInterface);
                }
                omitFields.forEach((f) => {
                    delete extendedInterface[f];
                });
            } else {
                if (extInt && extInt.type) {
                    extendedInterface.type = mergeRespectingChildOverrides(mergeAncestorProps(isDocStyle, a, extInt, a => a.type), extendedInterface.type);
                }
                if (extInt && extInt.docs) {
                    extendedInterface.docs = mergeRespectingChildOverrides(mergeAncestorProps(isDocStyle, a, extInt, a => a.docs), extendedInterface.docs);
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
    interfaces.forEach(node => {
        const name = node && node.name && node.name.escapedText;
        const kind = ts.SyntaxKind[node.kind];

        if (node.heritageClauses) {
            node.heritageClauses.forEach(h => {
                if (h.types && h.types.length > 0) {
                    extension[name] = h.types.map(h => ({ extends: formatNode(h.expression, srcFile), params: h.typeArguments ? h.typeArguments.map(t => formatNode(t, srcFile)) : undefined }));
                }
            });
        }

        if (kind == 'EnumDeclaration') {
            iLookup[name] = {
                meta: { isEnum: true }, type: node.members.map(n => formatNode(n, srcFile)),
                docs: node.members.map(n => getJsDoc(n))
            }
        } else if (kind == 'TypeAliasDeclaration') {
            iLookup[name] = {
                meta: {
                    isTypeAlias: true,
                    typeParams: node.typeParameters ? node.typeParameters.map(tp => formatNode(tp, srcFile)) : undefined
                },
                type: formatNode(node.type, srcFile)
            }
        } else {

            let isCallSignature = false;
            let members = {};
            let docs = {};
            let callSignatureMembers = {};

            if (node.members && node.members.length > 0) {
                node.members.map(p => {
                    isCallSignature = isCallSignature || ts.SyntaxKind[p.kind] == 'CallSignature';
                    if (isCallSignature) {

                        const argTypes = getArgTypes(p.parameters, srcFile);

                        callSignatureMembers = {
                            arguments: argTypes,
                            returnType: formatNode(p.type, srcFile),
                        }
                    } else {
                        const propName = formatNode(p, srcFile, true);
                        const propType = formatNode(p.type, srcFile);
                        members[propName] = propType;
                        const doc = getJsDoc(p);
                        if (doc) {
                            docs[propName] = getJsDoc(p);
                        }
                    }

                });

                if (isCallSignature && node.members.length > 1) {
                    throw new Error('Have a callSignature interface with more than one member! We were not expecting this to be possible!');
                }
            }
            if (isCallSignature) {
                iLookup[name] = {
                    meta: { isCallSignature },
                    type: callSignatureMembers
                }
            } else {
                let meta = {};
                iLookup[name] = { meta, type: members, docs: Object.entries(docs).length > 0 ? docs : undefined }
            }

            if (node.typeParameters) {
                const orig = iLookup[name];
                iLookup[name] = { ...orig, meta: { ...orig.meta, typeParams: node.typeParameters.map(tp => formatNode(tp, srcFile)) } }
            }

            const doc = getJsDoc(node);
            if (doc) {
                const orig = iLookup[name];
                iLookup[name] = { ...orig, meta: { ...orig.meta, doc } }
            }
        }
    });
    return iLookup;
}



function getClassProperties(filePath, className) {
    const srcFile = parseFile(filePath);
    const classNode = findNode(className, srcFile, 'ClassDeclaration');

    let members = {};
    ts.forEachChild(classNode, n => {
        members = { ...members, ...extractMethodsAndPropsFromNode(n, srcFile) }
    });

    return members;
}

/** Build the interface file in the format that can be used by <interface-documentation> */
function buildInterfaceProps(globs) {

    let interfaces = {};
    let extensions = {};
    globs.forEach(file => {
        const parsedFile = parseFile(file);

        // Using this method to build the extensions lookup required to get inheritance correct
        extractInterfaces(parsedFile, extensions);

        const interfacesInFile = findAllInNodesTree(parsedFile);
        interfacesInFile.forEach(iNode => {
            let props = {};
            iNode.forEachChild(ch => {
                const prop = extractTypesFromNode(ch, parsedFile, true);
                props = { ...props, ...prop }
            })

            const kind = ts.SyntaxKind[iNode.kind];
            if (kind == 'TypeAliasDeclaration') {
                // We do not support types here but have not seen this needed in the docs yet.
            }

            if (iNode.typeParameters) {
                props = { ...props, meta: { ...props.meta, typeParams: iNode.typeParameters.map(tp => formatNode(tp, parsedFile)) } }
            }

            const iName = formatNode(iNode.name, parsedFile, true);
            interfaces[iName] = props;
        })
    });

    applyInheritance(extensions, interfaces, true);

    return interfaces;
}

function hasPublicModifier(node) {
    if (node.modifiers) {
        return node.modifiers.some(m => ts.SyntaxKind[m.kind] == 'PublicKeyword')
    }
    return false;
}

function extractMethodsAndPropsFromNode(node, srcFile) {
    let nodeMembers = {};
    const kind = ts.SyntaxKind[node.kind];
    let name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();


    if (!hasPublicModifier(node)) {
        return nodeMembers;
    }

    if (kind == 'MethodDeclaration') {
        const methodArgs = getArgTypes(node.parameters, srcFile);

        nodeMembers[name] = {
            description: getJsDoc(node),
            type: { arguments: methodArgs, returnType }
        };
    } else if (kind == 'PropertyDeclaration') {
        nodeMembers[name] = {
            description: getJsDoc(node),
            type: { returnType: returnType }
        }
    }
    return nodeMembers;
}

function writeFormattedFile(dir, filename, data) {
    const fullPath = dir + filename;

    const currentContent = fs.readFileSync(fullPath).toString('utf-8');
    const config = prettierJs.resolveConfig.sync(fullPath, {});
    const fileOptions = { ...config, filepath: fullPath };
    const newContent = prettierJs.format(JSON.stringify(data), fileOptions);

    if (VERIFY_MODE) {
        if (currentContent !== newContent) {
            console.warn(`Needs to be updated: ${fullPath}`);
            process.exit(1);
        }
    } else if (currentContent !== newContent) {
        // Only write if content changed.
        fs.writeFileSync(fullPath, JSON.stringify(data));
        gulp.src(fullPath)
            .pipe(prettier({}))
            .pipe(gulp.dest(dir))
    }
}

function getGridOptions() {
    const gridOpsFile = "../core/src/ts/entities/gridOptions.ts";
    const srcFile = parseFile(gridOpsFile);
    const gridOptionsNode = findNode('GridOptions', srcFile);

    let gridOpsMembers = {};
    ts.forEachChild(gridOptionsNode, n => {
        gridOpsMembers = { ...gridOpsMembers, ...extractTypesFromNode(n, srcFile, false) }
    });

    return gridOpsMembers;
}

function getColumnOptions() {
    const file = "../core/src/ts/entities/colDef.ts";
    const srcFile = parseFile(file);
    const abstractColDefNode = findNode('AbstractColDef', srcFile);
    const colGroupDefNode = findNode('ColGroupDef', srcFile);
    const colDefNode = findNode('ColDef', srcFile);
    const filterFile = "../core/src/ts/interfaces/iFilter.ts";
    const srcFilterFile = parseFile(filterFile);
    const filterNode = findNode('IFilterDef', srcFilterFile);

    let members = {};
    const addToMembers = (node, src) => {
        ts.forEachChild(node, n => {
            members = { ...members, ...extractTypesFromNode(n, src, false) }
        });
    }
    addToMembers(abstractColDefNode, srcFile);
    addToMembers(colGroupDefNode, srcFile);
    addToMembers(colDefNode, srcFile);
    addToMembers(filterNode, srcFilterFile);

    return members;
}

function getGridApi() {
    const gridApiFile = "../core/src/ts/gridApi.ts";
    return getClassProperties(gridApiFile, 'GridApi');
}
function getColumnApi() {
    const colApiFile = "../core/src/ts/columns/columnApi.ts";
    return getClassProperties(colApiFile, 'ColumnApi');
}
function getRowNode() {
    const file = "../core/src/ts/entities/rowNode.ts";
    return getClassProperties(file, 'RowNode');
}
function getColumn() {
    const file = "../core/src/ts/entities/column.ts";
    return getClassProperties(file, 'Column');
}

function getChartInterfaces() {
    return getInterfaces(CHARTS_INTERFACE_GLOBS);
}

function getChartInterfaceProps() {
    return buildInterfaceProps(CHARTS_INTERFACE_GLOBS);
}

const generateMetaFiles = () => {
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/grid-api/', 'grid-options.AUTO.json', getGridOptions());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/grid-api/', 'interfaces.AUTO.json', getInterfaces(INTERFACE_GLOBS));
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/grid-api/', 'grid-api.AUTO.json', getGridApi());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/row-object/', 'row-node.AUTO.json', getRowNode());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/column-properties/', 'column-options.AUTO.json', getColumnOptions());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/column-api/', 'column-api.AUTO.json', getColumnApi());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/column-object/', 'column.AUTO.json', getColumn());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/grid-api/', 'doc-interfaces.AUTO.json', buildInterfaceProps(INTERFACE_GLOBS));
    // Charts.
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-api/', 'interfaces.AUTO.json', getChartInterfaces());
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-api/', 'doc-interfaces.AUTO.json', getChartInterfaceProps());
    // Tests.
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/src/components/expandable-snippet/', 'test-interfaces.AUTO.json', getInterfaces(TEST_INTERFACE_GLOBS));
    writeFormattedFile('../../grid-packages/ag-grid-docs/documentation/src/components/expandable-snippet/', 'test-doc-interfaces.AUTO.json', buildInterfaceProps(TEST_INTERFACE_GLOBS));
};

console.log(`--------------------------------------------------------------------------------`);
console.log(`Generate docs reference files...`);
console.log('Using Typescript version: ', ts.version)

generateMetaFiles()

console.log(`Generated OK.`);
console.log(`--------------------------------------------------------------------------------`);


