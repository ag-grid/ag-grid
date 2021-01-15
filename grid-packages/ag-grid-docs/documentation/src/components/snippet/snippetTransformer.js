export const createJsSnippet = propertyMappings => {
    let res = 'const gridOptions = {';
    res = processJsonProperties(propertyMappings, res);
    res += '\n}';
    return res;
};

export const createNgSnippet = propertyMappings => {
    let res = `<ag-grid-angular
    [columnDefs]="columnDefs"
    // other grid options ...>
</ag-grid-angular>
\n`;

    return processObjectProperties(propertyMappings, res);
};

export const createVueSnippet = propertyMappings => {
    let res = `<ag-grid-vue
    :columnDefs="columnDefs"
    // other grid options ...>
</ag-grid-vue>
\n`;

    return processObjectProperties(propertyMappings, res);
};

export const createReactSnippet = propertyMappings => {
    let res = '<AgGridReact>';
    propertyMappings.forEach(prop => {
        if (prop.name === 'columnDefs') {
            if (prop.comment) {
                res += `\n\t//${prop.comment}`;
            }

            res += createReactColDefSnippet(prop.elements, 1);
        }
    });

    res += '\n</AgGridReact>';

    return res;
}

const createReactColDefSnippet = (tree, depth) => {
    if (Array.isArray(tree)) {
        return tree.map(node => createReactColDefSnippet(node, depth)).join('');
    }

    const groupCol = tree.properties.find(n => isArrayExpr(n));
    if (groupCol) {
        const childColDefs = createReactColDefSnippet(getChildren(groupCol), depth + 1);

        const colProps = tree.properties
            .filter(property => !isArrayExpr(property))
            .map(property => `${getName(property)}='${getValue(property)}'`);

        let r = `\n${pad(depth)}<AgGridColumn ${colProps.join('')}>`;
        r += childColDefs;
        r += `\n${pad(depth)}</AgGridColumn>`

        return r;
    } else {
        const colProps = tree.properties.map(property => `${getName(property)}='${getValue(property)}'`);
        return `\n${pad(depth)}<AgGridColumn ${colProps.join(' ')} />`;
    }
};


// i.e. javascript properties
const processJsonProperties = (propertyMappings, res) => {
    propertyMappings.forEach(prop => {
        if (prop.comment) {
            res += `\n\t//${prop.comment}`;
        }

        if (prop.name === 'columnDefs') {
            res += '\n\tcolumnDefs: [' + createColDefSnippet(prop.elements, 2) + ',\n\t],';
        } else {
            res += `${prop.name}: ${prop.value},`;
        }
    });

    res += '\n\n\t// other grid options ...';
    return res;
}

// i.e. angular / vue properties
const processObjectProperties = (propertyMappings, res) => {
    propertyMappings.forEach((prop, i) => {
        if (prop.comment) {
            if (i > 0) res += `\n`;
            res += `//${prop.comment}\n`;
        }

        if (prop.name === 'columnDefs') {
            res += 'this.columnDefs: [' + createColDefSnippet(prop.elements, 1) + ',\n];';
        } else {
            res += `this.${prop.name} = ${prop.value};`;
        }
    });
    return res;
}

const createColDefSnippet = (tree, depth) => {
    if (Array.isArray(tree)) {
        return tree.map(node => createColDefSnippet(node, depth));
    }

    const isGroupCol = !!tree.properties.find(n => isArrayExpr(n));
    if (isGroupCol) {
        let r = `\n${pad(depth)}{`;
        r += tree.properties.map(property => {
            const [name, value, padding] = [getName(property), getValue(property), `\n${pad(depth + 1)}`];
            if (isArrayExpr(property)) {
                const childColDefs = createColDefSnippet(getChildren(property), depth + 2);
                return `${padding}${name}: [${childColDefs},${padding}],`;
            } else {
                return `${padding}${name}: '${value}'`;
            }
        }).join(',');
        r += `\n${pad(depth)}}`;
        return r;
    } else {
        const colProps = tree.properties.map(property => `${getName(property)}: '${getValue(property)}'`);
        return `\n${pad(depth)}{ ${colProps.join(', ')} }`;
    }
};

const getName = node => node.key.name;
const getValue = node => node.value.value;
const pad = n => new Array(n).fill('\t').join('');
const isArrayExpr = node => node.value.type === 'ArrayExpression';
const getChildren = node => isArrayExpr(node) ? node.value.elements : node.properties;
