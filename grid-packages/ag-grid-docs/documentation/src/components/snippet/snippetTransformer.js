import { parseScript } from 'esprima';
import { decorateWithComments } from "./commentDecorator";
import {
    createColDefSnippet,
    createReactColDefSnippet,
    getName,
    getReactValue,
    getValue,
    isArrayProperty,
    isArrowFunctionProperty,
    isLiteralProperty,
    isObjectExpr,
    isObjectProperty,
    descIndent,
    tab,
} from "./snippetUtils";

export const transform = (snippet, framework, options) => {
    return {
        'javascript': () => new JavascriptTransformer(snippet, options).transform(),
        'angular': () => new AngularTransformer(snippet, options).transform(),
        'react': () => new ReactTransformer(snippet, options).transform(),
        'vue': () => new VueTransformer(snippet, options).transform(),
    }[framework]();
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

        } else if (isLiteralProperty(tree)) {
            return this.addComment(tree, depth) + this.parseLiteral(tree, depth);

        } else if (isArrayProperty(tree)) {
            return this.addComment(tree, depth) + this.parseArray(tree, depth);
        }
        if (isObjectProperty(tree)) {
            return this.addComment(tree, depth) + this.parseObject(tree, depth);
        }
        if (isObjectExpr(tree)) {
            return this.addComment(tree, depth) + this.parseObjectExpr(tree, depth);
        }
        if (isArrowFunctionProperty(tree)) {
            return this.addComment(tree, depth) + this.parseArrowFunction(tree, depth);
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

    parseLiteral(property, depth) {
        return `${tab(depth)}${getName(property)}: ${getValue(property)},`;
    }

    parseArray(property, depth) {
        if (getName(property) === 'columnDefs') {
            let res = `${tab(depth)}${getName(property)}: [`;
            res += createColDefSnippet(property.value.elements, depth + 1);
            res += `,\n${tab(depth)}],`;
            return res;
        }
        console.error("Not yet implemented!");
    }
    parseObject(property, depth) {
        let res = `${tab(depth)}${getName(property)}: {`;
        res += property.value.properties.map(prop => this.parse(prop, depth + 1)).join('');
        res += `\n${tab(depth)}},`;
        return res;
    }

    parseObjectExpr(tree, depth) {
        const colProps = tree.properties.map(property => this.parse(property, depth));
        return `${tab(depth)}{ ${colProps.join(', ')} }`;
    }

    parseArrowFunction(property, depth) {
        const [start, end] = property.range;
        if (this.options.suppressFrameworkContext) {
            return descIndent(`${this.snippet.slice(start, end)}`) + ',';
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

    parseLiteral(property, depth) {
        if (depth > 1) {
            // don't include nested object properties
            return `${tab(depth - 1)}${getName(property)}: ${getValue(property)},`;
        }
        this.propertiesVisited.push(getName(property));
        return `this.${getName(property)} = ${getValue(property)};`;
    }

    parseArray(property, depth) {
        this.propertiesVisited.push(getName(property));
        if (getName(property) === 'columnDefs') {
            return `this.${getName(property)}: [` + createColDefSnippet(property.value.elements, depth) + ',\n];';
        }
        console.error("Not yet implemented!");
    }

    parseObject(property, depth) {
        this.propertiesVisited.push(getName(property));
        const properties = property.value.properties.map(prop => this.parse(prop, depth + 1)).join('');
        return `this.${getName(property)}: {` + properties + '\n};';
    }

    parseObjectExpr(tree, depth) {
        return tree.properties.map(node => this.parse(node)).join('');
    }

    parseArrowFunction(property) {
        const propertyName = getName(property);
        this.propertiesVisited.push(propertyName);
        const [start, end] = property.range;
        return descIndent(`${this.snippet.slice(start, end)}`)
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

    parseLiteral(property, depth) {
        this.propertySnippets.push(this.createLiteralSnippet(property, depth));
        return '';
    }

    parseArray(property, depth) {
        if (getName(property) === 'columnDefs') {
            let res = property.comment ? `\n${tab(1)}//${property.comment}` : '';
            res += createReactColDefSnippet(property.value.elements, depth);
            return res;
        }
        console.error("Not yet implemented!");
    }

    parseObject(property, depth) {
        let res = property.comment ? `\n${tab(depth)}//${property.comment}` : '';
        res += `\n${tab(depth)}${getName(property)}: {`;
        res += property.value.properties.map(prop => this.createLiteralSnippet(prop, depth + 1)).join(',');
        res += `\n${tab(depth)}},`;
        this.propertySnippets.push(res);
        return '';
    }

    parseObjectExpr(tree, depth) {
        return tree.properties.map(node => this.parse(node)).join('');
    }

    parseArrowFunction(property) {
        const [start, end] = property.range;
        const functionSnippet = `${this.snippet.slice(start, end)}`;
        const res = functionSnippet.replace(`${getName(property)}: `, `\n${tab(1)}${getName(property)}={`) + '}';
        this.propertySnippets.push(res);
        return '';
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
            return descIndent(result.trim());
        }
        return `<AgGridReact>${result}\n</AgGridReact>`;
    }

    addComment() {
        return ''; // react comments added inplace
    }

    createLiteralSnippet(property, depth) {
        let res = property.comment ? `\n${tab(depth)}//${property.comment}` : '';
        return res + `\n${tab(depth)}${getName(property)}=${getReactValue(property)}`;
    }
}
