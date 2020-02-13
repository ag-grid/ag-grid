import { generate } from 'escodegen';
import * as esprima from 'esprima';
import * as $ from 'jquery';

export const recognizedDomEvents = ['click', 'change', 'input', 'dragover', 'dragstart', 'drop'];
export const templatePlaceholder = '$$CHART$$';

const PROPERTIES = ['options'];

const enum NodeType {
    Variable = 'VariableDeclaration',
    Function = 'FunctionDeclaration',
    Expression = 'ExpressionStatement'
};

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

function nodeIsVarWithName(node, name) {
    // eg: var currentRowHeight = 10;
    return node.type === NodeType.Variable && node.declarations[0].id.name === name;
}

function nodeIsFunctionWithName(node, name) {
    // eg: function someFunction() { }
    return node.type === NodeType.Function && node.id.name === name;
}

function nodeIsInScope(node, unboundInstanceMethods) {
    return unboundInstanceMethods &&
        node.type === NodeType.Function &&
        unboundInstanceMethods.indexOf(node.id.name) >= 0;
}

function nodeIsUnusedFunction(node, used, unboundInstanceMethods) {
    return !nodeIsInScope(node, unboundInstanceMethods) &&
        node.type === NodeType.Function &&
        used.indexOf(node.id.name) < 0;
}

function nodeIsPropertyWithName(node, name) {
    // we skip { property: variable } - SPL why??
    // and get only inline property assignments
    return node.key.name == name && node.value.type != 'Identifier';
}

function flatMap(array, callback) {
    return Array.prototype.concat.apply([], array.map(callback));
};

function extractEventHandlerBody(call) {
    return call.match(/^(\w+)\((.*)\)/);
}

/*
 * for each of the recognised events (click, change etc) extract the corresponding event handler, with (optional) params
 * eg: onclick="refreshEvenRowsCurrencyData()"
 */
function extractEventHandlers(tree, eventNames: string[]) {
    const getHandlerAttributes = event => {
        const handlerName = `on${event}`;

        return Array.prototype.map.call(tree.find(`[${handlerName}]`), el => el.getAttribute(handlerName));
    };

    return flatMap(eventNames, event => getHandlerAttributes(event).map(extractEventHandlerBody));
}

function generateWithOptionReferences(node, options?) {
    return generate(node, options).replace(/chart\./g, 'options.');
}

// if a function is marked as "inScope" then they'll be marked as "instance" methods, as opposed to (global/unused)
// "util" ones
function extractUnboundInstanceMethods(tree) {
    const inScopeRegex = /inScope\[([\w-].*)]/;

    return tree.comments
        .map(comment => comment.value ? comment.value.trim() : '')
        .filter(commentValue => commentValue.indexOf("inScope") === 0)
        .map(commentValue => {
            const result = commentValue.match(inScopeRegex);

            return result && result.length > 0 ? result[1] : '';
        });
};

export function parser(js, html) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tree = esprima.parseScript(js, { comment: true });
    const collectors = [];
    const optionsCollectors = [];
    const indentOne = { format: { indent: { base: 1 } } };
    const optionsName = 'options';
    const registered = [optionsName, 'chart'];

    // handler is the function name, params are any function parameters
    domEventHandlers.forEach(([_, handler, params]) => {
        if (registered.indexOf(handler) > -1) {
            return;
        }

        registered.push(handler);

        // one of the event handlers extracted earlier (onclick, onchange etc)
        collectors.push({
            matches: node => nodeIsFunctionWithName(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: generateWithOptionReferences(node, null)
                });
            }
        });
    });

    // functions marked as "inScope" will be added to "instance" methods, as opposed to "global" ones
    const unboundInstanceMethods = extractUnboundInstanceMethods(tree);
    collectors.push({
        matches: node => nodeIsInScope(node, unboundInstanceMethods),
        apply: (bindings, node) => bindings.instance.push(generate(node, indentOne))
    });

    // anything not marked as "inScope" is considered a "global" method
    collectors.push({
        matches: node => nodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => bindings.globals.push(generate(node))
    });

    // anything vars is considered an "global" var
    collectors.push({
        matches: node => node.type === NodeType.Variable && registered.indexOf(node.declarations[0].id.name) < 0,
        apply: (bindings, node) => bindings.globals.push(generate(node))
    });

    PROPERTIES.forEach(propertyName => {
        registered.push(propertyName);

        // grab global variables named as chart properties
        collectors.push({
            matches: node => nodeIsVarWithName(node, propertyName),
            apply: (bindings, node) => {
                try {
                    const code = generate(node.declarations[0].init, indentOne).replace(/container:.*/, '');
                    bindings.properties.push({ name: propertyName, value: code });
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                }
            }
        });

        optionsCollectors.push({
            matches: node => nodeIsPropertyWithName(node, propertyName),
            apply: (bindings, node) => bindings.properties.push({
                name: propertyName,
                value: generate(node.value, indentOne)
            })
        });
    });

    // optionsCollectors captures all events, properties etc that are related to options
    collectors.push({
        matches: node => nodeIsVarWithName(node, optionsName),
        apply: (bindings, node) => collect(node.declarations[0].init.properties, bindings, optionsCollectors)
    });

    /*
     * properties -> chart related properties
     * globals -> none chart related methods/variables (i.e. non-instance)
     * instance -> methods that are marked as "inScope"
     */
    const bindings = collect(
        tree.body,
        {
            properties: [],
            externalEventHandlers: [],
            instance: [],
            globals: [],
        },
        collectors
    );

    domTree.find('#myChart').replaceWith(templatePlaceholder);
    bindings.template = domTree.html();

    return bindings;
}

export function getFunctionName(code) {
    let matches = /function ([^\(]*)/.exec(code);
    return matches && matches.length === 2 ? matches[1].trim() : null;
}

export default parser;