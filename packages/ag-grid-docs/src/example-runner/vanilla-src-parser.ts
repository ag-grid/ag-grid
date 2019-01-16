import {generate} from 'escodegen';
import * as esprima from 'esprima';
import {Events} from '../../../ag-grid-community/src/ts/eventKeys';
import {PropertyKeys} from '../../../ag-grid-community/src/ts/propertyKeys';
import * as $ from 'jquery';

const EVENTS = (<any>Object).values(Events);
const PROPERTIES = PropertyKeys.ALL_PROPERTIES;
const FUNCTION_PROPERTIES = PropertyKeys.FUNCTION_PROPERTIES;

function collect(iterable, initialBindings, collectors) {
    return iterable.reduce((bindings, value) => {
        collectors.forEach(collector => {
            if (collector.matches(value)) {
                collector.apply(bindings, value);
            }
        });

        return bindings;
    }, initialBindings);
}

function nodeIsVarNamed(node, name) {
    // eg: var currentRowHeight = 10;
    return node.type === 'VariableDeclaration' && (<any>node.declarations[0].id).name === name;
}

function nodeIsFunctionNamed(node, name) {
    // eg: function someFunction() { }
    return node.type === 'FunctionDeclaration' && (<any>node.id).name === name;
}

function nodeIsInScope(node, name, unboundInstanceMethods) {
    if (!unboundInstanceMethods) {
        return false;
    }
    return node.type === 'FunctionDeclaration' && unboundInstanceMethods.indexOf((<any>node.id).name) >= 0;
}

function nodeIsUnusedFunction(node, used, unboundInstanceMethods) {
    if (nodeIsInScope(node, used, unboundInstanceMethods)) {
        return;
    }
    return node.type === 'FunctionDeclaration' && used.indexOf((<any>node.id).name) === -1;
}

function nodeIsUnusedVar(node, used) {
    return node.type === 'VariableDeclaration' && used.indexOf((<any>node.declarations[0].id).name) === -1;
}

function nodeIsPropertyNamed(node, name) {
    // we skip { property: variable } - SPL why??
    // and get only inline property assignments
    return node.key.name == name && node.value.type != 'Identifier';
}

function nodeIsDocumentContentLoaded(node) {
    try {
        return (
            node.type === 'ExpressionStatement' &&
            node.expression.type == 'CallExpression' &&
            node.expression.arguments[0].type === 'Literal' &&
            node.expression.arguments[0].value === 'DOMContentLoaded'
        );
    } catch (e) {
        console.error('We found something which we do not understand', node);
    }
}

function nodeIsResizeColumnsToFit(node) {
    return node.expression && node.expression.callee && node.expression.callee.property && node.expression.callee.property.name == 'sizeColumnsToFit';
}

function nodeIsHttpOpen(node) {
    const calleeObject = node.expression && node.expression.callee && node.expression.callee.object;
    return node.type === 'ExpressionStatement' && calleeObject && calleeObject.name === 'httpRequest' && node.expression.callee.property.name === 'open';
}

function nodeIsSimpleHttpRequest(node) {
    const calleeObject = node.expression && node.expression.callee && node.expression.callee.object;
    const innerCallee = calleeObject && calleeObject.callee && calleeObject.callee.object;
    const innerProperty = calleeObject && calleeObject.callee && calleeObject.callee.property;

    return innerCallee && innerProperty && innerCallee.name == 'agGrid' && innerProperty.name == 'simpleHttpRequest';
}

export const recognizedDomEvents = ['click', 'change', 'input'];

const arrayMap = function (array, callback) {
    return Array.prototype.map.call(array, callback);
};

const flatMap = function (array, callback) {
    return Array.prototype.concat.apply([], array.map(callback));
};

const extractEventHandlerBody = call => call.match(/^([\w]+)\((.*)\)/);
const getElementAttribute = attrName => el => el.getAttribute(attrName);


/*
 * for each of the recognised events (click, change etc) extract the corresponding event handler, with (optional) params
 * eg: onclick="refreshEvenRowsCurrencyData()"
 */
function extractEventHandlers(tree, eventNames: string[]) {
    return flatMap(eventNames, eventName => {
        return arrayMap(tree.find(`[on${eventName}]`), getElementAttribute(`on${eventName}`)).map(extractEventHandlerBody);
    });
}

function generateWithReplacedGridOptions(node, options?) {
    const code = generate(node, options)
        .replace(/gridOptions.api/g, 'this.gridApi')
        .replace(/gridOptions.columnApi/g, 'this.gridColumnApi');

    return code;
}

// if a function is marked as "inScope" then they'll be marked as "instance" methods, as opposed to (global/unused)
// "util" ones
let extractUnboundInstanceMethods = function (tree) {
    const inScopeRegex = /inScope\[([\w-].*)]/;

    return tree.comments
        .map((comment) => comment.value ? comment.value.trim() : '')
        .filter((commentValue) => commentValue.indexOf("inScope") === 0)
        .map((commentValue) => {
            const result = commentValue.match(inScopeRegex);
            if (result && result.length >= 1) {
                return result[1]
            }
            return ''
        });
};

export default function parser(js, html, exampleSettings) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tree = esprima.parseScript(js, {comment: true});

    const collectors = [];
    const gridOptionsCollectors = [];
    const onReadyCollectors = [];

    const indentOne = {format: {indent: {base: 1}}};

    const registered = ['gridOptions'];

    // handler is the function name, params are any function parameters
    domEventHandlers.forEach(([_, handler, params]) => {
        if (registered.indexOf(handler) > -1) {
            return;
        }

        registered.push(handler);

        // one of the event handlers extracted earlier (onclick, onchange etc)
        // body replaces gridOptions.api/columnApi with this.gridApi/columnApi
        collectors.push({
            matches: node => nodeIsFunctionNamed(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: generateWithReplacedGridOptions(node)
                });
            }
        });
    });

    // functions marked as "inScope" will be added to "instance" methods, as opposed to (global/unused) "util" ones
    const unboundInstanceMethods = extractUnboundInstanceMethods(tree);
    collectors.push({
        matches: node => nodeIsInScope(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => {
            bindings.instance.push(generate(node, indentOne))
        }
    });

    // anything not marked as "inScope" and not handled above in the eventHandlers is considered an unused/util method
    collectors.push({
        matches: node => nodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => {
            bindings.utils.push(generate(node).replace(/gridOptions/g, 'gridInstance'));
        }
    });

    // anything vars not not handled above in the eventHandlers is considered an unused/util method
    collectors.push({
        matches: node => nodeIsUnusedVar(node, registered),
        apply: (bindings, node) => {
            bindings.utils.push(generate(node));
        }
    });

    // extract the xmlhttpreq call
    onReadyCollectors.push({
        matches: nodeIsHttpOpen,
        apply: (bindings, node) => {
            const dataUrl = node.expression.arguments[1].raw;
            const callback = '{ params.api.setRowData(data); }';

            bindings.data = {url: dataUrl, callback: callback};
        }
    });

    // extract the simpleHttpRequest call
    onReadyCollectors.push({
        matches: nodeIsSimpleHttpRequest,
        apply: (bindings, node) => {
            const dataUrl = node.expression.callee.object.arguments[0].properties[0].value.raw;
            const callback = generate(node.expression.arguments[0].body).replace(/gridOptions/g, 'params');

            bindings.data = {url: dataUrl, callback: callback};
        }
    });

    // extract the resizeColumnsToFit
    onReadyCollectors.push({
        matches: nodeIsResizeColumnsToFit,
        apply: (bindings, node) => {
            bindings.resizeToFit = true;
        }
    });

    // extract onready
    collectors.push({
        matches: nodeIsDocumentContentLoaded,
        apply: (bindings, node) => {
            collect(node.expression.arguments[1].body.body, bindings, onReadyCollectors);
        }
    });

    // all onXXX will be handled here
    // note: gridOptions = { onGridSizeChanged = function() {}  WILL NOT WORK
    // needs to be a separate function  gridOptions = { onGridSizeChanged = myGridSizeChangedFunc
    // ALSO event must match function name: onColumnPinned: onColumnPinned (not onColumnPinned: someOtherFunc)
    EVENTS.forEach(eventName => {
        var onEventName = 'on' + eventName.replace(/^\w/, w => w.toUpperCase());

        registered.push(onEventName);

        collectors.push({
            matches: node => {
                return nodeIsFunctionNamed(node, onEventName)
            },
            apply: (bindings, node) => {
                bindings.eventHandlers.push({
                    name: eventName,
                    handlerName: onEventName,
                    handler: generateWithReplacedGridOptions(node)
                });
            }
        });
    });

    FUNCTION_PROPERTIES.forEach(functionName => {
        registered.push(functionName);
        collectors.push({
            matches: node => {
                return nodeIsFunctionNamed(node, functionName)
            },
            apply: (bindings, node) => {
                bindings.instance.push(generateWithReplacedGridOptions(node, indentOne));

                bindings.properties.push({name: functionName, value: null });
            }
        });
    });

    PROPERTIES.forEach(propertyName => {
        registered.push(propertyName);
        // grab global variables named as grid properties
        collectors.push({
            matches: node => nodeIsVarNamed(node, propertyName),

            apply: (bindings, node) => {
                try {
                    const code = generate(node.declarations[0].init, indentOne);
                    bindings.properties.push({name: propertyName, value: code});
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                }
            }
        });

        gridOptionsCollectors.push({
            matches: node => {
                return nodeIsPropertyNamed(node, propertyName)
            },
            apply: (bindings, node) => bindings.properties.push({
                name: propertyName,
                value: generate(node.value, indentOne)
            })
        });
    });

    gridOptionsCollectors.push({
        matches: node => nodeIsPropertyNamed(node, 'onGridReady'),
        apply: (bindings, node) => {
            bindings.onGridReady = generate(node.value.body).replace(/gridOptions/g, 'params');
        }
    });

    // gridOptionsCollectors captures all events, properties etc that are related to gridOptions
    collectors.push({
        matches: node => {
            return nodeIsVarNamed(node, 'gridOptions')
        },
        apply: (bindings, node) => {
            return collect(node.declarations[0].init.properties, bindings, gridOptionsCollectors)
        }
    });

    /*
     * externalEventHandlers -> onclick, onchange etc in index.html
     * eventHandlers -> grid related events
     * properties -> grid related properties
     * utils -> none grid related methods/variables (or methods that don't reference the gridApi/columnApi) (ie non-instance)
     * instance -> methods that are either marked as "inScope" or ones that reference the gridApi/columnApi
     * onGridReady -> any matching onGridReady method
     * data -> url: dataUrl, callback: callback, http calls etc
     * resizeToFit -> true if sizeColumnsToFit is used
     */
    const bindings = collect(
        tree.body,
        {
            eventHandlers: [],
            properties: [],
            instance: [],
            externalEventHandlers: [],
            utils: []
        },
        collectors
    );

    const gridElement = domTree.find('#myGrid').replaceWith('$$GRID$$');
    const inlineClass = gridElement.attr('class');
    const inlineHeight = gridElement.css('height');
    const inlineWidth = gridElement.css('width');
    if (inlineClass) {
        exampleSettings.theme = inlineClass;
    }

    if (parseInt(inlineHeight)) {
        exampleSettings.height = inlineHeight;
    }

    if (parseInt(inlineWidth)) {
        exampleSettings.width = inlineWidth;
    }

    bindings.template = domTree.html().replace(/<br>/g, '<br />');

    bindings.gridSettings = (<any>Object).assign({
        width: '100%',
        height: '100%',
        theme: 'ag-theme-balham'
    }, exampleSettings);
    return bindings;
}
