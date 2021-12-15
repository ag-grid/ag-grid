import { generate } from 'escodegen';
import * as esprima from 'esprima';
import * as ts from 'typescript'
import { Events } from '../../../../community-modules/core/src/ts/eventKeys';
import { PropertyKeys } from '../../../../community-modules/core/src/ts/propertyKeys';
import * as $ from 'jquery';
import {
    collect,
    extractEventHandlers,
    extractUnboundInstanceMethods,
    nodeIsFunctionCall,
    nodeIsFunctionWithName,
    nodeIsInScope,
    nodeIsPropertyWithName,
    nodeIsUnusedFunction,
    nodeIsVarWithName,
    NodeType,
    recognizedDomEvents,
    tsCollect,
    tsNodeIsFunctionCall,
    tsNodeIsFunctionWithName,
    tsNodeIsPropertyWithName,
    tsNodeIsUnusedFunction,
    tsNodeIsGlobalVarWithName,
} from './parser-utils';

export const templatePlaceholder = 'GRID_TEMPLATE_PLACEHOLDER';

const EVENTS = (<any>Object).values(Events);
const PROPERTIES = PropertyKeys.ALL_PROPERTIES;
const FUNCTION_PROPERTIES = PropertyKeys.FUNCTION_PROPERTIES;

function nodeIsDocumentContentLoaded(node) {
    try {
        return nodeIsFunctionCall(node) &&
            node.expression.arguments.length > 0 &&
            node.expression.arguments[0].type === 'Literal' &&
            node.expression.arguments[0].value === 'DOMContentLoaded';
    } catch (e) {
        console.error('We found something which we do not understand', node);
    }
}
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

function nodeIsHttpOpen(node) {
    const callee = node.expression && node.expression.callee;
    const calleeObject = callee && callee.object;

    return node.type === NodeType.Expression &&
        calleeObject &&
        calleeObject.name === 'httpRequest' &&
        callee.property.name === 'open';
}
function tsNodeIsHttpOpen(node) {
    const callee = node.expression && node.expression.callee;
    const calleeObject = callee && callee.object;

    return ts.isExpressionStatement(node) &&
        calleeObject &&
        calleeObject.name === 'httpRequest' &&
        callee.property.name === 'open';
}

function nodeIsSimpleFetchRequest(node) {
    const calleeObject = node.expression && node.expression.callee && node.expression.callee.object;
    const calleeName = calleeObject && calleeObject.callee && calleeObject.callee.object && calleeObject.callee.object.callee && calleeObject.callee.object.callee.name;
    return calleeName && calleeName === 'fetch';
}
function tsNodeIsSimpleFetchRequest(node) {
    if (ts.isCallExpression(node)) {
        node = node as any;
        const isFetch = ts.isCallExpression(node) && node.expression.getText() === 'fetch';
        return isFetch;

    }
}

function generateWithReplacedGridOptions(node, options?) {
    return generate(node, options)
        .replace(/gridOptions\.api/g, 'this.gridApi')
        .replace(/gridOptions\.columnApi/g, 'this.gridColumnApi');
}

// export interface PrinterOptions {
//     removeComments?: boolean;
//     newLine?: NewLineKind;
//     omitTrailingSemicolon?: boolean;
//     noEmitHelpers?: boolean;
// }
const printer = ts.createPrinter({ removeComments: false, omitTrailingSemicolon: false });

function tsGenerate(node, srcFile) {
    try {
        if (!node) {
            return ''
        }
        return printer.printNode(ts.EmitHint.Unspecified, node, srcFile);
    } catch (error) {
        console.error(error);
    }
    return "ERROR - Printing";
}

function tsGenerateWithReplacedGridOptions(node, srcFile) {
    return tsGenerate(node, srcFile)
        .replace(/gridOptions\.api/g, 'this.gridApi')
        .replace(/gridOptions\.columnApi/g, 'this.gridColumnApi');
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

function parseFile(src) {
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

export function parser(js, html, exampleSettings, exampleType, providedExamples) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tsTree = parseFile(js);
    const tree = esprima.parseScript(js, { comment: true });
    const collectors = [];
    const tsCollectors = [];
    const gridOptionsCollectors = [];
    const tsGridOptionsCollectors = [];
    const onReadyCollectors = [];
    const tsOnReadyCollectors = [];
    const indentOne = { format: {} };
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
            matches: node => nodeIsFunctionWithName(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: generateWithReplacedGridOptions(node)
                });
            }
        });
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
    const unboundInstanceMethods = extractUnboundInstanceMethods(tree);
    collectors.push({
        matches: node => nodeIsInScope(node, unboundInstanceMethods),
        apply: (bindings, node) => bindings.instanceMethods.push(generateWithReplacedGridOptions(node, indentOne))
    });

    // anything not marked as "inScope" and not handled above in the eventHandlers is considered an unused/util method
    collectors.push({
        matches: node => nodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => bindings.utils.push(generate(node).replace(/gridOptions/g, 'gridInstance'))
    });
    tsCollectors.push({
        matches: node => tsNodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => {
            const util = tsGenerate(node, tsTree).replace(/gridOptions/g, 'gridInstance');
            bindings.utils.push(util)
        }
    });

    // anything vars not handled above in the eventHandlers is considered an unused/util method
    collectors.push({
        matches: node => node.type === NodeType.Variable && registered.indexOf(node.declarations[0].id.name) < 0,
        apply: (bindings, node) => bindings.utils.push(generate(node))
    });
    tsCollectors.push({
        matches: node => {
            if (ts.isVariableDeclarationList(node)) {
                // Not registered already and are a top level variable declaration so that we do not match
                // variables within function scopes
                return registered.indexOf(node.declarations[0].name.getText()) < 0 && ts.isSourceFile(node.parent.parent);
            }
        },
        apply: (bindings, node) => bindings.utils.push(tsGenerate(node.parent, tsTree))
    });

    // extract the xmlhttpreq call
    onReadyCollectors.push({
        matches: nodeIsHttpOpen,
        apply: (bindings, node) => {
            const url = node.expression.arguments[1].raw;
            const callback = '{ params.api.setRowData(data); }';

            bindings.data = { url, callback };
        }
    });
    tsOnReadyCollectors.push({
        matches: tsNodeIsHttpOpen,
        apply: (bindings, node) => {
            const url = node.expression.arguments[1].raw;
            const callback = '{ params.api.setRowData(data); }';

            bindings.data = { url, callback };
        }
    });

    // extract the simpleHttpRequest call
    onReadyCollectors.push({
        matches: nodeIsSimpleFetchRequest,
        apply: (bindings, node) => {
            const url = node.expression.callee.object.callee.object.arguments[0].raw;
            const callback = generate(node.expression.arguments[0].body).replace(/gridOptions/g, 'params');

            bindings.data = { url, callback };
        }
    });
    tsOnReadyCollectors.push({
        matches: tsNodeIsSimpleFetchRequest,
        apply: (bindings, node) => {
            const url = node.arguments[0].getText();
            const callback = tsGenerate(node.parent.parent.parent.parent.arguments[0].body, tsTree).replace(/gridOptions/g, 'params');

            bindings.data = { url, callback };
        }
    });

    // extract the resizeColumnsToFit
    onReadyCollectors.push({
        matches: node => node.expression &&
            node.expression.callee &&
            node.expression.callee.property &&
            node.expression.callee.property.name == 'sizeColumnsToFit',
        apply: bindings => {
            bindings.resizeToFit = true;
        }
    });
    tsOnReadyCollectors.push({
        matches: node => node.expression &&
            node.expression.callee &&
            node.expression.callee.property &&
            node.expression.callee.property.name == 'sizeColumnsToFit',
        apply: bindings => {
            bindings.resizeToFit = true;
        }
    });

    // extract onready
    collectors.push({
        matches: nodeIsDocumentContentLoaded,
        apply: (bindings, node) => collect(node.expression.arguments[1].body.body, bindings, onReadyCollectors)
    });
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

        collectors.push({
            matches: node => nodeIsFunctionWithName(node, onEventName),
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
            matches: node => nodeIsFunctionWithName(node, functionName),
            apply: (bindings, node) => {
                bindings.instanceMethods.push(generateWithReplacedGridOptions(node, indentOne));
                bindings.properties.push({ name: functionName, value: null });
            }
        });

        tsCollectors.push({
            matches: (node: ts.Node) => tsNodeIsFunctionWithName(node, functionName),
            apply: (bindings, node: ts.NamedDeclaration) => {
                const methodText = tsGenerateWithReplacedGridOptions(node, tsTree);
                bindings.instanceMethods.push(methodText);
                bindings.properties.push({ name: functionName, value: null });
            }
        });
    });


    const extractColDefs = (node) => {
        const copyOfColDefs = JSON.parse(JSON.stringify(node));

        // for each column def
        for (let columnDefIndex = 0; columnDefIndex < copyOfColDefs.elements.length; columnDefIndex++) {
            const columnDef = copyOfColDefs.elements[columnDefIndex];

            if (columnDef.type !== 'ObjectExpression') {
                // if we find any column defs that aren't objects (e.g. are references to objects instead), give up
                return null;
            }

            // for each col def property
            for (let colDefPropertyIndex = 0; colDefPropertyIndex < columnDef.properties.length; colDefPropertyIndex++) {
                const columnDefProperty = columnDef.properties[colDefPropertyIndex];

                if (columnDefProperty.key.name === 'children') {
                    const children = extractColDefs(columnDefProperty.value);
                    columnDefProperty.value = children;
                } else {
                    convertFunctionsIntoStrings(columnDefProperty);
                }
            }
        }

        return copyOfColDefs;
    };

    const tsExtractColDefsStr = (node: any): string => {
        let copyOfColDefs = [];

        // for each column def
        for (let columnDefIndex = 0; columnDefIndex < node.elements.length; columnDefIndex++) {
            const columnDef = node.elements[columnDefIndex];

            if (!ts.isObjectLiteralExpression(columnDef)) {
                // if we find any column defs that aren't objects (e.g. are references to objects instead), give up
                copyOfColDefs.push(columnDef.name.getText())
            }

            // for each col def property
            let props = [];
            for (let colDefPropertyIndex = 0; colDefPropertyIndex < columnDef.properties.length; colDefPropertyIndex++) {
                const columnDefProperty: any = columnDef.properties[colDefPropertyIndex];

                if (columnDefProperty.name.getText() === 'children') {

                    const children = tsExtractColDefsStr(columnDefProperty.initializer);
                    props.push(`children: [${children}]`)

                } else {
                    props.push(`${tsConvertFunctionsIntoStringsStr(columnDefProperty)}`);
                }
            }
            if (props.length > 0) {
                let propStr = props.length === 1 ? `{ ${props.join()} }` : `{\n        ${props.join(',\n    ')} }`;
                copyOfColDefs.push(propStr);
            }

        }
        return `[\n    ${copyOfColDefs.join(',\n    ')} \n]`;
    };

    const convertFunctionsIntoStrings = property => {
        if (property.value.type === 'Identifier') {
            property.value.type = 'Literal';
            property.value.value = `AG_LITERAL_${property.value.name}`;
        } else if (property.value.type === 'FunctionExpression') {
            const func = generate(property.value);

            property.value.type = 'Literal';
            property.value.value = `AG_FUNCTION_${func}`;
        } else if (property.value.type === 'ObjectExpression') {
            property.value.properties.forEach(p => convertFunctionsIntoStrings(p));
        }
    };

    const tsConvertFunctionsIntoStringsStr = (property: any): string => {
        if (ts.isIdentifier(property.initializer)) {

            return `${property.name.text}: 'AG_LITERAL_${property.initializer.escapedText}'`;
        } else if (ts.isFunctionExpression(property.initializer)) {
            let func = tsGenerate(property.initializer, tsTree);
            const replaced = `${property.name.text}: "AG_FUNCTION_${func.replace(/'/g, "\'").replace(/\n/g, "\\n")}"`
            return replaced;

        } else if (ts.isObjectLiteralExpression(property.initializer)) {

            let objProps = [];
            property.initializer.properties.forEach(p => {
                objProps.push(tsConvertFunctionsIntoStringsStr(p));
            });

            return `${property.name.text} : {\n    ${objProps.join(',\n    ')}\n }`;
        }
        return tsGenerate(property, tsTree);
    };

    const extractAndParseColDefs = (node) => {
        const colDefs = extractColDefs(node);
        return colDefs ? generate(colDefs, indentOne) : '';
    };
    const tsExtractAndParseColDefs = (node) => {
        const colDefs = tsExtractColDefsStr(node);
        return colDefs;
        //return colDefs ? tsGenerate(colDefs, tsTree) : '';
    };

    PROPERTIES.forEach(propertyName => {
        registered.push(propertyName);

        // grab global variables named as grid properties
        collectors.push({
            matches: node => nodeIsVarWithName(node, propertyName),
            apply: (bindings, node) => {
                try {
                    if (processColDefsForFunctionalReactOrVue(propertyName, exampleType, exampleSettings, providedExamples) &&
                        node.declarations[0].init.type === 'ArrayExpression') {
                        bindings.parsedColDefs = extractAndParseColDefs(node.declarations[0].init);
                    }
                    const code = generate(node.declarations[0].init, indentOne);
                    bindings.properties.push({ name: propertyName, value: code });
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                    throw e;
                }
            }
        });
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

        gridOptionsCollectors.push({
            matches: node => nodeIsPropertyWithName(node, propertyName),
            apply: (bindings, node) => {
                if (processColDefsForFunctionalReactOrVue(propertyName, exampleType, exampleSettings, providedExamples) &&
                    node.value.type === 'ArrayExpression') {
                    bindings.parsedColDefs = extractAndParseColDefs(node.value);
                }
                if (processComponentsForVue(propertyName, exampleType, providedExamples) && node.value.type === 'ObjectExpression') {
                    for (const componentDefinition of node.value.properties) {
                        if (componentDefinition.value.type !== 'CallExpression' && componentDefinition.value.type !== 'FunctionExpression') {
                            bindings.components.push({
                                name: componentDefinition.key.type === 'Identifier' ? componentDefinition.key.name : componentDefinition.key.value,
                                value: componentDefinition.value.name
                            });
                        }
                    }
                }
                if (processDefaultColumnDefForVue(propertyName, exampleType, providedExamples) && node.value.type === 'ObjectExpression') {
                    bindings.defaultColDef = generate(node.value);
                }
                if (processGlobalComponentsForVue(propertyName, exampleType, providedExamples) && node.value.type === 'Literal') {
                    bindings.globalComponents.push(generate(node));
                }

                bindings.properties.push({
                    name: propertyName,
                    value: generate(node.value, indentOne)
                });
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

                if (processGlobalComponentsForVue(propertyName, exampleType, providedExamples) && ts.isLiteralExpression(node)) {
                    bindings.globalComponents.push(generate(node));
                }

                bindings.properties.push({
                    name: propertyName,
                    value: tsGenerate((node.parent as any).initializer, tsTree)
                });
            }
        });
    });

    gridOptionsCollectors.push({
        matches: node => nodeIsPropertyWithName(node, 'onGridReady'),
        apply: (bindings, node) => {
            bindings.onGridReady = generate(node.value.body).replace(/gridOptions/g, 'params');
        }
    });
    tsGridOptionsCollectors.push({
        matches: node => tsNodeIsPropertyWithName(node, 'onGridReady'),
        apply: (bindings, node) => {
            bindings.onGridReady = tsGenerate((node.parent as any).initializer.body, tsTree).replace(/gridOptions/g, 'params');
        }
    });

    // gridOptionsCollectors captures all events, properties etc that are related to gridOptions
    collectors.push({
        matches: node => nodeIsVarWithName(node, 'gridOptions'),
        apply: (bindings, node) => collect(node.declarations[0].init.properties, bindings, gridOptionsCollectors)
    });
    tsCollectors.push({
        matches: node => tsNodeIsGlobalVarWithName(node, 'gridOptions'),
        apply: (bindings, node) => {
            return tsCollect(node.initializer, bindings, tsGridOptionsCollectors);
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
     */
    const bindings = collect(
        tree.body,
        {
            eventHandlers: [],
            properties: [],
            components: [],
            defaultColDef: null,
            globalComponents: [],
            parsedColDefs: '',
            instanceMethods: [],
            externalEventHandlers: [],
            utils: []
        },
        collectors
    );
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
            utils: []
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
    }; bindings.template = domTree.html().replace(/<br>/g, '<br />');

    bindings.gridSettings = {
        width: '100%',
        height: '100%',
        theme: 'ag-theme-alpine',
        ...exampleSettings
    };

    //return bindings;
    return tsBindings;
}

export default parser;
