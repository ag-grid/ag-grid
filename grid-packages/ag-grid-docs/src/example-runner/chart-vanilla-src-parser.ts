import { generate } from 'escodegen';
import * as esprima from 'esprima';
import * as $ from 'jquery';
import {
    NodeType,
    recognizedDomEvents,
    collect,
    nodeIsVarWithName,
    nodeIsPropertyWithName,
    nodeIsFunctionWithName,
    nodeIsInScope,
    nodeIsUnusedFunction,
    extractEventHandlers,
    extractUnboundInstanceMethods,
    nodeIsGlobalFunctionCall,
} from './parser-utils';

export const templatePlaceholder = '$$CHART$$';

const chartVariableName = 'chart';
const optionsVariableName = 'options';
const PROPERTIES = [optionsVariableName];

function generateWithOptionReferences(node, options?) {
    return generate(node, options)
        .replace(new RegExp(`${chartVariableName}\\.performLayout\\(\\);?`, 'g'), '')
        .replace(new RegExp(`${chartVariableName}\\.`, 'g'), `${optionsVariableName}.`);
}

export function parser(js, html) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tree = esprima.parseScript(js, { comment: true });
    const collectors = [];
    const optionsCollectors = [];
    const indentOne = { format: { indent: { base: 1 } } };
    const registered = [chartVariableName, optionsVariableName];

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
        apply: (bindings, node) => bindings.instanceMethods.push(generateWithOptionReferences(node, indentOne))
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
                    let code = generate(node.declarations[0].init, indentOne);

                    if (propertyName === optionsVariableName) {
                        code = code.replace(/container:.*/, '');
                    }

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
        matches: node => nodeIsVarWithName(node, optionsVariableName),
        apply: (bindings, node) => collect(node.declarations[0].init.properties, bindings, optionsCollectors)
    });

    collectors.push({
        matches: node => nodeIsGlobalFunctionCall(node),
        apply: (bindings, node) => bindings.init.push(generate(node))
    });

    /*
     * properties -> chart related properties
     * globals -> none chart related methods/variables (i.e. non-instance)
     * instanceMethods -> methods that are marked as "inScope"
     */
    const bindings = collect(
        tree.body,
        {
            properties: [],
            externalEventHandlers: [],
            instanceMethods: [],
            globals: [],
            init: [],
        },
        collectors
    );

    domTree.find('#myChart').replaceWith(templatePlaceholder);
    bindings.template = domTree.html();

    return bindings;
}

export default parser;
