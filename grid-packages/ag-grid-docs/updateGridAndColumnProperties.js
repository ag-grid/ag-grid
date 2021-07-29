const fs = require('fs');
const ts = require('typescript');
const glob = require('glob');
const gulp = require('gulp');
const prettier = require('gulp-prettier');

// satisfy ag-grid HTMLElement dependencies
HTMLElement = typeof HTMLElement === 'undefined' ? function () {
} : HTMLElement;
HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function () {
} : HTMLSelectElement;
HTMLInputElement = typeof HTMLInputElement === 'undefined' ? function () {
} : HTMLInputElement;
HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? function () {
} : HTMLButtonElement;
MouseEvent = typeof MouseEvent === 'undefined' ? function () {
} : MouseEvent;


function findInterfaceNode(interfaceName, parsedSyntaxTreeResults) {
    const interfaceNode = findInterfaceInNodeTree(parsedSyntaxTreeResults, interfaceName);
    if (!interfaceNode) {
        throw `Unable to locate interface '${interfaceName}' in AST parsed from: ${sourceFile}.`
    }
    return interfaceNode;
}

function findInterfaceInNodeTree(node, interfaceName) {
    const kind = ts.SyntaxKind[node.kind];

    if (kind == 'InterfaceDeclaration' && node && node.name && node.name.escapedText == interfaceName) {
        return node;
    }
    let interfaceNode = undefined;
    ts.forEachChild(node, n => {
        if (!interfaceNode) {
            interfaceNode = findInterfaceInNodeTree(n, interfaceName);
        }
    });

    return interfaceNode;
}

function findAllInterfacesInNodesTree(node) {
    const kind = ts.SyntaxKind[node.kind];
    let interfaces = [];
    if (kind == 'InterfaceDeclaration') {
        interfaces.push(node);
    }
    ts.forEachChild(node, n => {
        const nodeInterfaces = findAllInterfacesInNodesTree(n);
        if (nodeInterfaces.length > 0) {
            interfaces = [...interfaces, ...nodeInterfaces];
        }
    });

    return interfaces;
}

/*
 * Convert AST node to string representation used to record type in a JSON file
 * @param {*} node 
 * @param {*} paramNameOnly - At the top level we only want the parameter name to be returned. But there are some interfaces
 * that are recursively defined, i.e HardCodedSize and so we need to return the param and type for the inner case.
 */
function getParamType(node, paramNameOnly = false) {
    const kind = ts.SyntaxKind[node.kind];
    switch (kind) {
        case 'ArrayType':
            return getParamType(node.elementType) + '[]';
        case 'UnionType':
            return node.types.map(t => getParamType(t)).join(' | ');
        case 'ParenthesizedType':
            return `(${getParamType(node.type)})`;
        case 'TypeLiteral':
            return node.members.map(t => getParamType(t)).join(' ');
        case 'TypeReference':
            {
                let typeParams = undefined;
                if (node.typeArguments) {
                    typeParams = `<${node.typeArguments.map(t => getParamType(t)).join(', ')}>`;
                }
                return `${getParamType(node.typeName)}${typeParams || ''}`;
            }
        case 'IndexSignature':
            return `[${node.parameters.map(t => getParamType(t)).join(' ')}]${paramNameOnly ? '' : `: ${getParamType(node.type)}`}`;  
        case 'Parameter':
            return `${getParamType(node.name)}: ${getParamType(node.type)}`;
        case 'PropertySignature':
            return `${getParamType(node.name)}${node.questionToken ? '?' : ''}`; //: ${getParamType(typeNode.type)}
        case 'FunctionType':
        case 'CallSignature':
            return `(${node.parameters.map(t => getParamType(t)).join(', ')})${paramNameOnly ? '' : ` => ${getParamType(node.type)}`}`;
        case 'Identifier':
            return node.escapedText;
        case 'ExpressionWithTypeArguments':
            return getParamType(node.expression);
        case 'LiteralType':
            return `'${node.literal.text}'`;
        case 'ConstructSignature':
            return `{ new(${node.parameters.map(t => getParamType(t)).join(', ')}): ${getParamType(node.type)} }`
        case 'ConstructorType':
            return `new(${node.parameters.map(t => getParamType(t)).join(', ')}) => ${getParamType(node.type)}`
        case 'TupleType':
            return `[${node.elementTypes.map(t => getParamType(t)).join(', ')}]`;
        case 'MethodSignature':
            return `${getParamType(node.name)}${node.questionToken ? '?' : ''}(${node.parameters.map(t => getParamType(t)).join(', ')})`
        case 'MappedType':
            return `{${getParamType(node.typeParameter)}${node.questionToken ? '?' : ''}${paramNameOnly ? '' : `: ${getParamType(node.type)}`}}`
        case 'TypeParameter':
            return `[${getParamType(node.name)} in ${getParamType(node.constraint)}]`
        default:
            if (node.typeName) {
                return node.typeName.escapedText
            }
            if (kind.endsWith('Keyword')) {
                return kind.replace('Keyword', '').toLowerCase();
            };

            throw new Error(`We encountered a SyntaxKind of ${kind} that we do not know how to parse. Please add support to the switch statement.`)
    }
}


function getTsDoc(node) {
    return node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[node.jsDoc.length - 1].comment || ' ';
};

function getArgTypes(parameters) {
    const args = {};
    (parameters || []).forEach(p => {
        args[p.name.escapedText] = getParamType(p.type);
    });
    return args;
}

function extractTypesFromNode(node) {
    let nodeMembers = {};
    const kind = ts.SyntaxKind[node.kind];
    const name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();

    if (kind == 'PropertySignature') {

        if (node.type && node.type.parameters) {
            // sendToClipboard?: (params: SendToClipboardParams) => void;
            const methodArgs = getArgTypes(node.type.parameters);
            returnType = getParamType(node.type.type);
            nodeMembers[name] = {
                description: getTsDoc(node),
                type: { arguments: methodArgs, returnType }
            };
        } else {
            // i.e colWidth?: number; 
            nodeMembers[name] = { description: getTsDoc(node), type: { returnType } };
        }
    } else if (kind == 'MethodSignature') {
        // i.e isExternalFilterPresent?(): boolean;
        // i.e doesExternalFilterPass?(node: RowNode): boolean;        
        const methodArgs = getArgTypes(node.parameters);
        nodeMembers[name] = {
            description: getTsDoc(node),
            type: { arguments: methodArgs, returnType }
        };
    }
    return nodeMembers;
}

function parseFile(sourceFile) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

function getInterfaces() {
    const interfaceFiles = glob.sync('../../community-modules/core/src/ts/**/*.ts');

    let interfaces = {};
    let extensions = {};
    interfaceFiles.forEach(file => {
        const parsedFile = parseFile(file);
        interfaces = { ...interfaces, ...extractInterfaces(parsedFile, extensions) };
    });

    // Now that we have recorded all the interfaces we can apply the extension properties.
    // For example CellPosition extends RowPosition and we want the json to add the RowPosition properties to the CellPosition
    Object.entries(extensions).forEach(([i, exts]) => {
        const extendedInterface = exts.map(e => interfaces[e]).reduce((acc, c) => ({ ...acc, ...c }), interfaces[i]);
        interfaces[i] = extendedInterface;
    })
    return interfaces;
}

function getGridOptions() {
    const gridOpsFile = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    const gridOptionsNode = findInterfaceNode('GridOptions', parseFile(gridOpsFile));

    let gridOpsMembers = {};
    ts.forEachChild(gridOptionsNode, n => {
        gridOpsMembers = { ...gridOpsMembers, ...extractTypesFromNode(n) }
    });

    return gridOpsMembers;
}

function writeFormattedFile(dir, filename, data) {
    const fullPath = dir + filename;
    fs.writeFileSync(fullPath, JSON.stringify(data));
    gulp.src(fullPath)
        .pipe(prettier({}))
        .pipe(gulp.dest(dir))
}

function extractInterfaces(parsedSyntaxTreeResults, extension) {
    const interfaces = findAllInterfacesInNodesTree(parsedSyntaxTreeResults);
    const iLookup = {};
    interfaces.forEach(node => {
        const name = node && node.name && node.name.escapedText;
        let members = {};

        if (node.heritageClauses && node.heritageClauses) {
            node.heritageClauses.forEach(h => {
                if (h.types && h.types.length > 0) {
                    extension[name] = h.types.map(h => getParamType(h));
                }
            });
        }

        if (node.members && node.members.length > 0) {
            node.members.map(p => {
                const name = getParamType(p, true);
                const type = getParamType(p.type);
                members[name] = type;
            });
        }
        iLookup[name] = members;
    });
    return iLookup;
}

const generateMetaFiles = (resolve, getGridOptions) => {
    writeFormattedFile('./documentation/doc-pages/grid-api/', 'grid-options.json', getGridOptions());
    writeFormattedFile('./documentation/doc-pages/grid-api/', 'interfaces.json', getInterfaces());
};


module.exports = {
    updatePropertiesBuilt: (cb) => {
        const gridPromise = new Promise(resolve => generateMetaFiles(resolve, getGridOptions));

        if (cb) {
            Promise.all([gridPromise]).then(() => cb());
        }
    }
};

