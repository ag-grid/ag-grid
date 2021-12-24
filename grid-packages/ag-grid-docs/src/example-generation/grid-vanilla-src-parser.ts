import * as $ from 'jquery';
import * as ts from 'typescript';
import { Events } from '../../../../community-modules/core/src/ts/eventKeys';
import { PropertyKeys } from '../../../../community-modules/core/src/ts/propertyKeys';
import {
    extractEventHandlers, extractUnboundInstanceMethods, findAllAccessedProperties, findAllVariables, parseFile, recognizedDomEvents,
    removeInScopeJsDoc,
    tsCollect,
    tsGenerate,
    tsIsDomContentLoaded,
    tsNodeIsFunctionCall,
    tsNodeIsFunctionWithName, tsNodeIsGlobalVarWithName, tsNodeIsInScope, tsNodeIsPropertyWithName, tsNodeIsTopLevelFunction, tsNodeIsTopLevelVariable, tsNodeIsUnusedFunction
} from './parser-utils';

export const templatePlaceholder = 'GRID_TEMPLATE_PLACEHOLDER';

const EVENTS = (<any>Object).values(Events);
const PROPERTIES = PropertyKeys.ALL_PROPERTIES;
const FUNCTION_PROPERTIES = PropertyKeys.FUNCTION_PROPERTIES;

function tsNodeIsDocumentContentLoaded(node) {
    try {
        if (tsNodeIsFunctionCall(node)) {
            return node.expression.arguments.length > 0 &&
                ts.isStringLiteral(node.expression.arguments[0]) &&
                node.expression.arguments[0].text === 'DOMContentLoaded';
        }
    } catch (e) {
        console.error('We found something which we do not understand', node);
    }
}

function tsNodeIsHttpOpen(node) {
    const callee = node.expression && node.expression.callee;
    const calleeObject = callee && callee.object;

    return ts.isExpressionStatement(node) &&
        calleeObject &&
        calleeObject.name === 'httpRequest' &&
        callee.property.name === 'open';
}

function tsNodeIsSimpleFetchRequest(node) {
    if (ts.isCallExpression(node)) {
        node = node as any;
        const isFetch = ts.isCallExpression(node) && node.expression.getText() === 'fetch';
        return isFetch;

    }
}

function tsGenerateWithReplacedGridOptions(node, srcFile) {
    return tsGenerate(node, srcFile)
        // Handle case when api is on a new line 
        //  gridOptions
        //      .api.setRow()
        .replace(/gridOptions\s*\n?\s*\.api/g, 'this.gridApi')
        .replace(/gridOptions\s*\n?\s*\.columnApi/g, 'this.gridColumnApi')
}

function processColDefsForFunctionalReactOrVue(propertyName: string, exampleType, exampleSettings, providedExamples) {
    if (propertyName === 'columnDefs') {
        return exampleType === 'generated' ||
            (exampleType === 'mixed' && !(providedExamples['reactFunctional'] && providedExamples['vue'] && providedExamples['vue3']));
    }

    return false;
}

function processComponentsForVue(propertyName: string, exampleType, providedExamples) {
    if (propertyName === 'components') {
        return exampleType === 'generated' || (exampleType === 'mixed' && !(providedExamples['vue'] && providedExamples['vue3']));
    }

    return false;
}

function processDefaultColumnDefForVue(propertyName: string, exampleType, providedExamples) {
    if (propertyName === 'defaultColDef') {
        return exampleType === 'generated' || (exampleType === 'mixed' && !(providedExamples['vue'] && providedExamples['vue3']));
    }

    return false;
}

const GLOBAL_COMPONENTS = ['dateComponent', 'loadingCellRenderer', 'loadingOverlayComponent', 'noRowsOverlayComponent'];

function processGlobalComponentsForVue(propertyName: string, exampleType, providedExamples) {
    if (GLOBAL_COMPONENTS.indexOf(propertyName) !== -1) {
        return exampleType === 'generated' || (exampleType === 'mixed' && !(providedExamples['vue'] && providedExamples['vue3']));
    }

    return false;
}

export function parser(js, html, exampleSettings, exampleType, providedExamples) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tsTree = parseFile(js);
    const tsCollectors = [];
    const tsGridOptionsCollectors = [];
    const tsOnReadyCollectors = [];
    const registered = ['gridOptions'];

    // handler is the function name, params are any function parameters
    domEventHandlers.forEach(([_, handler, params]) => {
        if (registered.indexOf(handler) > -1) {
            return;
        }

        registered.push(handler);

        // one of the event handlers extracted earlier (onclick, onchange etc)
        // body replaces gridOptions.api/columnApi with this.gridApi/columnApi
        tsCollectors.push({
            matches: node => tsNodeIsFunctionWithName(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: tsGenerateWithReplacedGridOptions(node, tsTree)
                });
            }
        });
    });

    // functions marked as "inScope" will be added to "instance" methods, as opposed to (global/unused) "util" ones
    const unboundInstanceMethods = extractUnboundInstanceMethods(tsTree);
    tsCollectors.push({
        matches: node => tsNodeIsInScope(node, unboundInstanceMethods),
        apply: (bindings, node) => bindings.instanceMethods.push(removeInScopeJsDoc(tsGenerateWithReplacedGridOptions(node, tsTree)))
    });


    // anything not marked as "inScope" and not handled above in the eventHandlers is considered an unused/util method
    tsCollectors.push({
        matches: node => tsNodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => {
            const util = tsGenerate(node, tsTree).replace(/gridOptions/g, 'gridInstance');
            bindings.utils.push(util)
        }
    });

    // For React we need to identify the external dependencies for callbacks to prevent stale closures
    const GLOBAL_DEPS = new Set(['console', 'document', 'Error'])
    tsCollectors.push({
        matches: node => tsNodeIsTopLevelFunction(node),
        apply: (bindings, node: ts.SignatureDeclaration) => {

            let allVariables = new Set(findAllVariables((node as any).body));
            if (node.parameters && node.parameters.length > 0) {
                node.parameters.forEach(p => {
                    allVariables.add(p.name.getText())
                })
            }
            const deps = findAllAccessedProperties((node as any).body);
            const allDeps = deps.filter((id: string) => {
                // Ignore locally defined variables
                const isVariable = allVariables.has(id);
                // Let's assume that all caps are constants so should be ignored, i.e KEY_UP
                const isCapsConst = id === id.toUpperCase();
                return !isVariable && !isCapsConst && !GLOBAL_DEPS.has(id);
            });
            if (allDeps.length > 0) {
                bindings.callbackDependencies[node.name.getText()] = [...new Set(allDeps)];
            }
        }
    });

    // anything vars not handled above in the eventHandlers is considered an unused/util method    
    tsCollectors.push({
        matches: node => tsNodeIsTopLevelVariable(node, registered),
        apply: (bindings, node) => bindings.utils.push(tsGenerate(node.parent, tsTree))
    });

    tsCollectors.push({
        matches: node => tsIsDomContentLoaded(node),
        apply: (bindings, node) => {
            const original = node.getText();
            const body = (node.expression.arguments[1] as ts.FunctionExpression).body.getText();
            bindings.onDomContentLoaded = { original, body }
        }
    });

    // extract the xmlhttpreq call
    tsOnReadyCollectors.push({
        matches: tsNodeIsHttpOpen,
        apply: (bindings, node) => {
            const url = node.expression.arguments[1].raw;
            const callback = '{ params.api.setRowData(data); }';

            bindings.data = { url, callback };
        }
    });

    // extract the simpleHttpRequest call
    tsOnReadyCollectors.push({
        matches: tsNodeIsSimpleFetchRequest,
        apply: (bindings, node) => {
            const url = node.arguments[0].getText();
            const callback = tsGenerate(node.parent.parent.parent.parent.arguments[0].body, tsTree).replace(/gridOptions/g, 'params');

            bindings.data = { url, callback };
        }
    });

    // extract the resizeColumnsToFit
    tsOnReadyCollectors.push({
        matches: node => {
            if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && ts.isPropertyAccessExpression(node.expression.expression)) {
                //
                if (node.expression.expression.name.getText() === 'sizeColumnsToFit') {
                    const domContentLoaded = node.parent?.parent?.parent as any;
                    // Make sure its a top level call to sizeColumnsToFit and not part of a setTimeout of the fetch body
                    if (ts.isCallExpression(domContentLoaded) && domContentLoaded.arguments.length > 0) {
                        return domContentLoaded.arguments[0].getText() === "'DOMContentLoaded'";
                    }
                }
            };
        },
        apply: bindings => {
            bindings.resizeToFit = true;
        }
    });

    // extract onready
    tsCollectors.push({
        matches: tsNodeIsDocumentContentLoaded,
        apply: (bindings, node) => {
            return tsCollect(node.expression.arguments[1].body, bindings, tsOnReadyCollectors)
        }

    });

    // all onXXX will be handled here
    // note: gridOptions = { onGridSizeChanged = function() {}  WILL NOT WORK
    // needs to be a separate function  gridOptions = { onGridSizeChanged = myGridSizeChangedFunc
    // ALSO event must match function name: onColumnPinned: onColumnPinned (not onColumnPinned: someOtherFunc)
    EVENTS.forEach(eventName => {
        const onEventName = 'on' + eventName.replace(/^\w/, w => w.toUpperCase());

        registered.push(onEventName);

        tsCollectors.push({
            matches: node => tsNodeIsFunctionWithName(node, onEventName),
            apply: (bindings, node) => {
                bindings.eventHandlers.push({
                    name: eventName,
                    handlerName: onEventName,
                    handler: tsGenerateWithReplacedGridOptions(node, tsTree)
                });
            }
        });
    });

    FUNCTION_PROPERTIES.forEach(functionName => {
        registered.push(functionName);

        tsCollectors.push({
            matches: (node: ts.Node) => tsNodeIsFunctionWithName(node, functionName),
            apply: (bindings, node: ts.NamedDeclaration) => {
                const methodText = tsGenerateWithReplacedGridOptions(node, tsTree);
                bindings.instanceMethods.push(methodText);
                bindings.properties.push({ name: functionName, value: null });
            }
        });
    });

    const tsExtractColDefsStr = (node: any): string => {
        let copyOfColDefs = [];

        // for each column def
        for (let columnDefIndex = 0; columnDefIndex < node.elements.length; columnDefIndex++) {
            const columnDef = node.elements[columnDefIndex];

            if (!ts.isObjectLiteralExpression(columnDef)) {
                // if we find any column defs that aren't objects (e.g. are references to objects instead), give up
                return;
            }

            // for each col def property
            let props = [];
            for (let colDefPropertyIndex = 0; colDefPropertyIndex < columnDef.properties.length; colDefPropertyIndex++) {
                const columnDefProperty: any = columnDef.properties[colDefPropertyIndex];

                if (columnDefProperty.name.getText() === 'children') {

                    const children = tsExtractColDefsStr(columnDefProperty.initializer);
                    props.push(`children: ${children}`)

                } else {
                    props.push(`${tsConvertFunctionsIntoStringsStr(columnDefProperty)}`);
                }
            }
            if (props.length > 0) {
                let propStr = props.length === 1 ? `{ ${props.join()} }` : `{\n        ${props.join(',\n    ')} }`;
                copyOfColDefs.push(propStr);
            }
        }
        return `[${copyOfColDefs.join(',\n    ')}]`;
    };

    const tsConvertFunctionsIntoStringsStr = (property: any): string => {
        if (ts.isIdentifier(property.initializer)) {

            return `${property.name.text}: 'AG_LITERAL_${property.initializer.escapedText}'`;
        } else if (ts.isFunctionExpression(property.initializer)) {
            const func = tsGenerate(property.initializer, tsTree);
            const escaped = func
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'")
                .replace(/"/g, "\\\"")
                .replace(/\n/g, "\\n");
            return `${property.name.text}: "AG_FUNCTION_${escaped}"`;

        } else if (ts.isObjectLiteralExpression(property.initializer)) {

            let objProps = [];
            property.initializer.properties.forEach(p => {
                objProps.push(tsConvertFunctionsIntoStringsStr(p));
            });

            const props = objProps.length === 1 ? `{ ${objProps.join(',\n    ')} }` : `{\n    ${objProps.join(',\n    ')}\n }`;
            return `${property.name.text} : ${props}`;
        }
        return tsGenerate(property, tsTree);
    };

    const tsExtractAndParseColDefs = (node) => {
        const colDefs = tsExtractColDefsStr(node);
        return colDefs || '';
    };

    PROPERTIES.forEach(propertyName => {
        registered.push(propertyName);

        // grab global variables named as grid properties
        tsCollectors.push({
            matches: node => tsNodeIsGlobalVarWithName(node, propertyName),
            apply: (bindings, node) => {
                try {
                    if (processColDefsForFunctionalReactOrVue(propertyName, exampleType, exampleSettings, providedExamples)) {
                        if (ts.isVariableDeclaration(node) && ts.isArrayLiteralExpression(node.initializer)) {
                            bindings.parsedColDefs = tsExtractAndParseColDefs(node.initializer);
                        }
                    }
                    const code = tsGenerate(node.initializer, tsTree);
                    bindings.properties.push({ name: propertyName, value: code });
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                    throw e;
                }
            }
        });

        tsGridOptionsCollectors.push({
            matches: (node: ts.Node) => tsNodeIsPropertyWithName(node, propertyName),
            apply: (bindings, node: ts.Node) => {
                if (processColDefsForFunctionalReactOrVue(propertyName, exampleType, exampleSettings, providedExamples)) {
                    const parent = node.parent;
                    if (ts.isPropertyAssignment(parent) && parent.initializer) {
                        const initializer = parent.initializer
                        if (ts.isArrayLiteralExpression(initializer)) {
                            bindings.parsedColDefs = tsExtractAndParseColDefs(initializer);
                        }
                    }
                }
                if (processComponentsForVue(propertyName, exampleType, providedExamples) && node.parent) {
                    const compsNode = (node.parent as any).initializer;
                    if (ts.isObjectLiteralExpression(compsNode)) {
                        for (const componentDefinition of compsNode.properties) {
                            const comp = componentDefinition as any;
                            if (!ts.isCallExpression(comp.initializer) && !ts.isFunctionExpression(comp.initializer)) {
                                bindings.components.push({
                                    name: comp.name.getText(),
                                    value: comp.initializer.getText()
                                });
                            }
                        }
                    }
                }

                if (processDefaultColumnDefForVue(propertyName, exampleType, providedExamples)
                    && node.parent && (node.parent as any).initializer
                    && ts.isObjectLiteralExpression((node.parent as any).initializer)) {
                    bindings.defaultColDef = tsGenerate((node.parent as any).initializer, tsTree);
                }

                if (processGlobalComponentsForVue(propertyName, exampleType, providedExamples) && ts.isIdentifier(node)) {
                    bindings.globalComponents.push(tsGenerate(node.parent, tsTree));
                }

                bindings.properties.push({
                    name: propertyName,
                    value: tsGenerate((node.parent as any).initializer, tsTree)
                });
            }
        });
    });

    tsGridOptionsCollectors.push({
        matches: node => tsNodeIsPropertyWithName(node, 'onGridReady'),
        apply: (bindings, node) => {
            bindings.onGridReady = tsGenerate((node.parent as any).initializer.body, tsTree).replace(/gridOptions/g, 'params');
        }
    });

    // gridOptionsCollectors captures all events, properties etc that are related to gridOptions
    tsCollectors.push({
        matches: node => tsNodeIsGlobalVarWithName(node, 'gridOptions'),
        apply: (bindings, node) => {

            node.initializer.properties.forEach(prop => {
                bindings = tsCollect(prop, bindings, tsGridOptionsCollectors, false)
            });

            return bindings;
        }
    });

    /*
     * externalEventHandlers -> onclick, onchange etc in index.html
     * eventHandlers -> grid related events
     * properties -> grid related properties
     * components -> name value pair of component name to actual component (ie name: myCustomCell, value: CustomCellRenderer)
     * parsedColDefs -> col defs with function values replaced with tokenised strings - for the functional react example generator
     * utils -> none grid related methods/variables (or methods that don't reference the gridApi/columnApi) (i.e. non-instance)
     * instanceMethods -> methods that are either marked as "inScope" or ones that reference the gridApi/columnApi
     * onGridReady -> any matching onGridReady method
     * data -> url: dataUrl, callback: callback, http calls etc
     * resizeToFit -> true if sizeColumnsToFit is used
     * callbackDependencies -> lookup of function name to function external deps for react useCallback
     * onDomContentLoaded -> used by Typescript example to unwrap the OnDomContentLoaded function
     */
    const tsBindings = tsCollect(
        tsTree,
        {
            eventHandlers: [],
            properties: [],
            components: [],
            defaultColDef: null,
            globalComponents: [],
            parsedColDefs: '',
            instanceMethods: [],
            externalEventHandlers: [],
            utils: [],
            callbackDependencies: {},
            onDomContentLoaded: {}
        },
        tsCollectors
    );

    const gridElement = domTree.find('#myGrid').replaceWith(templatePlaceholder);
    const inlineClass = gridElement.attr('class');
    const inlineHeight = gridElement.css('height');
    const inlineWidth = gridElement.css('width');

    if (inlineClass) {
        const theme = inlineClass.split(' ').filter(className => className.indexOf('ag-theme') >= 0);
        exampleSettings.theme = theme && theme.length > 0 ? theme[0] : 'ag-theme-alpine';
    }

    if (parseInt(inlineHeight)) {
        exampleSettings.height = inlineHeight;
    }

    if (parseInt(inlineWidth)) {
        exampleSettings.width = inlineWidth;
    }

    tsBindings.template = domTree.html().replace(/<br>/g, '<br />');

    tsBindings.gridSettings = {
        width: '100%',
        height: '100%',
        theme: 'ag-theme-alpine',
        ...exampleSettings
    };

    return tsBindings;
}

export default parser;
