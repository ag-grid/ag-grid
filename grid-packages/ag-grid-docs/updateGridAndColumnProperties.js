const fs = require('fs');
const ts = require('typescript');

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

function parseFile(sourceFile) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
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

function findAllInterfaceInNodesTree(node) {
    const kind = ts.SyntaxKind[node.kind];
    let interfaces = [];
    if (kind == 'InterfaceDeclaration') {
        interfaces.push(node);
    }
    ts.forEachChild(node, n => {
        const nodeInterfaces = findAllInterfaceInNodesTree(n);
        if (nodeInterfaces.length > 0) {
            interfaces = [...interfaces, ...nodeInterfaces];
        }
    });

    return interfaces;
}

function getParamType(typeNode) {
    const kind = ts.SyntaxKind[typeNode.kind];
    switch (kind) {
        case 'ArrayType':
            return getParamType(typeNode.elementType) + '[]';
        case 'UnionType':
            return typeNode.types.map(t => getParamType(t)).join(' | ');
        case 'ParenthesizedType':
            return `(${getParamType(typeNode.type)})`;
        case 'TypeLiteral':
            return typeNode.members.map(t => getParamType(t)).join(' ');
        case 'TypeReference':
            {
                let typeParams = undefined;
                if (typeNode.typeArguments) {
                    typeParams = `<${typeNode.typeArguments.map(t => getParamType(t)).join(', ')}>`;
                }
                return `${getParamType(typeNode.typeName)}${typeParams || ''}`;
            }
        case 'IndexSignature':
            return `{ [${typeNode.parameters.map(t => getParamType(t)).join(' ')}] : ${getParamType(typeNode.type)} }`;
        case 'Parameter':
            return `${getParamType(typeNode.name)}: ${getParamType(typeNode.type)}`;
        case 'PropertySignature':
            return `{ ${getParamType(typeNode.name)} : ${getParamType(typeNode.type)} }`;
        case 'FunctionType':
        case 'CallSignature':
            return `(${typeNode.parameters.map(t => getParamType(t)).join(', ')}) => ${getParamType(typeNode.type)}`;
        case 'Identifier':
            return typeNode.escapedText;
        default:
            if (typeNode.typeName) {
                return typeNode.typeName.escapedText
            }
            if (kind.endsWith('Keyword')) {
                return kind.replace('Keyword', '').toLowerCase();
            };
            return kind;
    }
}


function extractTypesFromNode(node, iLookups, publicEventLookup) {
    let result = {};
    const kind = ts.SyntaxKind[node.kind];
    const name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();
    const getTsDoc = (node) => {
        return node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[node.jsDoc.length - 1].comment || ' ';
    };
    if (kind == 'PropertySignature') {

        const interface = iLookups[returnType];
        if (interface && interface.meta && interface.meta.isCallSignature) {
            const params = { ...interface };
            delete params.meta;
            result[name] = {
                description: getTsDoc(node),
                type: { parameters: params, returnType: interface.meta.returnType }
            };
        } else if (node.type && node.type.parameters) { //&& node.type.parameters.length > 0
            const params = { meta: { name } };
            node.type.parameters.forEach(p => {
                const paramType = getParamType(p.type)
                params[p.name.escapedText] = paramType;
                params.meta.name = paramType;
            });
            returnType = getParamType(node.type.type);
            result[name] = {
                description: getTsDoc(node),
                type: { parameters: params, returnType }
            };
        } else {
            result[name] = { description: getTsDoc(node), type: { returnType } };
        }
    } else if (kind == 'MethodSignature') {

        if (node.parameters && node.parameters.length > 0) {
            const params = { meta: { name } };
            node.parameters.forEach(p => {
                const paramType = getParamType(p.type)
                params[p.name.escapedText] = paramType;
                params.meta.name = paramType;
            });

            result[name] = {
                description: getTsDoc(node),
                type: { parameters: params, returnType }
            };
        } else {
            result[name] = { description: getTsDoc(node), type: { parameters: {}, returnType } };
        }
    };
    ts.forEachChild(node, n => {
        result = { ...result, ...extractTypesFromNode(n, iLookups, publicEventLookup) }
    });

    return result;
}


function getGridPropertiesAndEventsJs() {

    const { ComponentUtil } = require("@ag-grid-community/core");
    const gridOpsFile = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    const gridOptionsNode = findInterfaceNode('GridOptions', parseFile(gridOpsFile));

    const interfaceFiles = [gridOpsFile, "../../community-modules/core/src/ts/interfaces/exportParams.ts"]
    let iLookups = {};
    interfaceFiles.forEach(file => {
        const parsedFile = parseFile(file);
        iLookups = { ...iLookups, ...extractInterfaces(parsedFile) };
    });
    fs.writeFileSync('./documentation/doc-pages/grid-api/interfaces.json', JSON.stringify(iLookups));


    // Apply @Output formatting to public events that are present in this lookup
    const publicEventLookup = {};
    ComponentUtil.PUBLIC_EVENTS.forEach(e => publicEventLookup[ComponentUtil.getCallbackForEvent(e)] = true);

    return extractTypesFromNode(gridOptionsNode, iLookups, publicEventLookup);
}


const updateGridProperties = (resolve, getGridPropertiesAndEvents) => {
    const gridPropertiesAndEvents = getGridPropertiesAndEvents();
    fs.writeFileSync('./documentation/doc-pages/grid-api/grid-options.json',
        JSON.stringify(gridPropertiesAndEvents));

};


module.exports = {
    updatePropertiesBuilt: (cb) => {
        const gridPromise = new Promise(resolve => updateGridProperties(resolve, getGridPropertiesAndEventsJs));

        if (cb) {
            Promise.all([gridPromise]).then(() => cb());
        }
    }
};
function extractInterfaces(parsedSyntaxTreeResults) {
    const interfaces = findAllInterfaceInNodesTree(parsedSyntaxTreeResults);
    const iLookup = {};
    interfaces.forEach(node => {
        const name = node && node.name && node.name.escapedText;
        let pp = {};
        let isCallSignature = false;
        if (node.members && node.members.length > 0) {            
            node.members.map(p => {
                isCallSignature = p.kind == 161;

                if (isCallSignature) {
                    p.parameters.forEach(p => pp[getParamType(p.name)] = getParamType(p.type))
                    pp.meta = { returnType: getParamType(p.type), isCallSignature };
                } else {

                    const name = p.name
                        ? getParamType(p.name)
                        : p.parameters
                            ? `(${p.parameters.map(t => getParamType(t)).join(', ')})`
                            : getParamType(p);

                    // const type = p.parameters && !p.name
                    //     ? `(${p.parameters.map(t => getParamType(t)).join(', ')}): ${getParamType(p.type)}`
                    //     : getParamType(p.type)
                    const type = getParamType(p.type)
                    pp[name] = type;
                }

            });
        }
        iLookup[name] = pp;
    });
    return iLookup;
}

