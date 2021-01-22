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
    initialDepth = 0;

    constructor(snippet, options) {
        this.options = options;
        this.snippet = snippet;
    }

    transform() {
        // create a syntax tree from the supplied snippet
        const treeWithoutAssociatedComments = parseScript(this.snippet, {comment: true, loc: true, range: true});

        // associate comments with each node
        const tree = decorateWithComments(treeWithoutAssociatedComments);

        // parse syntax tree to produce main snippet body
        const snippetBody = this.parse(tree, this.initialDepth);

        // wrap snippet body with framework context
        return this.addFrameworkContext(snippetBody);
    }

    parse(tree, depth) {
        if (Array.isArray(tree)) {
            return tree.map(node => this.parse(node, depth + 1)).join('');
        } else if(isProperty(tree)) {
            return this.addComment(tree, depth) + this.parseProperty(tree, depth);
        } else {
            console.error('Unexpected node type in provided snippet!')
        }
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
        const [start, end] = property.range;
        if (this.options.suppressFrameworkContext) {
            return decreaseIndent(`${this.snippet.slice(start, end)}`) + ',';
        }
        return `${tab(depth)}${this.snippet.slice(start, end)},`;
    }

    addFrameworkContext(result) {
        if (this.options.suppressFrameworkContext) { return result.trim(); }
        return `const gridOptions = {${result}` +
               `\n\n${tab(1)}// other grid options here...` +
               '\n}';
    }

    addComment(property, depth) {
        return property.comment ? `\n${tab(depth)}//${property.comment}\n` : '\n';
    }
}

class AngularTransformer extends SnippetTransformer {
    // used when adding framework context
    propertiesVisited = [];

    parseProperty(property) {
        const propertyName = getName(property);
        this.propertiesVisited.push(propertyName);
        const [start, end] = property.range;
        return decreaseIndent(`${this.snippet.slice(start, end)}`)
            .replace(`${propertyName}:`, `this.${propertyName} =`) + ';';
    }

    addFrameworkContext(result) {
        if (this.options.suppressFrameworkContext) { return result.trim(); }
        const props = this.propertiesVisited.map(property => `${tab(1)}[${property}]="${property}"`).join('\n');
        return '<ag-grid-angular\n' + props +
            '\n    // other grid options ...>\n' +
            '</ag-grid-angular>\n' +
            result;
    }

    addComment(property, depth) {
        return property.comment ? `\n${tab(depth-1)}//${property.comment}\n` : '\n';
    }
}

class VueTransformer extends AngularTransformer {
    addFrameworkContext(result) {
        if (this.options.suppressFrameworkContext) { return result.trim(); }
        const props = this.propertiesVisited.map(property => `${tab(1)}[${property}]="${property}"`).join('\n');
        return '<ag-grid-vue\n' + props +
            '\n    // other grid options ...>\n' +
            '</ag-grid-vue>\n' +
            result;
    }
}

class ReactTransformer extends SnippetTransformer {
    propertySnippets = [];

    extractRawProperty(property, depth) {
        if (isLiteralProperty(property)) {
            return `\n${tab(depth)}${getName(property)}=${getReactValue(property)}`;
        }
        const [start, end] = property.range;
        return `${this.snippet.slice(start, end)}`.replace(`${getName(property)}:`, '').trim();
    }

    parseProperty(property, depth) {
        let comment = property.comment ? `\n${tab(depth)}//${property.comment}` : '';

        if (getName(property) === 'columnDefs') {
            return comment + this.createReactColDefSnippet(property.value.elements, depth);
        }
        if (isLiteralProperty(property)) {
            this.propertySnippets.push(comment + this.extractRawProperty(property, depth));
        } else {
            let res = comment + `\n${tab(depth)}${getName(property)}={` + this.extractRawProperty(property, depth) + '}';
            this.propertySnippets.push(res);
        }
        return ''; // react grid options are gathered and added later in the framework context
    }

    addFrameworkContext(result) {
        if (this.propertySnippets.length > 0) {
            return `<AgGridReact` +
                   `${this.propertySnippets.join('')}` +
                   `\n${tab(1)}// other grid options ...\n>` +
                   `${result}\n</AgGridReact>`;
        }
        if (this.options.suppressFrameworkContext) {
            // framework context is only hidden if no properties exist for React
            return decreaseIndent(result.trim());
        }
        return `<AgGridReact>${result}\n</AgGridReact>`;
    }

    addComment() {
        return ''; // react comments are added inplace
    }

    createReactColDefSnippet(tree, depth) {
        if (Array.isArray(tree)) {
            return tree.map(node => this.createReactColDefSnippet(node, depth)).join('');
        }

        const groupCol = tree.properties.find(n => getName(n) === 'children');
        if (groupCol) {
            const colProps = this.extractColumnProperties(tree.properties);
            const childColDefs = this.createReactColDefSnippet(getChildren(groupCol), depth + 1);
            return `\n${tab(depth)}<AgGridColumn ${colProps.join(' ')}>` +
                        childColDefs +
                    `\n${tab(depth)}</AgGridColumn>`;
        } else {
            const colProps = this.extractColumnProperties(tree.properties);
            return `\n${tab(depth)}<AgGridColumn ${colProps.join(' ')} />`;
        }
    }

    extractColumnProperties(properties) {
        return properties
            .filter(property => getName(property) !== 'children')
            .map(property => {
                if (isArrayExpr(property)) {
                    const [start, end] = property.range;
                    const rawValue = this.snippet.slice(start, end);
                    const value = rawValue.replace(`${getName(property)}:`, '').trim();
                    return `${getName(property)}={${value}}`;
                }
                return `${getName(property)}=${getReactValue(property)}`;
            });
    }
}


// This function associates comments with the correct node as comments returned in a separate array by 'esprima'
const decorateWithComments = tree => {
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
        } else {
            node.comment = commentsMap[node.loc.start.line - 1];
            if (isObjectProperty(node)) {
                parseTree(node.value.properties);
            }
        }
    }

    // simpler and faster to start here
    const root = tree.body[0].declarations[0].init.properties;
    parseTree(root);

    return root;
}

// removes a tab spacing from the beginning of each line after first
const decreaseIndent = codeBlock => {
    const functionArr = codeBlock.split('\n');
    let firstLine = functionArr.shift();
    const res = functionArr.map(line => line.substring(4));
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

const isProperty = node => node.type === 'Property';
const isLiteralProperty = node => isProperty(node) && node.value.type === 'Literal';
const isObjectProperty = node => isProperty(node) && node.value.type === 'ObjectExpression';
const isArrayExpr = node => node.value && node.value.type === 'ArrayExpression';
const getChildren = node => isArrayExpr(node) ? node.value.elements : node.properties;
const isVarDeclaration = node => node.type === 'VariableDeclaration' && Array.isArray(node.declarations);
