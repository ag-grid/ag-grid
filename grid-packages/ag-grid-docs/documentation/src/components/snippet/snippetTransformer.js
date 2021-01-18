import {
    createColDefSnippet,
    createReactColDefSnippet,
    getName,
    getValue,
    getReactValue,
    isArrayProperty,
    isLiteralProperty,
    isObjectProperty,
    tab,
} from "./snippetUtils";

export const transform = (framework, tree) => {
    return framework === 'angular' ? new AngularTransformer().transform(tree) :
        framework === 'react' ? new ReactTransformer().transform(tree) :
            framework === 'vue' ? new VueTransformer().transform(tree) :
                new JavascriptTransformer().transform(tree);
}

// The SnippetTransformer is based around the 'Template Method' design pattern
class SnippetTransformer {
    transform(tree) {
        return this.addFrameworkContext(this.parse(tree, 0));
    }

    parse(tree, depth) {
        if (Array.isArray(tree)) {
            return tree.map(node => this.parse(node, depth + 1)).join('');
        } else if (isLiteralProperty(tree)) {
            return this.addComment(tree) + this.parseLiteral(tree, depth);

        } else if (isArrayProperty(tree)) {
            return this.addComment(tree) + this.parseArray(tree, depth);

        } else if (isObjectProperty(tree)) {
            return this.addComment(tree) + this.parseObject(tree, depth);
        }
    }
}

class JavascriptTransformer extends SnippetTransformer {
    parseLiteral(property, depth) {
        return `${tab(depth)}${getName(property)}: ${getValue(property)},`;
    }
    parseArray(property, depth) {
        if (getName(property) === 'columnDefs') {
            let res = `${tab(depth)}columnDefs: [`;
            res += createColDefSnippet(property.value.elements, 2);
            res += `,\n${tab(depth)}],`;
            return res;
        } else {
            throw Error("Not yet implemented!");
        }
    }
    parseObject(property, depth) {
        let res = `${tab(depth)}${getName(property)}: {`;
        res += property.value.properties.map(prop => this.parse(prop, depth + 1)).join('');
        res += `\n${tab(depth)}},`;
        return res;
    }
    addFrameworkContext(result) {
        return `const gridOptions = {${result}\n}`;
    }
    addComment(property) {
        return property.comment ? `\n${tab(1)}//${property.comment}\n` : '\n';
    }
}

class AngularTransformer extends SnippetTransformer {
    // used when adding framework context
    propertiesVisited = [];

    parseLiteral(property, depth) {
        if (depth > 1) {
            // don't include nested object properties
            return `${tab(depth - 1)}${getName(property)}: ${getValue(property)},`;
        } else {
            this.propertiesVisited.push(getName(property));
            return `this.${getName(property)} = ${getValue(property)};`;
        }
    }
    parseArray(property, depth) {
        this.propertiesVisited.push(getName(property));
        if (getName(property) === 'columnDefs') {
            return `this.${getName(property)}: [` + createColDefSnippet(property.value.elements, depth) + ',\n];';
        } else {
            console.error("Not yet implemented!");
        }
    }
    parseObject(property, depth) {
        this.propertiesVisited.push(getName(property));
        const properties = property.value.properties.map(prop => this.parse(prop, depth + 1)).join('');
        return `this.${getName(property)}: {` + properties + '\n};';
    }
    addFrameworkContext(result) {
        const props = this.propertiesVisited.map(property => `${tab(1)}[${property}]="${property}"`).join('\n');
        return '<ag-grid-angular\n' + props +
            '\n    // other grid options ...>\n' +
            '</ag-grid-angular>\n' +
            result;
    }
    addComment(property) {
        return property.comment ? `\n//${property.comment}\n` : '\n';
    }
}

class VueTransformer extends AngularTransformer {
    addFrameworkContext(result) {
        const props = this.propertiesVisited.map(property => `${tab(1)}:${property}="${property}"`).join('\n');
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
            let res = property.comment ? `\n\t//${property.comment}` : '';
            res += createReactColDefSnippet(property.value.elements, depth);
            return res;
        } else {
            console.error("Not yet implemented!");
        }
    }
    parseObject(property, depth) {
        let res = property.comment ? `\n\t//${property.comment}` : '';
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
        } else {
            return `<AgGridReact>${result}\n</AgGridReact>`;
        }
    }
    addComment() {
        return ''; // react comments added inplace
    }

    createLiteralSnippet(property, depth) {
        let res = property.comment ? `\n\t//${property.comment}` : '';
        return res + `\n${tab(depth)}${getName(property)}=${getReactValue(property)}`;
    }
}
