import * as $ from 'jquery';
import * as ts from 'typescript';
import { Events } from '../../../../grid-community-modules/core/src/ts/eventKeys';
import { PropertyKeys } from '../../../../grid-community-modules/core/src/ts/propertyKeys';
import {
    extractClassDeclarations,
    extractEventHandlers,
    extractImportStatements,
    extractInterfaces,
    extractTypeDeclarations,
    extractUnboundInstanceMethods,
    findAllAccessedProperties,
    findAllVariables,
    getTypes,
    parseFile,
    readAsJsFile,
    recognizedDomEvents,
    removeInScopeJsDoc,
    tsCollect,
    tsGenerate,
    tsNodeIsFunctionCall,
    tsNodeIsFunctionWithName,
    tsNodeIsGlobalVarWithName,
    tsNodeIsInScope,
    tsNodeIsPropertyWithName,
    tsNodeIsTopLevelFunction,
    tsNodeIsTopLevelVariable,
    tsNodeIsTypeDeclaration,
    tsNodeIsUnusedFunction
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
    if (propertyName === 'components' || propertyName === 'frameworkComponents') {
        return exampleType === 'generated' || (exampleType === 'mixed' && !(providedExamples['vue'] && providedExamples['vue3']));
    }

    return false;
}

function processVueProperties(propertyName: string, exampleType, providedExamples) {
    if (propertyName === 'statusBar' || propertyName === 'sideBar') {
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

export function parser(examplePath, fileName, srcFile, html, exampleSettings, exampleType, providedExamples) {
    const bindings = internalParser(examplePath, { fileName, srcFile, includeTypes: false }, html, exampleSettings, exampleType, providedExamples);
    const typedBindings = internalParser(examplePath, { fileName, srcFile, includeTypes: true }, html, exampleSettings, exampleType, providedExamples);
    return { bindings, typedBindings };
}

/** Creating a TS program takes about half a second which quickly gets very expensive. As we only need it to access the same GridOptions file we cache the first program that finds this. */
let cachedProgram = undefined
function getTypeLookupFunc(includeTypes, fileName) {
    let lookupType = (propName: string) => undefined;
    if (includeTypes) {
        const program = cachedProgram || ts.createProgram([fileName], {});
        program.getTypeChecker(); // does something important to make types work below

        const optionsFile = program.getSourceFiles().find(f => f.fileName.endsWith('gridOptions.d.ts'));
        if (optionsFile) {
            cachedProgram = program;
            const gridOptionsInterface = optionsFile.statements.find((i: ts.Node) => ts.isInterfaceDeclaration(i) && i.name.getText() == 'GridOptions') as ts.InterfaceDeclaration;

            lookupType = (propName: string) => {

                const pop = gridOptionsInterface.members.find(m => (ts.isPropertySignature(m) || ts.isMethodSignature(m)) && m.name.getText() == propName) as ts.PropertySignature | ts.MethodSignature;
                if (pop && pop.type) {
                    return { typeName: pop.type.getText(), typesToInclude: getTypes(pop.type) };
                } else {
                    console.warn(`Could not find GridOptions property ${propName} for example file ${fileName}`);
                }
                return undefined;
            }
        } else {
            console.warn('Could not find GridOptions file for ', fileName);
        }
    }
    return lookupType;
}

function internalParser(examplePath, { fileName, srcFile, includeTypes }, html, exampleSettings, exampleType, providedExamples) {
    const domTree = $(`<div>${html}</div>`);
    domTree.find('style').remove();
    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);

    const tsTree = includeTypes ? parseFile(srcFile) : parseFile(readAsJsFile(srcFile));
    const gridOpsTypeLookup = getTypeLookupFunc(includeTypes, fileName);

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

    tsCollectors.push({
        matches: node => tsNodeIsTypeDeclaration(node),
        apply: (bindings, node) => {
            const declaration = tsGenerate(node, tsTree);
            bindings.declarations.push(declaration)
        }
    });

    // For React we need to identify the external dependencies for callbacks to prevent stale closures
    const GLOBAL_DEPS = new Set(['console', 'document', 'Error', 'this'])
    tsCollectors.push({
        matches: node => tsNodeIsTopLevelFunction(node),
        apply: (bindings, node: ts.SignatureDeclaration) => {

            const body = (node as any).body

            let allVariables = new Set(body ? findAllVariables(body) : []);
            if (node.parameters && node.parameters.length > 0) {
                node.parameters.forEach(p => {
                    allVariables.add(p.name.getText())
                })
            }

            const deps = body ? findAllAccessedProperties(body) : [];
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

    // extract the xmlhttpreq call
    tsOnReadyCollectors.push({
        matches: tsNodeIsHttpOpen,
        apply: (bindings, node) => {
            const url = node.expression.arguments[1].raw;
            const callback = '{ params.api.setRowData(data); }';

            bindings.data = { url, callback };
        }
    });

    // extract the Http Request call
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
            }
            ;
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
    // note: gridOptions = { onGridSizeChanged = function() {}  handled below    
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

    EVENTS.forEach(eventName => {
        const onEventName = 'on' + eventName.replace(/^\w/, w => w.toUpperCase());
        tsGridOptionsCollectors.push({
            // onGridReady is handled separately
            matches: node => tsNodeIsPropertyWithName(node, onEventName) && onEventName !== 'onGridReady',
            apply: (bindings, node: ts.PropertyAssignment) => {
                // Find any inline arrow functions or functions for events and convert to external function definition
                const eventHandler = tsGenerateWithReplacedGridOptions(node.initializer, tsTree);
                const functionHandler = ts.isArrowFunction(node.initializer)
                    ? eventHandler
                        // (event: RowEditingStoppedEvent) => {  
                        .replace(/^(\(.*?\)) (=>) {/, `function ${onEventName} $1 {`)
                        // event => {}
                        .replace(/^(\w*?) (=>) {/, `function ${onEventName} ($1) {`)
                    : eventHandler.replace('function', 'function ' + onEventName)

                bindings.eventHandlers.push({
                    name: eventName,
                    handlerName: onEventName,
                    handler: functionHandler
                });
            }
        });
    })

    FUNCTION_PROPERTIES.forEach(functionName => {
        registered.push(functionName);

        tsCollectors.push({
            matches: (node: ts.Node) => tsNodeIsFunctionWithName(node, functionName),
            apply: (bindings, node: ts.NamedDeclaration) => {
                const methodText = tsGenerateWithReplacedGridOptions(node, tsTree);
                bindings.instanceMethods.push(methodText);
                bindings.properties.push({ name: functionName, value: null, typings: gridOpsTypeLookup(functionName) });
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

    const tsArrayStr = (node: any): string => {
        let copyOfArray = [];

        // for each item in the array
        for (let index = 0; index < node.elements.length; index++) {
            const item = node.elements[index];

            if (!ts.isObjectLiteralExpression(item)) {
                copyOfArray.push(tsGenerate(item, tsTree));
            } else {

                // for each property
                let props = [];
                for (let colDefPropertyIndex = 0; colDefPropertyIndex < item.properties.length; colDefPropertyIndex++) {
                    const columnDefProperty: any = item.properties[colDefPropertyIndex];
                    props.push(`${tsConvertFunctionsIntoStringsStr(columnDefProperty)}`);
                }
                if (props.length > 0) {
                    let propStr = props.length === 1 ? `{ ${props.join()} }` : `{\n        ${props.join(',\n    ')} }`;
                    copyOfArray.push(propStr);
                }
            }
        }
        return `[${copyOfArray.join(',\n    ')}]`;
    };

    const tsConvertFunctionsIntoStringsStr = (property: any): string => {
        if (ts.isIdentifier(property.initializer)) {
            return `${property.name.text}: 'AG_LITERAL_${property.initializer.escapedText}'`;
        } else if (ts.isFunctionLike(property.initializer)) {
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
        } else if (ts.isArrayLiteralExpression(property.initializer)) {
            const result = tsArrayStr(property.initializer)
            return `${property.name.text} : ${result}`;
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
                    bindings.properties.push({ name: propertyName, value: code, typings: gridOpsTypeLookup(propertyName) });
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                    throw e;
                }
            }
        });

        tsGridOptionsCollectors.push({
            matches: (node: ts.Node) => tsNodeIsPropertyWithName(node, propertyName),
            apply: (bindings, node: ts.PropertyAssignment) => {
                if (processColDefsForFunctionalReactOrVue(propertyName, exampleType, exampleSettings, providedExamples)) {
                    const parent = node;
                    if (ts.isPropertyAssignment(parent) && parent.initializer) {
                        const initializer = parent.initializer
                        if (ts.isArrayLiteralExpression(initializer)) {
                            bindings.parsedColDefs = tsExtractAndParseColDefs(initializer);
                        }
                    }
                }
                if (processComponentsForVue(propertyName, exampleType, providedExamples)) {
                    const compsNode = node.initializer;
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
                if (processVueProperties(propertyName, exampleType, providedExamples)) {
                    if (ts.isObjectLiteralExpression(node.initializer)) {
                        const props = [];
                        for (const property of node.initializer.properties) {
                            if (ts.isArrayLiteralExpression((property as any).initializer)) {
                                props.push(`${property.name.getText()}:${tsArrayStr((property as any).initializer)}`);
                            } else {
                                props.push(`${property.name.getText()}:${(property as any).initializer.getText()}`);
                            }
                        }
                        if (props.length > 0) {
                            const propStr = props.length === 1 ? `{ ${props.join()} }` : `{\n        ${props.join(',\n    ')} }`;
                            bindings.vuePropertyBindings[propertyName] = propStr;
                        }
                    }
                }
                if (processDefaultColumnDefForVue(propertyName, exampleType, providedExamples)
                    && node.initializer
                    && ts.isObjectLiteralExpression(node.initializer)) {
                    bindings.defaultColDef = tsGenerate(node.initializer, tsTree);
                }

                if (processGlobalComponentsForVue(propertyName, exampleType, providedExamples) && ts.isIdentifier(node)) {
                    bindings.globalComponents.push(tsGenerate(node, tsTree));
                }

                bindings.properties.push({
                    name: propertyName,
                    value: tsGenerate(node.initializer, tsTree),
                    typings: gridOpsTypeLookup(propertyName)
                });
            }
        });
    });

    tsGridOptionsCollectors.push({
        matches: node => tsNodeIsPropertyWithName(node, 'onGridReady'),
        apply: (bindings, node: ts.PropertyAssignment) => {
            if (node.initializer) {
                bindings.onGridReady = tsGenerate((node.initializer as any).body, tsTree).replace(/gridOptions/g, 'params');
            } else {
                console.error(node.getText())
            }
        }
    });

    // gridOptionsCollectors captures all events, properties etc that are related to gridOptions
    tsCollectors.push({
        matches: node => tsNodeIsGlobalVarWithName(node, 'gridOptions'),
        apply: (bindings, node) => {
            if (node.type?.typeArguments?.length > 0) {
                bindings.tData = node.type.typeArguments[0].getText();
            }
            bindings = tsCollect(node.initializer, bindings, tsGridOptionsCollectors, false);
            return bindings;
        }
    });

    /*
     * externalEventHandlers -> onclick, onchange etc in index.html
     * eventHandlers -> grid related events
     * properties -> grid related properties
     * components -> name value pair of component name to actual component (ie name: myCustomCell, value: CustomCellRenderer)
     * vuePropertyBindings => vue specific property bindings that can be safely parsed by the vue generators
     * parsedColDefs -> col defs with function values replaced with tokenised strings - for the functional react example generator
     * utils -> none grid related methods/variables (or methods that don't reference the gridApi/columnApi) (i.e. non-instance)
     * instanceMethods -> methods that are either marked as "inScope" or ones that reference the gridApi/columnApi
     * onGridReady -> any matching onGridReady method
     * data -> url: dataUrl, callback: callback, http calls etc
     * resizeToFit -> true if sizeColumnsToFit is used
     * callbackDependencies -> lookup of function name to function external deps for react useCallback
     * declarations -> Typescript examples add declarations when working with globally defined javascript functions / variables
     * imports -> imports used by Typescript code
     */
    const tsBindings = tsCollect(
        tsTree,
        {
            eventHandlers: [],
            properties: [],
            components: [],
            vuePropertyBindings: {},
            defaultColDef: null,
            globalComponents: [],
            parsedColDefs: '',
            instanceMethods: [],
            externalEventHandlers: [],
            utils: [],
            declarations: [],
            callbackDependencies: {},
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
    tsBindings.imports = extractImportStatements(tsTree);
    tsBindings.typeDeclares = extractTypeDeclarations(tsTree);
    tsBindings.classes = extractClassDeclarations(tsTree);
    tsBindings.interfaces = extractInterfaces(tsTree);
    tsBindings.exampleName = examplePath;
    tsBindings.gridSettings = {
        width: '100%',
        height: '100%',
        theme: 'ag-theme-alpine',
        ...exampleSettings
    };

    return tsBindings;
}

export default parser;
