import { parseScript } from 'esprima';
import { decorateWithComments } from "./commentDecorator";
import {
    createReactColDefSnippet,
    decreaseIndent,
    getName,
    getReactValue,
    isLiteralProperty,
    isProperty,
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
            let res = property.comment ? `\n${tab(depth)}//${property.comment}` : '';
            return res + `\n${tab(depth)}${getName(property)}=${getReactValue(property)}`;
        }
        const [start, end] = property.range;
        return `${this.snippet.slice(start, end)}`.replace(`${getName(property)}:`, '').trim();
    }

    parseProperty(property, depth) {
        if (isLiteralProperty(property)) {
            this.propertySnippets.push(this.extractRawProperty(property, depth));
            return '';
        }
        // special handling required for react column definitions
        if (getName(property) === 'columnDefs') {
            let res = property.comment ? `\n${tab(1)}//${property.comment}` : '';
            res += createReactColDefSnippet(property.value.elements, depth);
            return res;
        }
        let res = property.comment ? `\n${tab(depth)}//${property.comment}` : '';
        res += `\n${tab(depth)}${getName(property)}={` + this.extractRawProperty(property, depth) + '}';
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
            return decreaseIndent(result.trim());
        }
        return `<AgGridReact>${result}\n</AgGridReact>`;
    }

    addComment() {
        return ''; // react comments are added inplace
    }
}
