import { parseScript } from 'esprima';

export const transform = (snippet, framework, options) => {
    return {
        'javascript': () => new JavascriptTransformer(snippet, options),
        'angular': () => new AngularTransformer(snippet, options),
        'react': () => new ReactTransformer(snippet, options),
        'vue': () => new VueTransformer(snippet, options),
    }[framework]().transform();
}

// The SnippetTransformer is based around the 'Template Method' design pattern
class SnippetTransformer {
    // overridden when 'options.suppressFrameworkContext = true'
    initialDepth = 0;

    // used when adding framework context
    propertiesVisited = [];

    constructor(snippet, options) {
        this.options = options;
        this.snippet = snippet;
    }

    transform() {
        let parsedSyntaxTreeResults;
        try {
            // create a syntax tree from the supplied snippet (also contains separated comments)
            parsedSyntaxTreeResults = parseScript(this.snippet, {comment: true, loc: true, range: true});
        } catch(error) {
            const errorMsg = 'To troubleshoot paste snippet here: \'https://esprima.org/demo/parse.html\'';
            return `${error}\n\n${errorMsg}\n\n${this.snippet}`;
        }

        // associate comments with each node
        const tree = addCommentsToTree(parsedSyntaxTreeResults);

        let snippetBody;
        try {
            // parse syntax tree to produce main snippet body
            snippetBody = this.parse(tree, this.initialDepth);
        } catch(error) {
            return `${error}\n\n${this.snippet}`;
        }

        // wrap snippet body with framework context
        return this.addFrameworkContext(snippetBody);
    }

    // recursively walks AST and delegates actual parsing of each node type to subclasses
    parse(tree, depth) {
        if (Array.isArray(tree)) {
            return tree.map(node => this.parse(node, depth + 1)).join('');

        } else if(isProperty(tree)) {
            return this.addComment(tree, depth) + this.parseProperty(tree, depth);

        } else if (isExprStatement(tree)) {
           return this.parseExpression(tree);

        } else if (isVarDeclarator(tree)) {
           if (isCallableExpr(tree) || isArrowFunctionExpr(tree)) {
               return this.parseExpression(tree, true);
           }
           return tree.init.properties.map(node => this.parse(node, depth + 1)).join('');

        } else if (isVarDeclaration(tree)) {
            return tree.declarations.map(n => this.parse(n, depth - 1)).join('');

        } else if (isLabelStatement(tree) || isBlockStatement(tree)) {
            throw new Error('Grid options should be wrapped inside: const gridOptions = { ... }');

        } else {
            throw new Error(`Unexpected node encountered:\n\n${JSON.stringify(tree)}`);
        }
    }

    getComment(property, depth) {
        // only add extra line between grid properties option enabled and not first property
        const extraLine = this.options.spaceBetweenProperties && this.propertiesVisited.length > 0 ? '\n' : '';
        return extraLine + (property.comment ? `\n${tab(depth)}//${property.comment}\n` : '\n');
    }
}

class JavascriptTransformer extends SnippetTransformer {
    constructor(snippet, options) {
        super(snippet, options);
        if (this.options.suppressFrameworkContext) {
            this.initialDepth--;
        }
    }

    parseProperty(property, depth) {
        // keep track of visited properties for framework context
        this.propertiesVisited.push(getName(property));

        const [start, end] = property.range;
        if (this.options.suppressFrameworkContext) {
            return decreaseIndent(`${this.snippet.slice(start, end)}`) + ',';
        }
        return `${tab(depth)}${this.snippet.slice(start, end)},`;
    }

    parseExpression(expression, variableExpression) {
        const comment = this.addComment(expression, 0);
        const exprPrefix = variableExpression ? 'const ' : '';
        const exprPostfix = variableExpression ? '; ' : '';
        const [start, end] = expression.range;
        return `\n${comment}${exprPrefix}${this.snippet.slice(start, end)}${exprPostfix}`;
    }

    addFrameworkContext(result) {
        if (this.options.suppressFrameworkContext || this.propertiesVisited.length === 0) {
            return result.trim();
        }
        return `const gridOptions = {${result}` +
               `\n\n${tab(1)}// other grid options ...` +
               '\n}';
    }

    addComment(property, depth) {
        return this.getComment(property, depth);
    }
}

class AngularTransformer extends SnippetTransformer {
    parseProperty(property) {
        // keep track of visited properties for framework context
        this.propertiesVisited.push(getName(property));

        const propertyName = getName(property);
        const [start, end] = property.range;
        return decreaseIndent(`${this.snippet.slice(start, end)}`)
            .replace(`${propertyName}:`, `this.${propertyName} =`) + ';';
    }

    parseExpression(expression, variableExpression) {
        const comment = this.addComment(expression, 0);
        const exprPrefix = variableExpression ? 'const ' : '';
        const exprPostfix = variableExpression ? '; ' : '';
        const [start, end] = expression.range;
        return `\n${comment}${exprPrefix}${this.snippet.slice(start, end)}${exprPostfix}`
            .replace('gridOptions.api', 'this.gridApi')
            .replace('gridOptions.columnApi', 'this.gridColumnApi');
    }

    addFrameworkContext(result) {
        if (this.options.suppressFrameworkContext || this.propertiesVisited.length === 0) {
            return result.trim();
        }
        const props = this.propertiesVisited.map(property => `${tab(1)}[${property}]="${property}"`).join('\n');
        return '<ag-grid-angular\n' + props +
            '\n    /* other grid options ... */>\n' +
            '</ag-grid-angular>\n' +
            result;
    }

    addComment(property) {
        return this.getComment(property);
    }
}

class VueTransformer extends AngularTransformer {
    addFrameworkContext(result) {
        if (this.options.suppressFrameworkContext || this.propertiesVisited.length === 0) {
            return result.trim();
        }
        const props = this.propertiesVisited.map(property => `${tab(1)}:${property}="${property}"`).join('\n');
        return '<ag-grid-vue\n' + props +
            '\n    /* other grid options ... */>\n' +
            '</ag-grid-vue>\n' +
            result;
    }
}

class ReactTransformer extends SnippetTransformer {
    expressionSnippet = false;
    externalisedProperties = [];
    inlineProperties = [];
    inlinePropertiesWithValues = [];

    parseProperty(property, depth) {
        const propertyName = getName(property);
        // keep track of visited properties for framework context
        this.propertiesVisited.push(getName(property));

        // only add extra line between grid properties option enabled and not first property
        const extraLine = this.options.spaceBetweenProperties && this.propertiesVisited.length > 1 ? '\n' : '';
        let comment = extraLine + (property.comment ? `//${property.comment}\n` : '');
        this.externalisedProperties.push(comment + this.extractExternalProperty(property));
        this.inlineProperties.push(`${propertyName}={${propertyName}}`);
        this.inlinePropertiesWithValues.push(`${propertyName}=${getReactValue(property)}`);

        return ''; // react grid options are gathered and added later in the framework context
    }

    parseExpression(expression, variableExpression) {
        this.expressionSnippet = true;
        const comment = this.getComment(expression, 0);
        const exprPrefix = variableExpression ? 'const ' : '';
        const exprPostfix = variableExpression ? '; ' : '';
        const [start, end] = expression.range;
        return `\n${comment}${exprPrefix}${this.snippet.slice(start, end)}${exprPostfix}`
            .replace('gridOptions.api', 'gridApi')
            .replace('gridOptions.columnApi', 'gridColumnApi');
    }

    extractExternalProperty(property) {
        const [start, end] = property.range;
        const value = decreaseIndent(`${this.snippet.slice(start, end)}`.replace(`${getName(property)}:`, '').trim());
        return `const ${getName(property)} = ${value};`;
    }

    addFrameworkContext(result) {
        const colDefs = result.length === 0 ? '' : result;
        const externalProperties = this.externalisedProperties.length > 0;
        const externalSnippet = externalProperties ? this.externalisedProperties.join('\n').trim() + '\n\n' : '';

        if (this.expressionSnippet) {
            return result.trim();
        }
        if (this.options.suppressFrameworkContext && this.propertiesVisited.length === 0) {
            // framework context is only hidden if no grid options exists (columnDefs excluded)
            return decreaseIndent(result.trim());
        }

        if (this.options.inlineReactProperties && this.inlinePropertiesWithValues.length > 0) {
            const space = this.inlinePropertiesWithValues.length > 0 ? ' ' : '';
            return `<AgGridReact${space}${this.inlinePropertiesWithValues.join(' ')}>${colDefs}\n</AgGridReact>`;
        }

        if (this.inlineProperties.length > 2) {
            return externalSnippet +
                   `<AgGridReact\n${tab(1)}${this.inlineProperties.join(`\n${tab(1)}`).trim()}\n>` +
                        `${colDefs}\n` +
                   `</AgGridReact>`;
        }

        const space = this.inlineProperties.length > 0 ? ' ' : '';
        return externalSnippet + `<AgGridReact${space}${this.inlineProperties.join(' ')}>${colDefs}</AgGridReact>`;
    }

    addComment() {
        return ''; // react comments are added inplace
    }

    extractColumnProperties(properties) {
        let fieldName = '';

        const mapColumnProperty = property => {
            const propertyName = getName(property);
            if (isLiteralProperty(property)) {
                // store field name for prefixing extracted colDef properties later
                const updateField = propertyName === 'field' || (propertyName === 'colId' && fieldName.length === 0);
                if (updateField) { fieldName = property.value.value; }

                return `${propertyName}=${getReactValue(property)}`;
            }
            return this.extractNonLiteralColumnProperty(property, fieldName, propertyName);
        }

        return properties.filter(property => getName(property) !== 'children').map(mapColumnProperty);
    }

    extractNonLiteralColumnProperty(property, fieldName, propertyName) {
        const extraLine = this.options.spaceBetweenProperties ? '\n' : '';
        let comment = extraLine + (property.comment ? `//${property.comment}\n` : '');
        const funcName = fieldName ? fieldName + capitalise(propertyName) : propertyName;
        const extracted = this.extractExternalProperty(property).replace(`const ${propertyName}`, `const ${funcName}`);
        this.externalisedProperties.push(comment + decreaseIndent(extracted, 2));
        return `${propertyName}={${funcName}}`;
    }
}

// This function associates comments with the correct node as comments returned in a separate array by 'esprima'
const addCommentsToTree = tree => {
    // store comments with locations for easy lookup
    const commentsMap = tree.comments.reduce((acc, comment) => {
        acc[comment.loc.start.line] = comment.value;
        return acc;
    }, {});

    // decorate nodes with comments
    const parseTree = node => {
        if (Array.isArray(node)) {
            node.forEach(n => parseTree(n));
        } else if (isVarDeclaration(node)) {
            node.declarations.forEach(n => parseTree(n));
        } else if (isVarDeclarator(node)) {
            node.comment = commentsMap[node.loc.start.line - 1];
            if (node.init.properties) { node.init.properties.forEach(n => parseTree(n)); }
        } else {
            node.comment = commentsMap[node.loc.start.line - 1];
            if (isObjectProperty(node)) {
                parseTree(node.value.properties);
            } else if (isArrayExpr(node)) {
                parseTree(node.value.elements);
            } else if (isObjectExpr(node)) {
                parseTree(node.properties);
            }
        }
    }

    const root = tree.body;
    parseTree(root);

    return root;
}

// removes a tab spacing from the beginning of each line after first
const decreaseIndent = (codeBlock, times = 1) => {
    const functionArr = codeBlock.split('\n');
    let firstLine = functionArr.shift();
    const res = functionArr.map(line => line.substring(4 * times));
    res.unshift(firstLine);
    return res.join('\n');
}

// using spaces rather than tabs for accurate test matching
const tab = n => n > 0 ? new Array(n*4).fill(' ').join('') : '';

const getName = node => node.key.name;
const getReactValue = node => {
    const value = node.value.value;
    return (typeof value === 'string') ? `"${value}"` : `{${value}}`;
}

const capitalise = str => str[0].toUpperCase() + str.substr(1);
const isProperty = node => node.type === 'Property';
const isLiteralProperty = node => isProperty(node) && node.value.type === 'Literal';
const isObjectProperty = node => isProperty(node) && node.value.type === 'ObjectExpression';
const isObjectExpr = node => node.type === 'ObjectExpression';
const isArrayExpr = node => node.value && node.value.type === 'ArrayExpression';
const isVarDeclaration = node => node.type === 'VariableDeclaration' && Array.isArray(node.declarations);
const isVarDeclarator = node => node.type === 'VariableDeclarator';
const isExprStatement = node => node.type === 'ExpressionStatement';
const isLabelStatement = node => node.type === 'LabeledStatement';
const isBlockStatement = node => node.type === 'BlockStatement';
const isCallableExpr = node => node.init.type === 'CallExpression';
const isArrowFunctionExpr = node => node.init.type === 'ArrowFunctionExpression';
