import {generate} from 'escodegen';
import * as esprima from 'esprima';

const EVENTS = ['onGridReady'];
const PROPERTIES = ['columnDefs', 'defaultColDef', 'defaultColGroupDef', 'columnTypes', 'rowData', 'enableFilter', 'floatingFilter', 'debug', 'enableSorting', 'enableColResize'];

function collect(iterable, accumulator, collectors) {
    return iterable.reduce((col, value) => {
        collectors.forEach(collector => {
            if (collector.matches(value)) {
                collector.apply(col, value);
            }
        });

        return col;
    }, accumulator);
}

function nodeIsVarNamed(node, name) {
    return node.type === 'VariableDeclaration' && (<any>node.declarations[0].id).name === name;
}

function nodeIsPropertyNamed(node, name) {
    // we skip { property: variable }
    // and get only inline property assignments
    return node.key.name == name && node.value.type != 'Identifier';
}

function nodeIsDocumentContentLoaded(node) {
    return (
        node.type === 'ExpressionStatement' &&
        node.expression.type == 'CallExpression' &&
        node.expression.arguments[0].type === 'Literal' &&
        node.expression.arguments[0].value === 'DOMContentLoaded'
    );
}

function nodeIsFetchDataCall(node) {
    return node.type === 'ExpressionStatement' && node.expression.callee && node.expression.callee.name === 'fetchData';
}

function nodeIsHttpOpen(node) {
    const calleeObject = node.expression && node.expression.callee && node.expression.callee.object;
    return node.type === 'ExpressionStatement' && calleeObject && calleeObject.name === 'httpRequest' && node.expression.callee.property.name === 'open';
}

export default function parser(src, gridSettings) {
    const tree = esprima.parseScript(src);
    const collectors = [];
    const gridOptionsCollectors = [];
    const onReadyCollectors = [];

    const indentOne = {format: {indent: {base: 1}}};

    // extract the fetchData call
    onReadyCollectors.push({
        matches: nodeIsFetchDataCall,
        apply: (col, node) => {
            const dataUrl = node.expression.arguments[0].raw;
            const callback = node.expression.arguments[1].body;

            col.data = {
                url: dataUrl,
                callback: generate(callback, {format: {indent: {base: 2}}})
            };
        }
    });

    // extract the fetchData call
    onReadyCollectors.push({
        matches: nodeIsHttpOpen,
        apply: (col, node) => {
            const dataUrl = node.expression.arguments[1].raw;
            // Let's try this for now
            const callback = '      { gridOptions.api.setRowData(data) }';

            col.data = {url: dataUrl, callback: callback};
        }
    });

    // extract onready
    collectors.push({
        matches: nodeIsDocumentContentLoaded,
        apply: (col, node) => {
            collect(node.expression.arguments[1].body.body, col, onReadyCollectors);
        }
    });

    PROPERTIES.forEach(propertyName => {
        // grab global variables named as grid properties
        collectors.push({
            matches: node => nodeIsVarNamed(node, propertyName),
            apply: (col, node) => col.properties.push({name: propertyName, value: generate(node.declarations[0].init, indentOne)})
        });

        // get stuff from gridOptions. TODO: ignore if node.value is just a variable ref
        gridOptionsCollectors.push({
            matches: node => nodeIsPropertyNamed(node, propertyName),
            apply: (col, node) => col.properties.push({name: propertyName, value: generate(node.value, indentOne)})
        });
    });

    collectors.push({
        matches: node => nodeIsVarNamed(node, 'gridOptions'),
        apply: (col, node) => collect(node.declarations[0].init.properties, col, gridOptionsCollectors)
    });

    const bindings = collect(
        tree.body,
        {
            eventHandlers: [],
            properties: []
        },
        collectors
    );

    bindings.gridSettings = gridSettings;

    /*
    console.log(bindings);
    console.log(appComponentTemplate(bindings));
    */
    return bindings;
}
