import ts = require("typescript");
const sucrase = require("sucrase");

export type ImportType = 'packages' | 'modules';

export interface BindingImport {
    isNamespaced: boolean;
    module: string;
    imports: string[];
}

const moduleMapping = require('../../documentation/doc-pages/modules/modules.json');

export function readAsJsFile(srcFile) {
    const tsFile = srcFile
        // Remove imports that are not required in javascript
        .replace(/import.*from.*\n/g, '')
        // Remove export statement
        .replace(/export /g, "")

    let jsFile = sucrase.transform(tsFile, { transforms: ["typescript"] }).code;

    return jsFile;
}

export function parseFile(src) {
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

// export interface PrinterOptions {
//     removeComments?: boolean;
//     newLine?: NewLineKind;
//     omitTrailingSemicolon?: boolean;
//     noEmitHelpers?: boolean;
// }
const printer = ts.createPrinter({ removeComments: false, omitTrailingSemicolon: false });

export function tsGenerate(node, srcFile) {
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

export function modulesProcessor(modules: string[]) {
    const moduleImports = [];
    const suppliedModules = [];

    const requiredModules = [];
    modules.forEach(module => {
        let found = false;
        moduleMapping.forEach(moduleConfig => {
            if (moduleConfig.shortname && moduleConfig.shortname == module) {
                requiredModules.push(moduleConfig);
                found = true;
            }
        });
        if (!found) {
            console.error(`Could not find module ${module} in modules.json`);
        }
    });

    requiredModules.forEach(requiredModule => {
        moduleImports.push(`import { ${requiredModule.exported} } from '${requiredModule.module}';`);
        suppliedModules.push(requiredModule.exported);
    });

    return { moduleImports, suppliedModules };
}

export function removeFunctionKeyword(code: string): string {
    return code.replace(/^function /, '')
        .replace(/\n\s?function /, '\n ');
}

export function getFunctionName(code: string): string {
    let matches = /function\s+([^\(\s]+)\(/.exec(code);
    return matches && matches.length === 2 ? matches[1].trim() : null;
}

export const convertFunctionToProperty = (code: string) =>
    code.replace(/function\s+([^\(\s]+)\s*\(([^\)]*)\)/, '$1 = ($2) =>');

export const convertFunctionToConstProperty = (code: string) =>
    code.replace(/function\s+([^\(\s]+)\s*\(([^\)]*)\)/, 'const $1 = ($2) =>');

export function isInstanceMethod(methods: string[], property: any): boolean {
    return methods.map(getFunctionName).filter(name => name === property.name).length > 0;
}

export const enum NodeType {
    Variable = 'VariableDeclaration',
    Function = 'FunctionDeclaration',
    Expression = 'ExpressionStatement',
}

export function tsCollect(tsTree, tsBindings, collectors, recurse = true) {
    ts.forEachChild(tsTree, (node: ts.Node) => {

        collectors.filter(c => {
            let res = false;
            try {
                res = c.matches(node)
            } catch (error) {
                return false;
            }
            return res;
        }
        ).forEach(c => {
            try {
                c.apply(tsBindings, node)
            } catch (error) {
                console.error(error)
            }
        });
        if (recurse) {
            tsCollect(node, tsBindings, collectors, recurse);
        }
    });
    return tsBindings;
}

export function collect(iterable: any[], initialBindings: any, collectors: any[]): any {

    const original = iterable.reduce((bindings, value) => {
        collectors.filter(c => c.matches(value)).forEach(c => c.apply(bindings, value));

        return bindings;
    }, initialBindings);

    return original;
}

export function nodeIsVarWithName(node: any, name: string): boolean {
    // eg: var currentRowHeight = 10;
    return node.type === NodeType.Variable && node.declarations[0].id.name === name;
}
export function tsNodeIsGlobalVarWithName(node: any, name: string): boolean {
    // eg: var currentRowHeight = 10;
    if (ts.isVariableDeclaration(node) && ts.isSourceFile(node.parent.parent.parent)) {
        return node.name.getText() === name;
    }
    return false;
}


export function nodeIsPropertyWithName(node: any, name: string) {
    // we skip { property: variable } - SPL why??
    // and get only inline property assignments
    return node.key.name == name && node.value.type != 'Identifier';
}
export function tsNodeIsPropertyWithName(node: ts.Node, name: string) {
    // we skip { property: variable } - SPL why??
    // and get only inline property assignments
    if (node.getText() === name) {
        return !ts.isIdentifier((node.parent as any).initializer);
    }
}

export function tsNodeIsTopLevelVariable(node: ts.Node, registered: string[] = []) {
    if (ts.isVariableDeclarationList(node)) {
        // Not registered already
        // are a top level variable declaration so that we do not match variables within function scopes
        // Is not just a type declaration i.e declare function getData: () => any[];
        if (node.declarations.length > 0) {
            const declaration = node.declarations[0];
            return !isDeclareStatement(node.parent) && registered.indexOf(declaration.name.getText()) < 0 && ts.isSourceFile(node.parent.parent);
        }
    }
}

export function nodeIsFunctionWithName(node: any, name: string): boolean {
    // eg: function someFunction() { }
    return node.type === NodeType.Function && node.id.name === name;
}
export function tsNodeIsFunctionWithName(node: ts.Node, name: string): boolean {
    // eg: function someFunction() { }
    if (ts.isFunctionDeclaration(node)) {
        const isMatch = node.name.getText() === name;
        return isMatch
    }
    return false;
}

export function tsNodeIsInScope(node: any, unboundInstanceMethods: string[]): boolean {
    return unboundInstanceMethods &&
        ts.isFunctionDeclaration(node) && node.name &&
        unboundInstanceMethods.indexOf(node.name.getText()) >= 0;
}

export function tsNodeIsUnusedFunction(node: any, used: string[], unboundInstanceMethods: string[]): boolean {
    if (!tsNodeIsInScope(node, unboundInstanceMethods)) {
        if (ts.isFunctionLike(node) && used.indexOf(node.name.getText()) < 0) {
            const isTopLevel = ts.isSourceFile(node.parent);
            return isTopLevel && !isDeclareStatement(node);
        }
    }
    return false;
}

function isDeclareStatement(node) {
    return node && node.modifiers && node.modifiers.some(m => m.getText() === 'declare');
}

export function tsNodeIsTypeDeclaration(node: any): boolean {
    if ((ts.isFunctionDeclaration(node) || ts.isVariableStatement(node))) {
        return isDeclareStatement(node);
    }
    return false;
}

export function nodeIsFunctionCall(node: any): boolean {
    return node.type === NodeType.Expression && node.expression.type === 'CallExpression';
}
export function tsNodeIsFunctionCall(node: any): boolean {
    return ts.isExpressionStatement(node) && ts.isCallExpression(node.expression);
}

export function tsNodeIsGlobalFunctionCall(node: ts.Node) {
    // Get top level function calls like 
    // setInterval(callback, 500)
    // but don't match things like
    // agCharts.AgChart.create(options)
    if (ts.isExpressionStatement(node)) {
        return ts.isSourceFile(node.parent) && ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression);
    }
}

export function nodeIsGlobalFunctionCall(node: any): boolean {
    if (!nodeIsFunctionCall(node)) {
        return false;
    }

    const { callee } = node.expression;

    return callee && callee.type === 'Identifier';
}

export const recognizedDomEvents = ['click', 'change', 'input', 'dragover', 'dragstart', 'drop'];

function flatMap<T>(array: T[], callback: (value: T) => T): T[] {
    return Array.prototype.concat.apply([], array.map(callback));
}

const extractEventHandlerBody = (code: string) => code.match(/^(\w+)\((.*)\)/);

/*
 * for each of the recognised events (click, change etc) extract the corresponding event handler, with (optional) params
 * eg: onclick="refreshEvenRowsCurrencyData()"
 */
export function extractEventHandlers(tree: any, eventNames: string[]) {
    const getHandlerAttributes = (event: string) => {
        const handlerName = `on${event}`;

        return Array.prototype.map.call(tree.find(`[${handlerName}]`), el => el.getAttribute(handlerName));
    };

    return flatMap(eventNames, (event: string) => getHandlerAttributes(event).map(extractEventHandlerBody));
}

export function removeInScopeJsDoc(method: string): string {
    return method.replace(/\/\*\*\s*inScope.*\*\/\n/g, '');
}

// functions marked with an "inScope" comment will be handled as "instance" methods, as opposed to (global/unused)
// "util" ones
export function extractUnboundInstanceMethods(srcFile: ts.SourceFile) {
    let inScopeMethods = [];
    srcFile.statements.forEach(node => {
        if (ts.isFunctionDeclaration(node)) {
            const docs = (node as any).jsDoc;
            if (docs && docs.length > 0) {
                docs.forEach(doc => {
                    const trimmed = doc.comment.trim() || '';
                    if (trimmed.includes('inScope')) {
                        inScopeMethods = [...inScopeMethods, node.name?.getText()]
                    }
                });
            }

        }
    })
    return inScopeMethods;
}

export function extractImportStatements(srcFile: ts.SourceFile): BindingImport[] {
    let allImports = [];
    srcFile.statements.forEach(node => {
        if (ts.isImportDeclaration(node)) {
            const module = node.moduleSpecifier.getText();
            const moduleImports = node.importClause;
            const imports = [];
            let isNamespaced = false;
            if (moduleImports.namedBindings) {

                if (ts.isNamespaceImport(moduleImports.namedBindings)) {
                    isNamespaced = true;
                }
                moduleImports.namedBindings.forEachChild(o => {
                    imports.push(o.getText());
                })
            }
            allImports.push({
                module,
                isNamespaced,
                imports
            })
        }
    })
    return allImports;
}

export function extractClassDeclarations(srcFile: ts.SourceFile): BindingImport[] {
    let allClasses = [];
    srcFile.statements.forEach(node => {
        if (ts.isClassDeclaration(node)) {
            allClasses = [node.getText()]
        }
    })
    return allClasses;
}


export function tsNodeIsTopLevelFunction(node: any): boolean {
    if (ts.isFunctionLike(node)) {
        const isTopLevel = ts.isSourceFile(node.parent);
        return isTopLevel
    }
    return false;
}

/**
 * Find all the variables defined in this node tree recursively
 */
export function findAllVariables(node) {
    let allVariables = [];
    if (ts.isVariableDeclaration(node) || ts.isClassDeclaration(node)) {
        allVariables.push(node.name.getText());
    }
    ts.forEachChild(node, n => {
        const variables = findAllVariables(n);
        if (variables.length > 0) {
            allVariables = [...allVariables, ...variables];
        }
    });
    return allVariables;
}

function getLowestExpression(exp: any) {
    let hasExpression = true;
    while (hasExpression) {
        hasExpression = exp.expression;
        if (hasExpression) {
            exp = exp.expression as any;
        }
    }
    return exp;
}

/**
 * Find all the properties accessed in this node. 
 */
export function findAllAccessedProperties(node) {
    let properties = [];
    if (ts.isIdentifier(node)) {
        const property = node.getText();
        if (property !== 'undefined' && property !== 'null') {
            properties.push(node.getText());
        }
    } else if (ts.isCallExpression(node) || ts.isPropertyAccessExpression(node)) {
        // When there are chained accesses we need to recurse to the lowest identifier as this is the first in the statement,
        // and will be the true accessed variable.
        // i.e gridOptions.api!.getModel().getRowCount() we need to recurse down the tree to extract gridOptions
        const exp = getLowestExpression(node.expression);
        properties.push(exp.getText())
    }
    else if (ts.isVariableDeclaration(node)) {
        // get lowest identifier as this is the first in the statement
        // i.e var nextHeader = params.nextHeaderPosition 
        // we need to recurse down the initializer tree to extract params and not nextHeaderPosition
        let init = node.initializer as any;
        if (init) {
            const exp = getLowestExpression(init);
            properties = [...properties, ...findAllAccessedProperties(exp)];
        }
    }
    else if (ts.isPropertyAssignment(node)) {
        // Ignore the name of rowIndex just check what is being assigned
        //  {
        //      rowIndex: nextRowIndex,
        //  }
        if (node.initializer) {
            properties = [...properties, ...findAllAccessedProperties(node.initializer)];
        }
    }
    else if (ts.isClassDeclaration(node)) {
        // Do nothing for Class declarations as this is likely a cell renderer setup
    }
    else {
        // Recurse down the tree looking for more accessed properties
        ts.forEachChild(node, n => {
            const props = findAllAccessedProperties(n);
            if (props.length > 0) {
                properties = [...properties, ...props];
            }
        });
    }

    return properties;
}

/** Convert import paths to their package equivalent when the docs are in Packages mode
 * i.e import { GridOptions } from '@ag-grid-community/core';
 * to 
 * import { GridOptions } from '@ag-grid-community';
 */
export function convertImportPath(modulePackage: string, convertToPackage: boolean) {
    if (convertToPackage) {
        if (modulePackage.includes("@ag-grid-community")) {
            return `'ag-grid-community'`
        } else if (modulePackage.includes("@ag-grid-enterprise")) {
            return `'ag-grid-enterprise'`
        }
    }
    return modulePackage;
}

export function addBindingImports(bindingImports: any, imports: string[], convertToPackage: boolean) {
    // We rely on the prettier-plugin-organize-imports plugin to organise and de-duplicate our imports
    bindingImports.forEach((i: BindingImport) => {
        if (i.imports.length > 0) {
            const path = convertImportPath(i.module, convertToPackage)
            if (i.isNamespaced) {
                imports.push(`import * as ${i.imports[0]} from ${path};`);
            } else {
                imports.push(`import { ${i.imports.join(', ')} }  from ${path};`);
            }
        }
    });
}