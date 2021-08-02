let _TS_;
getTsVersion = () => _TS_;

/*
 * Convert AST node to string representation used to record type in a JSON file
 * @param {*} node 
 * @param {*} paramNameOnly - At the top level we only want the parameter name to be returned. But there are some interfaces
 * that are recursively defined, i.e HardCodedSize and so we need to return the param and type for the inner case.
 */
function formatNode(node, paramNameOnly = false) {
    const kind = getTsVersion().SyntaxKind[node.kind];
    switch (kind) {
        case 'ArrayType':
        case 'RestType':
            return formatNode(node.elementType) + '[]';
        case 'InferType':
            return node.types.map(t => formatNode(t)).join(' | ');
        case 'UnionType':
            return node.types.map(t => formatNode(t)).join(' | ');
        case 'ParenthesizedType':
            return `(${formatNode(node.type)})`;
        case 'TypeLiteral':
            return node.members.map(t => formatNode(t)).join(' ');
        case 'TypeReference':
            {
                let typeParams = undefined;
                if (node.typeArguments) {
                    typeParams = `<${node.typeArguments.map(t => formatNode(t)).join(', ')}>`;
                }
                return `${formatNode(node.typeName)}${typeParams || ''}`;
            }
        case 'IndexSignature':
            return `[${node.parameters.map(t => formatNode(t)).join(' ')}]${paramNameOnly ? '' : `: ${formatNode(node.type)}`}`;
        case 'Parameter':
            return `${formatNode(node.name)}: ${formatNode(node.type)}`;
        case 'PropertySignature':
            return `${formatNode(node.name)}${node.questionToken ? '?' : ''}`; //: ${getParamType(typeNode.type)}
        case 'FunctionType':
        case 'CallSignature':
            return `(${node.parameters.map(t => formatNode(t)).join(', ')})${paramNameOnly ? '' : ` => ${formatNode(node.type)}`}`;
        case 'Identifier':
            return node.escapedText;
        case 'ExpressionWithTypeArguments':
            return formatNode(node.expression);
        case 'LiteralType':
            return `'${node.literal.text}'`;
        case 'ConstructSignature':
            return `{ new(${node.parameters.map(t => formatNode(t)).join(', ')}): ${formatNode(node.type)} }`
        case 'ConstructorType':
            return `new(${node.parameters.map(t => formatNode(t)).join(', ')}) => ${formatNode(node.type)}`
        case 'TupleType':
            return `[${node.elementTypes.map(t => formatNode(t)).join(', ')}]`;
        case 'MethodSignature':
            return `${formatNode(node.name)}${node.questionToken ? '?' : ''}(${node.parameters.map(t => formatNode(t)).join(', ')})`
        case 'MappedType':
            return `{${formatNode(node.typeParameter)}${node.questionToken ? '?' : ''}${paramNameOnly ? '' : `: ${formatNode(node.type)}`}}`
        case 'TypeParameter':
            {
                if (node.constraint) {
                    if (ts.SyntaxKind[node.parent.kind] == 'MappedType') {
                        return `[${formatNode(node.name)} in ${formatNode(node.constraint)}]`;
                    } else {
                        return `${formatNode(node.name)} extends ${formatNode(node.constraint)}`;
                    }
                }
                return `${formatNode(node.name)}`;
            }
        case 'EnumMember':
            return `${formatNode(node.name)}${node.initializer ? ` = '${formatNode(node.initializer)}'` : ''}`;
        case 'StringLiteral':
            return `${node.text}`
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

module.exports = {

    /**
     * Pass the typescript module in to ensure consistency with calling code
     * 
     * *kind* enum numbers can changes between versions
     */
    getFormatterForTS: (ts) => {
        _TS_ = ts;
        return formatNode;
    }
};