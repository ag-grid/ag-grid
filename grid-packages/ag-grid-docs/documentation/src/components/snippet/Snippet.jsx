import React from 'react';
import Prism from 'prismjs';
import * as esprima from 'esprima';

export const Snippet = (props, framework) => {
    const suppliedSnippet = props.children[0].toString();

    // create syntax tree from supplied snippet
    const tree = esprima.parseScript(suppliedSnippet.trim(), {comment: true, range: true, loc: true});

    // convert syntax tree into a more convenient form, [{ propertyName: propertyAstObj }]
    let propertyMappings = parseTree(tree);

    // create FW specific snippet
    const snippet =
        framework === 'angular' ? createNgSnippet(propertyMappings) :
            framework === 'react' ? createReactSnippet(propertyMappings) :
                framework === 'vue' ? createVueSnippet(propertyMappings) :
                    createJsSnippet(propertyMappings);

    return <CodeSnippet code={snippet}/>;
};

function parseTree(tree) {
    const isVarDeclaration = node => node.type === 'VariableDeclaration' && Array.isArray(node.declarations);

    const commentsMap = tree.comments.reduce((acc, comment) => {
        acc[comment.loc.start.line] = comment.value;
        return acc;
    }, {});

    const parse = (acc, node) => {
        if (Array.isArray(node)) {
            node.forEach(n => parse(acc, n));
        } else if (isVarDeclaration(node)) {
            node.declarations.forEach(n => parse(acc, n));
        } else {
            const commentAbove = commentsMap[node.loc.start.line - 1];
            acc.push({name: node.key.name, comment: commentAbove, ...node.value});
        }
    }

    // simpler and faster to start here
    const root = tree.body[0].declarations[0].init.properties;

    // using array to preserve supplied order
    const propertyMappings = [];

    parse(propertyMappings, root);

    return propertyMappings;
}

const createJsSnippet = propertyMappings => {
    let res = 'const gridOptions = {';
    propertyMappings.forEach(prop => {
        if (prop.comment) {
            res += `\n\t//${prop.comment}`;
        }

        if (prop.name === 'columnDefs') {
            res += '\n\tcolumnDefs: [\n';
            res += formatColDefsAsObjs(prop.elements, 2).join('\n');
            res += '\n\t],';
        } else {
            res += `\n\t${prop.name}: ${prop.value},`;
        }
    });

    res += '\n\n\t// other grid options ...';
    res += '\n}';

    return res;
}

const createReactSnippet = propertyMappings => {
    let res = '<AgGridReact>';
    propertyMappings.forEach(prop => {
        if (prop.comment) {
            res += `\n\t//${prop.comment}`;
        }

        if (prop.name === 'columnDefs') {
            res += prop.elements.map(colDefAst => {
                const colDefObj = colDefAst.properties.map(property => {
                    return `${property.key.name}='${property.value.value}'`;
                });
                return `\n${pad(1)}<AgGridColumn ${colDefObj.join(', ')} />`;
            }).join('');
        }
    });

    res += '\n</AgGridReact>';

    return res;
}

const createNgSnippet = propertyMappings => {
    let res = `<ag-grid-angular
    [columnDefs]="columnDefs"
    // other grid options ...>
</ag-grid-angular>
\n`;

    return addPropsToNgOrVueSnippet(res, propertyMappings);
}

const createVueSnippet = propertyMappings => {
    let res = `<ag-grid-vue
    :columnDefs="columnDefs"
    // other grid options ...>
</ag-grid-vue>
\n`;

    return addPropsToNgOrVueSnippet(res, propertyMappings);
}

const addPropsToNgOrVueSnippet = (res, propertyMappings) => {
    for (let i = 0; i < propertyMappings.length; i++) {
        const prop = propertyMappings[i];
        if (prop.comment) {
            if (i > 0) res += `\n`;
            res += `//${prop.comment}\n`;
        }

        if (prop.name === 'columnDefs') {
            res += 'this.columnDefs = [\n';
            res += formatColDefsAsObjs(prop.elements, 1).join('\n');
            res += '\n];\n';
        } else {
            res += `this.${prop.name} = ${prop.value};`;
        }
    }

    return res;
}

const formatColDefsAsObjs = (colDefs, padding) => {
    return colDefs.map(colDefAst => {
        const colDefObj = colDefAst.properties.map(property => {
            return `${property.key.name}: '${property.value.value}'`;
        });
        return `${pad(padding)}{ ${colDefObj.join(', ')} },`;
    });
}

const pad = n => new Array(n).fill('\t').join('');

const CodeSnippet = ({code}) => <pre className="language-ts">
    <code dangerouslySetInnerHTML={{__html: Prism.highlight(code, Prism.languages.typescript, 'typescript')}}/>
</pre>;
