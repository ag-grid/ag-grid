import { parseScript } from 'esprima';
import { decorateWithComments } from "./commentDecorator";
import {
    createColDefSnippet,
    createReactColDefSnippet,
    getName,
    getReactValue,
    getValue,
    isArrayProperty,
    isLiteralProperty,
    isObjectProperty,
    tab,
} from "./snippetUtils";

export const transform = (snippet, framework, options) => {
    // create a syntax tree from the supplied snippet with comments associated to each node
    const tree = decorateWithComments(parseScript(snippet, {comment: true, loc: true}));

    return {
        'javascript': () => new JavascriptTransformer(options).transform(tree),
        'angular': () => new AngularTransformer(options).transform(tree),
        'react': () => new ReactTransformer(options).transform(tree),
        'vue': () => new VueTransformer(options).transform(tree),
    }[framework]();
}

// The SnippetTransformer is based around the 'Template Method' design pattern
class SnippetTransformer {
    initialDepth = 0;

    constructor(options) {
        this.options = options;
    }
    transform(tree) {
        return this.addFrameworkContext(this.parse(tree, this.initialDepth));
    }
    parse(tree, depth) {
        if (Array.isArray(tree)) {
            return tree.map(node => this.parse(node, depth + 1)).join('');

        } else if (isLiteralProperty(tree)) {
            return this.addComment(tree, depth) + this.parseLiteral(tree, depth);

        } else if (isArrayProperty(tree)) {
            return this.addComment(tree, depth) + this.parseArray(tree, depth);

        } else if (isObjectProperty(tree)) {
            return this.addComment(tree, depth) + this.parseObject(tree, depth);
        }
    }
}

class JavascriptTransformer extends SnippetTransformer {
    constructor(options) {
        super(options);
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

    constructor(options) {
        super(options);
        if (this.options.suppressFrameworkContext) {
            this.initialDepth--;
        }
    }
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
    addFrameworkContext(result) {
        if (this.propertySnippets.length > 0) {
            return `<AgGridReact` +
                   `${this.propertySnippets.join('')}` +
                   `\n${tab(1)}// other grid options ...\n>` +
                   `${result}\n</AgGridReact>`;
        }
        if (this.options.suppressFrameworkContext) {
            // framework context is only hidden if no properties exist for React
            return result.trim();
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
