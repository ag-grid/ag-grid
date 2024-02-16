import * as cheerio from 'cheerio';
import type { SignatureDeclaration } from 'typescript';

import type { ExampleSettings } from '../types';
import {
    extractEventHandlers,
    extractImportStatements,
    extractTypeInfoForVariable,
    extractUnboundInstanceMethods,
    findAllAccessedProperties,
    findAllVariables,
    parseFile,
    readAsJsFile,
    recognizedDomEvents,
    removeInScopeJsDoc,
    tsCollect,
    tsGenerate,
    tsNodeIsFunctionCall,
    tsNodeIsFunctionWithName,
    tsNodeIsGlobalFunctionCall,
    tsNodeIsGlobalVar,
    tsNodeIsGlobalVarWithName,
    tsNodeIsInScope,
    tsNodeIsPropertyAccessExpressionOf,
    tsNodeIsPropertyWithName,
    tsNodeIsTopLevelFunction,
    tsNodeIsTopLevelVariable,
    tsNodeIsTypeDeclaration,
    tsNodeIsUnusedFunction,
    usesChartApi,
} from './parser-utils';

const chartVariableName = 'chart';
const optionsVariableName = 'options';
const REMOVE_ME = [
    optionsVariableName,
    'chartOptions1',
    'chartOptions2',
    'chartOptions3',
    'chartOptions4',
    'chartOptions5',
];
const PROPERTIES = REMOVE_ME;

function tsGenerateWithOptionReferences(node, srcFile) {
    return tsGenerate(node, srcFile).replace(new RegExp(`AgCharts\\.update\\(chart, options\\);?`, 'g'), '');
}

export function parser({
    srcFile,
    html,
    exampleSettings,
}: {
    srcFile: string;
    html: string;
    exampleSettings: ExampleSettings;
}) {
    const bindings = internalParser(readAsJsFile(srcFile, { includeImports: true }), html, exampleSettings);
    const typedBindings = internalParser(srcFile, html, exampleSettings);
    return { bindings, typedBindings };
}

export function internalParser(js, html, exampleSettings) {
    const domTree = cheerio.load(html, null, false);
    domTree('style').remove();

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
            matches: (node) => tsNodeIsFunctionWithName(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: tsGenerateWithOptionReferences(node, tsTree),
                });
            },
        });
    });

    const unboundInstanceMethods = extractUnboundInstanceMethods(tsTree);
    // functions marked as "inScope" will be added to "instance" methods, as opposed to "global" ones
    tsCollectors.push({
        matches: (node) => tsNodeIsInScope(node, unboundInstanceMethods),
        apply: (bindings, node) =>
            bindings.instanceMethods.push(removeInScopeJsDoc(tsGenerateWithOptionReferences(node, tsTree))),
    });

    // anything not marked as "inScope" is considered a "global" method
    tsCollectors.push({
        matches: (node) => tsNodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => bindings.globals.push(tsGenerate(node, tsTree)),
    });

    tsCollectors.push({
        matches: (node) => tsNodeIsPropertyWithName(node, 'container'),
        apply: (bindings, node) => {
            const { initializer } = node;
            if (
                !tsNodeIsFunctionCall(initializer) ||
                !tsNodeIsPropertyAccessExpressionOf(initializer.expression, ['document', 'getElementById'])
            ) {
                throw new Error('Invalid container definition (must be in form of document.getElementById)');
            }

            let propertyAssignment = node;
            while (propertyAssignment != null && !tsNodeIsGlobalVar(propertyAssignment)) {
                propertyAssignment = propertyAssignment.parent;
            }
            if (propertyAssignment == null || !tsNodeIsGlobalVar(propertyAssignment)) {
                throw new Error('AgChartOptions was not assigned to variable');
            }

            const propertyName = propertyAssignment.name.escapedText;
            const id = initializer.arguments[0].text;

            let code = tsGenerate(propertyAssignment.initializer, tsTree);
            code = code.replace(/container:.*/, '');

            registered.push(propertyName);
            bindings.chartProperties[id] = propertyName;
            bindings.properties.push({ name: propertyName, value: code });
        },
    });

    // anything vars is considered an "global" var
    tsCollectors.push({
        matches: (node) => tsNodeIsTopLevelVariable(node, registered),
        apply: (bindings, node) => {
            const code = tsGenerate(node, tsTree);

            // FIXME - removes AgChartOptions. There's got to be a better way to do this...
            if (code.includes('document.getElementById')) return;

            bindings.globals.push(code);
        },
    });

    // optionsCollectors captures all events, properties etc that are related to options
    tsCollectors.push({
        matches: (node) => tsNodeIsGlobalVarWithName(node, optionsVariableName),
        apply: (bindings, node) => {
            node.initializer.properties.forEach((prop) => {
                bindings = tsCollect(prop, bindings, tsOptionsCollectors, false);
            });

            return bindings;
        },
    });

    tsCollectors.push({
        matches: (node) => tsNodeIsGlobalFunctionCall(node),
        apply: (bindings, node) => bindings.init.push(tsGenerate(node, tsTree)),
    });

    tsCollectors.push({
        matches: (node) => tsNodeIsTypeDeclaration(node),
        apply: (bindings, node) => {
            const declaration = tsGenerate(node, tsTree);
            bindings.declarations.push(declaration);
        },
    });

    // For React we need to identify the external dependencies for callbacks to prevent stale closures
    const GLOBAL_DEPS = new Set([
        'console',
        'document',
        'Error',
        'AgCharts',
        'chart',
        'window',
        'Image',
        'Date',
        'this',
    ]);
    tsCollectors.push({
        matches: (node) => tsNodeIsTopLevelFunction(node),
        apply: (bindings, node: SignatureDeclaration) => {
            const body = (node as any).body;

            const allVariables = new Set(body ? findAllVariables(body) : []);
            if (node.parameters && node.parameters.length > 0) {
                node.parameters.forEach((p) => {
                    allVariables.add(p.name.getText());
                });
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
        },
    });

    /*
     * properties -> chart related properties
     * globals -> none chart related methods/variables (i.e. non-instance)
     */
    const tsBindings = tsCollect(
        tsTree,
        {
            properties: [],
            chartProperties: {},
            externalEventHandlers: [],
            instanceMethods: [],
            globals: [],
            init: [],
            declarations: [],
            callbackDependencies: {},
        },
        tsCollectors
    );

    // Must be record for serialization
    const placeholders: Record<string, string> = {};
    const chartAttributes: Record<string, Record<string, string>> = {};

    domTree('div[id]').each((index, elem) => {
        const { id, ...rest } = elem.attribs;
        const templatePlaceholder = `$$CHART${index}$$`;
        placeholders[id] = templatePlaceholder;
        chartAttributes[id] = rest;
        domTree(elem).replaceWith(templatePlaceholder);
    });

    tsBindings.placeholders = placeholders;
    tsBindings.chartAttributes = chartAttributes;
    tsBindings.template = domTree.html();
    tsBindings.imports = extractImportStatements(tsTree);
    tsBindings.optionsTypeInfo = extractTypeInfoForVariable(tsTree, 'options');
    tsBindings.usesChartApi = usesChartApi(tsTree);
    tsBindings.chartSettings = exampleSettings;

    return tsBindings;
}

export default parser;
