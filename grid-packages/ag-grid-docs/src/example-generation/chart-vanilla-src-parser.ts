import * as $ from 'jquery';
import {
    extractEventHandlers, extractImportStatements, extractTypeInfoForVariable, extractUnboundInstanceMethods, parseFile, readAsJsFile, recognizedDomEvents, removeInScopeJsDoc, tsCollect, tsGenerate, tsNodeIsFunctionWithName, tsNodeIsGlobalFunctionCall, tsNodeIsGlobalVarWithName, tsNodeIsInScope, tsNodeIsPropertyWithName, tsNodeIsTopLevelVariable, tsNodeIsTypeDeclaration, tsNodeIsUnusedFunction
} from './parser-utils';

export const templatePlaceholder = '$$CHART$$';

const chartVariableName = 'chart';
const optionsVariableName = 'options';
const PROPERTIES = [optionsVariableName];

function tsGenerateWithOptionReferences(node, srcFile) {
    return tsGenerate(node, srcFile)
        .replace(new RegExp(`AgChart\\.update\\(chart, options\\);?`, 'g'), '');
}

export function parser(examplePath, fileName, srcFile, html) {
    const bindings = internalParser(readAsJsFile(srcFile, { includeImports: true }), html);
    const typedBindings = internalParser(srcFile, html);
    return { bindings, typedBindings };
}

export function internalParser(js, html) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tsTree = parseFile(js);
    const tsCollectors = [];
    const tsOptionsCollectors = [];
    const registered = [chartVariableName, optionsVariableName];

    // handler is the function name, params are any function parameters
    domEventHandlers.forEach(([_, handler, params]) => {
        if (registered.indexOf(handler) > -1) {
            return;
        }

        registered.push(handler);

        // one of the event handlers extracted earlier (onclick, onchange etc)
        tsCollectors.push({
            matches: node => tsNodeIsFunctionWithName(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: tsGenerateWithOptionReferences(node, tsTree)
                });
            }
        });
    });

    const unboundInstanceMethods = extractUnboundInstanceMethods(tsTree);
    // functions marked as "inScope" will be added to "instance" methods, as opposed to "global" ones
    tsCollectors.push({
        matches: node => tsNodeIsInScope(node, unboundInstanceMethods),
        apply: (bindings, node) => bindings.instanceMethods.push(removeInScopeJsDoc(tsGenerateWithOptionReferences(node, tsTree)))
    });

    // anything not marked as "inScope" is considered a "global" method
    tsCollectors.push({
        matches: node => tsNodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => bindings.globals.push(tsGenerate(node, tsTree))
    });

    // anything vars is considered an "global" var    
    tsCollectors.push({
        matches: node => tsNodeIsTopLevelVariable(node, registered),
        apply: (bindings, node) => bindings.globals.push(tsGenerate(node, tsTree))
    });

    PROPERTIES.forEach(propertyName => {
        registered.push(propertyName);

        // grab global variables named as chart properties        
        tsCollectors.push({
            matches: node => tsNodeIsGlobalVarWithName(node, propertyName),
            apply: (bindings, node) => {
                try {
                    let code = tsGenerate(node.initializer, tsTree);

                    if (propertyName === optionsVariableName) {
                        code = code.replace(/container:.*/, '');
                    }

                    bindings.properties.push({ name: propertyName, value: code });
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                }
            }
        });

        tsOptionsCollectors.push({
            matches: node => tsNodeIsPropertyWithName(node, propertyName),
            apply: (bindings, node) => bindings.properties.push({
                name: propertyName,
                value: tsGenerate(node.value, tsTree)
            })
        });
    });

    // optionsCollectors captures all events, properties etc that are related to options  
    tsCollectors.push({
        matches: node => tsNodeIsGlobalVarWithName(node, optionsVariableName),
        apply: (bindings, node) => {

            node.initializer.properties.forEach(prop => {
                bindings = tsCollect(prop, bindings, tsOptionsCollectors, false)
            });

            return bindings;
        }
    });

    tsCollectors.push({
        matches: node => tsNodeIsGlobalFunctionCall(node),
        apply: (bindings, node) => bindings.init.push(tsGenerate(node, tsTree))
    });

    tsCollectors.push({
        matches: node => tsNodeIsTypeDeclaration(node),
        apply: (bindings, node) => {
            const declaration = tsGenerate(node, tsTree);
            bindings.declarations.push(declaration)
        }
    });

    /*
     * properties -> chart related properties
     * globals -> none chart related methods/variables (i.e. non-instance)
     */
    const tsBindings = tsCollect(
        tsTree,
        {
            properties: [],
            externalEventHandlers: [],
            instanceMethods: [],
            globals: [],
            init: [],
            declarations: [],
        },
        tsCollectors
    );

    domTree.find('#myChart').replaceWith(templatePlaceholder);
    tsBindings.template = domTree.html();
    tsBindings.imports = extractImportStatements(tsTree);
    tsBindings.optionsTypeInfo = extractTypeInfoForVariable(tsTree, 'options');

    return tsBindings;
}

export default parser;
