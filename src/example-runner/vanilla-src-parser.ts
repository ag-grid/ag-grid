import {generate} from 'escodegen';
import * as esprima from 'esprima';
import {Events} from '../../../ag-grid/src/ts/eventKeys';
import {PropertyKeys} from '../../../ag-grid/src/ts/propertyKeys';
import * as $ from 'jquery';

const EVENTS = (<any>Object).values(Events);
const PROPERTIES = PropertyKeys.ALL_PROPERTIES;

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

function nodeIsFunctionNamed(node, name) {
    return node.type === 'FunctionDeclaration' && (<any>node.id).name === name;
}

function nodeIsUnusedFunction(node, used) {
    return node.type === 'FunctionDeclaration' && used.indexOf((<any>node.id).name) === -1;
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

export default function parser([js, html], gridSettings, {gridOptionsLocalVar}) {
    const localGridOptions = esprima.parseScript(gridOptionsLocalVar).body[0];

    const domTree = $(`<div>${html}</div>`);
    const clickHandlers = Array.prototype.map.call(domTree.find('[onclick]'), el => el.getAttribute('onclick')).map(call => call.match(/^([\w]+)\((.*)\)/));
    const tree = esprima.parseScript(js);
    const collectors = [];
    const gridOptionsCollectors = [];
    const onReadyCollectors = [];

    const indentOne = {format: {indent: {base: 1}}};

    const registered = [];
    clickHandlers.forEach(([_, handler, params]) => {
        if (registered.indexOf(handler) > -1) {
            return;
        }

        registered.push(handler);

        collectors.push({
            matches: node => nodeIsFunctionNamed(node, handler),
            apply: (col, node) => {
                const body = node.body;
                body.body.unshift(localGridOptions);

                col.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: generate(node, indentOne)
                });
            }
        });
    });

    collectors.push({
        matches: node => nodeIsUnusedFunction(node, registered),
        apply: (col, node) => {
            col.utils.push(generate(node));
        }
    })

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

    // extract the xmlhttpreq call
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
    // get stuff from gridOptions. TODO: ignore if node.value is just a variable ref
    gridOptionsCollectors.push({
        matches: node => nodeIsPropertyNamed(node, 'onGridReady'),
        apply: (col, node) => { col.onGridReady = generate(node.value.body); }
    });

    collectors.push({
        matches: node => nodeIsVarNamed(node, 'gridOptions'),
        apply: (col, node) => collect(node.declarations[0].init.properties, col, gridOptionsCollectors)
    });

    const bindings = collect(
        tree.body,
        {
            eventHandlers: [],
            properties: [],
            externalEventHandlers: [],
            utils: []
        },
        collectors
    );

    if (domTree.find("[style]:not('#myGrid')").length) {
        console.error(domTree.html());
        throw new Error('The template contains inline styles - I cannot conver those to react');
    }

    const gridElement = domTree.find('#myGrid').replaceWith('$$GRID$$');
    const inlineClass = gridElement.attr('class');
    const inlineHeight = gridElement.css('height');
    const inlineWidth = gridElement.css('width');
    if (inlineClass) {
        gridSettings.theme = inlineClass;
    }

    if (parseInt(inlineHeight)) {
        gridSettings.height = inlineHeight;
    }

    if (parseInt(inlineWidth)) {
        gridSettings.width = inlineWidth;
    }

    bindings.template = domTree.html();

    bindings.gridSettings = gridSettings;
    return bindings;
}
