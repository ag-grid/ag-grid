// using spaces rather than tabs for accurate test matching
export const tab = n => n > 0 ? new Array(n*4).fill(' ').join('') : '';

export const getName = node => node.key.name;
export const getReactValue = node => {
    const value = node.value.value;
    return (typeof value === 'string') ? `"${value}"` : `{${value}}`;
}

export const createReactColDefSnippet = (tree, depth) => {
    if (Array.isArray(tree)) {
        return tree.map(node => createReactColDefSnippet(node, depth)).join('');
    }
    const groupCol = tree.properties.find(n => isArrayExpr(n));
    if (groupCol) {
        const childColDefs = createReactColDefSnippet(getChildren(groupCol), depth + 1);
        const colProps = tree.properties
            .filter(property => !isArrayExpr(property))
            .map(property => `${getName(property)}=${getReactValue(property)}`);
        let r = `\n${tab(depth)}<AgGridColumn ${colProps.join('')}>`;
        r += childColDefs;
        r += `\n${tab(depth)}</AgGridColumn>`;
        return r;
    }
    const colProps = tree.properties.map(property => `${getName(property)}=${getReactValue(property)}`);
    return `\n${tab(depth)}<AgGridColumn ${colProps.join(' ')} />`;
}

// removes a tab spacing from the beginning of each line of the function body
export const decreaseIndent = functionSnippet => {
    const functionArr = functionSnippet.split('\n');
    let firstLine = functionArr.shift();
    const res = functionArr.map(line => line.substring(4));
    res.unshift(firstLine);
    return res.join('\n');
}

export const isProperty = node => node.type === 'Property';
export const isLiteralProperty = node => isProperty(node) && node.value.type === 'Literal';
export const isObjectProperty = node => isProperty(node) && node.value.type === 'ObjectExpression';

const isArrayExpr = node => node.value.type === 'ArrayExpression';
const getChildren = node => isArrayExpr(node) ? node.value.elements : node.properties;