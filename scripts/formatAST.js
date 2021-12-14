const ts = require('typescript');

function findNode(interfaceName, parsedSyntaxTreeResults, kindToMatch = 'InterfaceDeclaration') {
    const interfaceNode = findInNodeTree(parsedSyntaxTreeResults, interfaceName, kindToMatch);
    if (!interfaceNode) {
        throw `Unable to locate ${kindToMatch} ${interfaceName} in AST parsed.`
    }
    return interfaceNode;
}

function findInNodeTree(node, interfaceName, kindToMatch = 'InterfaceDeclaration') {
    const kind = ts.SyntaxKind[node.kind];

    if (kind == kindToMatch && node && node.name && node.name.escapedText == interfaceName) {
        return node;
    }
    let interfaceNode = undefined;
    ts.forEachChild(node, n => {
        if (!interfaceNode) {
            interfaceNode = findInNodeTree(n, interfaceName, kindToMatch);
        }
    });

    return interfaceNode;
}

// export interface PrinterOptions {
//     removeComments?: boolean;
//     newLine?: NewLineKind;
//     omitTrailingSemicolon?: boolean;
//     noEmitHelpers?: boolean;
// }
const printer = ts.createPrinter({ removeComments: true, omitTrailingSemicolon: true });

function getJsDoc(node) {
    if (node.jsDoc) {
        const result = node.jsDoc.map(j => {
            const doc = printer.printNode(ts.EmitHint.Unspecified, j);
            return doc.replace('/**\n *', '/**').replace('@deprecated\n', '@deprecated');
        });
        return result.join('\n');
    }
};

/*
 * Convert AST node to string representation used to record type in a JSON file
 * @param {*} node 
 * @param {*} paramNameOnly - At the top level we only want the parameter name to be returned. But there are some interfaces
 * that are recursively defined, i.e HardCodedSize and so we need to return the param and type for the inner case.
 *
 * ******* Written for Typescript Version 3.6.5 ********
 */
function formatNode(node, file, paramNameOnly = false) {
    if (!node) {
        return undefined;
    }
    if (!file) {
        throw new Error('FormatNode called with a null file!')
    }
    const kind = ts.SyntaxKind[node.kind];
    switch (kind) {
        case 'IndexSignature':
            return `[${node.parameters.map(t => formatNode(t, file)).join(' ')}]${paramNameOnly ? '' : `: ${formatNode(node.type, file)}`}`;
        case 'PropertySignature':
            return `${formatNode(node.name, file)}${node.questionToken ? '?' : ''}`;
        case 'MethodSignature':
            return `${formatNode(node.name, file)}${node.questionToken ? '?' : ''}(${node.parameters.map(t => formatNode(t, file)).join(', ')})`
        case 'MappedType':
            return `{${formatNode(node.typeParameter, file)}${node.questionToken ? '?' : ''}${paramNameOnly ? '' : `: ${formatNode(node.type, file)}`}}`
        case 'TypeParameter':
            {
                if (node.constraint) {
                    if (ts.SyntaxKind[node.parent.kind] == 'MappedType') {
                        return `[${printer.printNode(ts.EmitHint.MappedTypeParameter, node, file)}]`;
                    } else {
                        return printer.printNode(ts.EmitHint.Unspecified, node, file);
                    }
                }
                return formatNode(node.name, file);
            }
        default:
            return printer.printNode(ts.EmitHint.Unspecified, node, file).replace(/(\n\s*)/g, ' ');
    }
}

module.exports = {

    /**
     * Pass the typescript module in to ensure consistency with calling code
     * 
     * *kind* enum numbers can changes between versions
     */
    getFormatterForTS: (ts1) => {
        if (ts.version !== ts1.version) {
            throw new Error(`Mismatched Typescript versions when using formatAST.js! Caller is using ${ts1.version} to parse the code while formatAST.js is using ${ts.version} to format it!`)
        }

        if (ts.version !== '3.7.7') {
            throw new Error(`formatAST.js is written for Typescript version 3.6.5! Caller is using ${ts1.version} to parse the code and formatAST.js is using ${ts.version} to format it! You must validate the outputs for the new version before updating this version.`)
        }

        return formatNode;
    },

    findNode: findNode,
    findInNodeTree: findInNodeTree,
    getJsDoc: getJsDoc

};
