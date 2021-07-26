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
    let parsedSyntaxTreeResults;
    const src = fs.readFileSync(sourceFile, 'utf8');
    parsedSyntaxTreeResults = ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
    return parsedSyntaxTreeResults;
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
    let interfaceNode = undefined;
    ts.forEachChild(node, n => {
        if (!interfaceNode) {
            interfaces = [...interfaces, ...findAllInterfaceInNodesTree(n)];
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


function extractTypesFromNode(node, typeLookup, eventTypeLookup, publicEventLookup) {
    const kind = ts.SyntaxKind[node.kind];
    const name = node && node.name && node.name.escapedText;
    let returnType = node && node.type && node.type.getFullText().trim();
    const getTsDoc = (node) => {
        return node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[node.jsDoc.length - 1].comment || ' ';
    };
    if (kind == 'PropertySignature') {
        if (node.type && node.type.parameters && node.type.parameters.length > 0) {
            const params = { meta: { name } };
            node.type.parameters.forEach(p => {
                const paramType = getParamType(p.type)
                params[p.name.escapedText] = paramType;
                params.meta.name = paramType;
            });
            returnType = getParamType(node.type.type);
            typeLookup[name] = {
                description: getTsDoc(node),
                type: { parameters: params, returnType }
            };
        } else {
            typeLookup[name] = { description: getTsDoc(node), type: { parameters: {}, returnType } };
        }
    } else if (kind == 'MethodSignature') {

        if (node.parameters && node.parameters.length > 0) {
            const params = { meta: { name } };
            node.parameters.forEach(p => {
                const paramType = getParamType(p.type)
                params[p.name.escapedText] = paramType;
                params.meta.name = paramType;
            });

            typeLookup[name] = {
                description: getTsDoc(node),
                type: { parameters: params, returnType }
            };
        } else {
            typeLookup[name] = { description: getTsDoc(node), type: { parameters: {}, returnType } };
        }

        if (publicEventLookup[name]) {
            const typeName = node.parameters[0].type.typeName.escapedText;
            eventTypeLookup[name] = {
                description: getTsDoc(node),
                type: typeName
            }
        }
    };
    ts.forEachChild(node, n => extractTypesFromNode(n, typeLookup, eventTypeLookup, publicEventLookup));
}


function getGridPropertiesAndEventsJs() {

    const { ComponentUtil } = require("@ag-grid-community/core");
    const filename = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    let parsedSyntaxTreeResults = parseFile(filename);
    const gridOptionsNode = findInterfaceNode('GridOptions', parsedSyntaxTreeResults);
    extractInterfaces(parsedSyntaxTreeResults);

    // Apply @Output formatting to public events that are present in this lookup
    const publicEventLookup = {};
    ComponentUtil.PUBLIC_EVENTS.forEach(e => publicEventLookup[ComponentUtil.getCallbackForEvent(e)] = true);

    let typeLookup = {};
    let eventTypeLookup = {};
    extractTypesFromNode(gridOptionsNode, typeLookup, eventTypeLookup, publicEventLookup);

    return { ...typeLookup, ...eventTypeLookup };
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
        if (node.members && node.members.length > 0) {
            node.members.map(p => {
                const name = p.name
                    ? getParamType(p.name)
                    : p.parameters
                        ? `(${p.parameters.map(t => getParamType(t)).join(', ')})`
                        : getParamType(p);

                const type = p.parameters
                    ? `(${p.parameters.map(t => getParamType(t)).join(', ')}): ${getParamType(p.type)}`
                    : getParamType(p.type)
                pp[name] = type;
            });
        }
        iLookup[name] = pp;
    });
    fs.writeFileSync('./documentation/doc-pages/grid-api/interfaces.json', JSON.stringify(iLookup));
}

