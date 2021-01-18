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

// Transformers implement the Template Method design pattern
class SnippetTransformer {
    transform(tree) {
        return this.addFrameworkContext(this.parse(tree));
    }

    parse(tree) {
        if (Array.isArray(tree)) {
            return tree.map(node => this.parse(node)).join('');
        } else if (isLiteralProperty(tree)) {
            return this.addComment(tree) + this.parseLiteral(tree);

        } else if (isArrayProperty(tree)) {
            return this.addComment(tree) + this.parseArray(tree);

        } else if (isObjectProperty(tree)) {
            return this.addComment(tree) + this.parseObject(tree);
        }
    }

}

class JavascriptTransformer extends SnippetTransformer {
    parseLiteral(property) {
        return `${tab(1)}${getName(property)}: ${getValue(property)},`;
    }

    parseArray(property) {
        if (getName(property) === 'columnDefs') {
            let res = `${tab(1)}columnDefs: [`;
            res += createColDefSnippet(property.value.elements, 2);
            res += `,\n${tab(1)}],`;
            return res;
        } else {
            throw Error("Not yet implemented!");
        }
    }

    parseObject() {
        throw Error("Not yet implemented!");
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

    parseLiteral(property) {
        this.propertiesVisited.push(getName(property));
        return `this.${getName(property)} = ${getValue(property)};`;
    }

    parseArray(property) {
        this.propertiesVisited.push(getName(property));
        if (getName(property) === 'columnDefs') {
            return 'this.columnDefs: [' + createColDefSnippet(property.value.elements, 1) + ',\n];';
        } else {
            console.error("Not yet implemented!");
        }
    }

    parseObject(property) {
        this.propertiesVisited.push(getName(property));
        console.error("Not yet implemented!");
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

    parseLiteral(property) {
        let res = property.comment ? `\n\t//${property.comment}` : '';
        res += `\n${tab(1)}${getName(property)}=${getReactValue(property)}`
        this.propertySnippets.push(res);
        return '';
    }

    parseArray(property) {
        if (getName(property) === 'columnDefs') {
            let res = property.comment ? `\n\t//${property.comment}` : '';
            res += createReactColDefSnippet(property.value.elements, 1);
            return res;
        } else {
            console.error("Not yet implemented!");
        }
    }

    parseObject() {
        console.error("Not yet implemented!");
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
}
