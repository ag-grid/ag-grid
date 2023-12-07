import type { Options as SucraseOptions } from "sucrase";

import ts = require("typescript");
const sucrase = require("sucrase");

export type ImportType = 'packages' | 'modules';

export interface BindingImport {
    isNamespaced: boolean;
    module: string;
    namedImport: string;
    imports: string[];
}

const moduleMapping = require('../../documentation/doc-pages/modules/modules.json');

const SUCRASE_OPTIONS: SucraseOptions = {
    transforms: ["typescript"],
    jsxRuntime: "preserve",
    disableESTransforms: true,
    keepUnusedImports: true,
    preserveDynamicImport: true,
};

export function transpileTypeScriptSource(source: string, filename: string | null, options?: SucraseOptions): string {
    try {
        return sucrase.transform(source, {
            ...SUCRASE_OPTIONS,
            ...options,
        }).code;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw Object.assign(
                new SyntaxError(`Failed to parse ${filename || 'TypeScript source'}:\n${error.message}`),
                error,
            );
        }
        throw error;
    }
}

export function readAsJsFile(srcFile, options: { includeImports: boolean } = undefined) {
    const tsFile = srcFile
        // Remove imports that are not required in javascript
        .replace((options?.includeImports ? '' : /import ((.|\n)*?)from.*\n/g), '')
        // Remove export statement
        .replace(/export /g, "")

    return transpileTypeScriptSource(tsFile, srcFile);
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
export const convertFunctionToConstPropertyTs = (code: string) => {
    return code.replace(/function\s+([^\(\s]+)\s*\(([^\)]*)\):(\s+[^\{]*)/, 'const $1: ($2) => $3 = ($2) =>');
}

export function isInstanceMethod(methods: string[], property: any): boolean {
    return methods.map(getFunctionName).filter(name => name === property.name).length > 0;
}

const IMPORT_STATEMENT = importStatementRegExp();

export function stripImportDeclarations(source: string): string {
    return source.replace(new RegExp(IMPORT_STATEMENT.source, 'g'), '');
}

function importStatementRegExp(): RegExp {
    const IDENTIFIER = /\w+/;
    const WHITESPACE = /\s+/;
    const OPTIONAL_WHITESPACE = /\s*/;
    const BRACKET_OPEN = /\{/;
    const BRACKET_CLOSE = /\}/;
    const COMMA = /,/;
    const SINGLE_QUOTE_STRING_LITERAL = /"[^"]*?"/;
    const DOUBLE_QUOTE_STRING_LITERAL = /'[^']*?'/;
    const STRING_LITERAL = oneOf(SINGLE_QUOTE_STRING_LITERAL, DOUBLE_QUOTE_STRING_LITERAL);
    const KEYWORD_IMPORT = /import/;
    const STAR = /\*/;
    const KEYWORD_AS = /as/;
    const KEYWORD_FROM = /from/;
    const STATEMENT_TERMINATOR = /[;\n]/;
    const IMPORT_DEFAULT_SPECIFIER = IDENTIFIER;
    const IMPORT_NAMESPACED_SPECIFIER = sequence(STAR, OPTIONAL_WHITESPACE, KEYWORD_AS, WHITESPACE, IDENTIFIER);
    const IMPORT_NAMED_EXPORT_SPECIFIER = IDENTIFIER;
    const IMPORT_ALIASED_EXPORT_SPECIFIER = sequence(IDENTIFIER, WHITESPACE, KEYWORD_AS, WHITESPACE, IDENTIFIER);
    const NAMED_IMPORT_SPECIFIER = oneOf(IMPORT_NAMED_EXPORT_SPECIFIER, IMPORT_ALIASED_EXPORT_SPECIFIER);
    const NAMED_IMPORT_SEPARATOR = sequence(OPTIONAL_WHITESPACE, COMMA, OPTIONAL_WHITESPACE);
    const IMPORT_NAMED_SPECIFIER = sequence(
        BRACKET_OPEN,
        OPTIONAL_WHITESPACE,
        delimitedList(NAMED_IMPORT_SPECIFIER, NAMED_IMPORT_SEPARATOR),
        OPTIONAL_WHITESPACE,
        BRACKET_CLOSE
    );
    const IMPORT_SPECIFIER = oneOf(
        IMPORT_DEFAULT_SPECIFIER,
        IMPORT_NAMED_SPECIFIER,
        IMPORT_NAMESPACED_SPECIFIER,
        sequence(IMPORT_DEFAULT_SPECIFIER, NAMED_IMPORT_SEPARATOR, IMPORT_NAMED_SPECIFIER)
    );
    const IMPORT_STATEMENT = sequence(
        KEYWORD_IMPORT,
        maybe(sequence(WHITESPACE, IMPORT_SPECIFIER, OPTIONAL_WHITESPACE, KEYWORD_FROM)),
        OPTIONAL_WHITESPACE,
        STRING_LITERAL,
        OPTIONAL_WHITESPACE,
        STATEMENT_TERMINATOR
    );
    return IMPORT_STATEMENT;

    function sequence(...patterns: Array<RegExp>): RegExp {
        return new RegExp(patterns.map((r) => r.source).join(''));
    }
    function maybe(pattern: RegExp): RegExp {
        return new RegExp(`(?:${pattern.source})?`);
    }
    function oneOf(...patterns: Array<RegExp>): RegExp {
        return new RegExp(`(?:${patterns.map((r) => r.source).join('|')})`);
    }
    function delimitedList(item: RegExp, delimiter: RegExp): RegExp {
        return new RegExp(`(?:${item.source}${delimiter.source})*(?:${item.source})?`);
    }
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

export function tsNodeIsGlobalVarWithName(node: any, name: string): boolean {
    // eg: var currentRowHeight = 10;
    if (ts.isVariableDeclaration(node) && ts.isSourceFile(node.parent.parent.parent)) {
        return node.name.getText() === name;
    }
    return false;
}

export function tsNodeIsPropertyWithName(node: ts.Node, name: string) {
    if (ts.isPropertyAssignment(node)) {
        if (node.name.getText() === name) {

            // If the name matches the initializer then the property will get added via
            // the top level variable matching a gridProperty name
            // This means that we include cellRenderer properties like
            // detailCellRenderer: DetailCellRenderer,
            if (node.name.getText() === node.initializer.getText()) {
                return false;
            }
            return true;
        }
    }
}

export function tsNodeIsTopLevelVariable(node: ts.Node, registered: string[] = []) {
    if (ts.isVariableDeclarationList(node)) {
        // Not registered already
        // are a top level variable declaration so that we do not match variables within function scopes
        // Is not just a type declaration i.e declare function getData: () => any[];
        if (node.declarations.length > 0) {
            const declaration = node.declarations[0];
            // Don't include api declarations as these are handled separately
            const isLetApi = declaration.name.getText() === 'gridApi';
            return !isLetApi && !isDeclareStatement(node.parent) && registered.indexOf(declaration.name.getText()) < 0 && ts.isSourceFile(node.parent.parent);
        }
    }
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

export function tsNodeIsFunctionCall(node: any): boolean {
    return ts.isExpressionStatement(node) && ts.isCallExpression(node.expression);
}

export function tsNodeIsGlobalFunctionCall(node: ts.Node) {
    // Get top level function calls like
    // setInterval(callback, 500)
    // but don't match things like
    // AgChart.create(options)
    if (ts.isExpressionStatement(node)) {
        return ts.isSourceFile(node.parent) && ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression);
    }
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

export function extractTypeInfoForVariable(srcFile: ts.SourceFile, varName: string) {
    let typeStr = undefined;
    let typeParts = [];
    srcFile.statements.forEach(node => {
        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach(dec => {
                if (ts.isVariableDeclaration(dec) && dec.name.getText() == varName && dec.type) {
                    typeStr = dec.type.getText();
                    typeParts = getTypes(dec.type)
                }
            })
        }
    })
    return { typeStr, typeParts };
}

export function getTypes(node: ts.Node) {
    let typesToInclude = []
    if (ts.isIdentifier(node)) {
        const typeName = node.getText();
        if (!['HTMLElement', 'Function', 'Partial', 'TData', 'TContext', 'TValue'].includes(typeName)) {
            typesToInclude.push(typeName);
        }
    }
    node.forEachChild(ct => {
        // Only recurse down the type branches of the tree so we do not include argument names
        if ((ct as any).type) {
            typesToInclude = [...typesToInclude, ...getTypes((ct as any).type)]
        } else {
            typesToInclude = [...typesToInclude, ...getTypes(ct)]
        }
    })
    return typesToInclude;
}

export function usesChartApi(node: ts.Node) {
    let usesApi = false;
    if (ts.isCallExpression(node)) {
        if (node.getText()?.match(/AgChart.(?!create)/)) {
            return true;
        }
        if (node.getText()?.match(/AgEnterpriseCharts.(?!create)/)) {
            return true;
        }
    }

    node.forEachChild(ct => {
        usesApi = usesApi || usesChartApi(ct);
    })
    return usesApi;
}

export function extractImportStatements(srcFile: ts.SourceFile): BindingImport[] {
    let allImports = [];
    srcFile.statements.forEach(node => {
        if (ts.isImportDeclaration(node)) {
            const module = node.moduleSpecifier.getText();
            const moduleImports = node.importClause;
            const imports = [];
            let namedImport = undefined;
            let isNamespaced = true;

            if (moduleImports?.namedBindings) {
                if (!ts.isNamespaceImport(moduleImports.namedBindings)) {
                    isNamespaced = false;
                }
                moduleImports.namedBindings.forEachChild(o => {
                    imports.push(o.getText());
                })
            }
            if (moduleImports?.name) {
                namedImport = moduleImports.name.getText();
                isNamespaced = false;
            }
            allImports.push({
                module,
                isNamespaced,
                namedImport,
                imports
            })
        }
    })
    return allImports;
}

export function extractTypeDeclarations(srcFile: ts.SourceFile) {
    const allDeclareStatements = [];
    srcFile.statements.forEach(node => {
        if ((ts.isVariableStatement(node) || ts.isFunctionDeclaration(node)) && node.modifiers?.length > 0) {
            if (node.modifiers.some(s => s.kind === ts.SyntaxKind.DeclareKeyword)) {
                allDeclareStatements.push(node.getText())
            }
        }
    })
    return allDeclareStatements;
}


export function extractClassDeclarations(srcFile: ts.SourceFile) {
    const allClasses = [];
    srcFile.statements.forEach(node => {
        if (ts.isClassDeclaration(node)) {
            allClasses.push(node.getText())
        }
    })
    return allClasses;
}

export function extractInterfaces(srcFile: ts.SourceFile) {
    const allInterfaces = [];
    srcFile.statements.forEach(node => {
        if (ts.isInterfaceDeclaration(node)) {
            allInterfaces.push(node.getText())
        }
    })
    return allInterfaces;
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
    if (ts.isClassDeclaration(node)) {
        allVariables.push(node.name.getText());
    }
    if (ts.isVariableDeclaration(node)) {
        if (ts.isObjectBindingPattern(node.name)) {
            // Code like this:  const { pageSetup, margins } = getSheetConfig();
            node.name.elements.forEach(n => allVariables.push(n.getText()))
        } else {
            allVariables.push(node.name.getText());
        }
    }
    if (ts.isFunctionDeclaration(node)) {
        // catch locally defined functions within the main function body
        // function setMessage(msg: string) { ... }
        allVariables.push(node.name.getText());
    }
    if (ts.isParameter(node)) {
        // catch locally defined arrow functions with their params
        //  const colToNameFunc = (col: Column, index: number) => index + ' = ' + col.getId()
        //  const colNames = cols.map(colToNameFunc).join(', ')

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
        // i.e api!.getModel().getRowCount() we need to recurse down the tree to extract gridOptions
        const exp = getLowestExpression(node.expression);

        if (ts.isArrayLiteralExpression(exp)) {
            // Check if the array has any properties in it that are dependencies
            properties = [...properties, ...findAllAccessedProperties(exp)];
        } else {
            properties.push(exp.getText())
        }
        if (ts.isCallExpression(node) && node.arguments) {
            // Check arguments
            properties = [...properties, ...findAllAccessedProperties(node.arguments)];
        }
    }
    else if (ts.isBinaryExpression(node)) {
        // In this function we set swimmingHeight but are not dependent on it,
        // so for binary expressions we only check the right hand branch
        // function setSwimmingHeight(height: number) {
        //      swimmingHeight = height
        //      api!.resetRowHeights()
        // }
        const rightProps = findAllAccessedProperties(node.right);
        if (rightProps.length > 0) {
            properties = [...properties, ...rightProps];
        }
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
    else if (ts.isExpressionStatement(node)) {
        if (node.expression) {
            properties = [...properties, ...findAllAccessedProperties(node.expression)];
        }
    }
    else if (ts.isClassDeclaration(node)) {
        // Do nothing for Class declarations as this is likely a cell renderer setup
    }
    else if (ts.isTypeReferenceNode(node)) {
        // Do nothing for Type references
    }
    else if (node instanceof Array) {
        node.forEach(element => {
            properties = [...properties, ...findAllAccessedProperties(element)];
        });
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

        const conversions = {
            "'@ag-grid-community/angular'": "'ag-grid-angular'",
            '"@ag-grid-community/angular"': "'ag-grid-angular'",
            "'@ag-grid-community/vue3'": "'ag-grid-vue3'",
            '"@ag-grid-community/vue3"': "'ag-grid-vue3'",
            "'@ag-grid-community/vue'": "'ag-grid-vue'",
            '"@ag-grid-community/vue"': "'ag-grid-vue'",
            "'@ag-grid-community/react'": "'ag-grid-react'",
            '"@ag-grid-community/react"': "'ag-grid-react'",
        }
        if (conversions[modulePackage]) {
            return conversions[modulePackage]
        }

        if (modulePackage.includes("@ag-grid-community/core/dist")) {
            return modulePackage.replace('@ag-grid-community/core/dist', 'ag-grid-community/dist');
        }
        if (modulePackage.includes("@ag-grid-community/styles")) {
            return modulePackage.replace('@ag-grid-community/styles', 'ag-grid-community/styles');
        }

        if (modulePackage.includes("@ag-grid-community")) {
            return `'ag-grid-community'`
        }
        if (modulePackage.includes("@ag-grid-enterprise")) {
            return `'ag-grid-enterprise'`
        }
    }
    return modulePackage.replace('_typescript', '').replace(/"/g, `'`);
}

export function getImport(filename: string) {
    const componentFileName = filename.split('.')[0];
    const componentName = componentFileName[0].toUpperCase() + componentFileName.slice(1);
    return `import { ${componentName} } from './${componentFileName}';`;
}

export function getPropertyInterfaces(properties) {
    let propTypesUsed = [];
    properties.forEach(prop => {
        if (prop.typings?.typesToInclude?.length > 0) {
            propTypesUsed = [...propTypesUsed, ...prop.typings.typesToInclude]
        }
    });
    return [...new Set(propTypesUsed)];
}

/**
 *  Add the imports from the parsed file
 * We ignore any component files as those imports are generated for each framework.
 */
export function parseBindingImports(bindingImports: Array<BindingImport>, options: {
    importType: 'modules' | 'packages' | 'globals',
    ignoreTsImports: boolean,
}): Array<string> {
    const { importType, ignoreTsImports } = options;
    const convertToPackage = importType === 'packages' || importType === 'globals';
    const imports = new Array<string>();
    let workingImports: Record<string, {
        namespacedImport: string | true | undefined,
        namedImport: string | undefined,
        imports: Array<string>,
    }> = {};

    const chartsEnterprise = false;
    // const chartsEnterprise = bindingImports.some(i => i.module.includes('ag-charts-enterprise'));

    bindingImports.forEach((i: BindingImport) => {

        const path = convertImportPath(i.module, convertToPackage);
        if (!i.module.includes('_typescript') || !ignoreTsImports) {
            workingImports[path] = workingImports[path] || { namespacedImport: undefined, namedImport: undefined, imports: [] };
            if (i.isNamespaced) {
                workingImports[path] = { ...workingImports[path], namespacedImport: i.imports.length > 0 ? i.imports[0] : true };
            } else {
                if (i.namedImport) {
                    workingImports[path] = { ...workingImports[path], namedImport: i.namedImport };
                }
                if (i.imports) {
                    workingImports[path] = { ...workingImports[path], imports: [...workingImports[path].imports, ...i.imports] };
                }
            }
        }
    });

    let hasEnterpriseModules = false;
    Object.entries(workingImports).forEach(([k, v]: ([string, { namespacedImport: string | true | undefined, namedImport: string | undefined, imports: string[] }])) => {
        const isAgGridImport = k.includes('ag-grid');
        if (v.namespacedImport) {
            if (importType === 'globals' && isAgGridImport) {
                if (typeof v.namespacedImport === 'string') {
                    imports.push(`const ${v.namespacedImport} = agGrid;`);
                }
            } else if (v.namespacedImport === true) {
                imports.push(`import ${k};`);
            } else {
                imports.push(`import * as ${v.namespacedImport} from ${k};`);
            }
        }

        let unique = [...new Set(v.imports)].sort();

        if (convertToPackage && isAgGridImport) {
            // Remove module related imports
            unique = unique.filter(i => !i.includes('Module'));
            hasEnterpriseModules = hasEnterpriseModules || k.includes('enterprise');
        }
        if (unique.length > 0 || v.namedImport) {
            if (importType === 'globals' && isAgGridImport) {
                if (v.namedImport) imports.push(`const ${v.namedImport} = agGrid;`);
                if (unique.length > 0) imports.push(`const { ${unique.join(', ')} } = agGrid;`);
            } else {
                const namedImport = v.namedImport ? v.namedImport : '';
                const importStr = unique.length > 0 ? `{ ${unique.join(', ')} }` : ''
                const joiningComma = namedImport && importStr ? ", " : "";
                imports.push(`import ${namedImport}${joiningComma}${importStr} from ${k};`);
            }
        }
    })
    if (hasEnterpriseModules && importType === 'packages') {
        imports.push(`import 'ag-grid-enterprise';`)
    }

    // if (chartsEnterprise) {
    //     imports.push(`import 'ag-charts-enterprise';`)
    // }

    return imports;
}

export function getModuleRegistration({ gridSettings, enterprise, exampleName }) {
    const moduleRegistration = ["import { ModuleRegistry } from '@ag-grid-community/core';"];
    const modules = gridSettings.modules;

    if (enterprise && !Array.isArray(modules)) {
        throw new Error(`The example ${exampleName} has "enterprise" : true but no modules have been provided "modules":[...]. Either remove the enterprise flag or provide the required modules.`)
    }

    let gridSuppliedModules;
    let exampleModules = Array.isArray(modules) ? modules : ['clientside'];
    const { moduleImports, suppliedModules } = modulesProcessor(exampleModules);
    moduleRegistration.push(...moduleImports);
    gridSuppliedModules = `[${suppliedModules.join(', ')}]`;

    moduleRegistration.push(`\n// Register the required feature modules with the Grid`);
    moduleRegistration.push(`ModuleRegistry.registerModules(${gridSuppliedModules})`);
    return moduleRegistration;
}

export function handleRowGenericInterface(fileTxt: string, tData: string): string {
    if (tData) {
        fileTxt = fileTxt
            .replace(/<(TData|TValue|TContext|any)?(, )?(TData|TValue|TContext|any)?(, )?(TData|TValue|TContext|any)?>/g, '')
            .replace(/TData\[\]/g, `${tData}[]`);
    } else {
        fileTxt = fileTxt.replace(/<TData>/g, '').replace(/TData\[\]/g, 'any[]');
    }
    return fileTxt;
}

export function addGenericInterfaceImport(imports: string[], tData: string, bindings) {
    if (tData &&
        !bindings.interfaces.some(i => i.includes(tData)) &&
        !imports.some(i => i.includes(tData))) {
        imports.push(`import { ${tData} } from './interfaces'`)
    }
}

export function replaceGridReadyRowData(callback: string, rowDataSetter: string) {
    return callback
    // replace gridApi.setGridOption('rowData', data) with this.rowData = data
    .replace(/gridApi(!?)\.setGridOption\('rowData', data\)/, `${rowDataSetter} = data`)
    // replace gridApi.setGridOption('rowData', data.map(...)) with this.rowData = data.map(...)
    .replace(/gridApi(!?)\.setGridOption\('rowData', data/, `${rowDataSetter} = (data`);
}

export function preferParamsApi(code: string): string {
    // use params.api instead of gridApi.api when we have access to the params object
    return code.replace(/([\s\(!])gridApi(\W)/g, '$1params.api$2');
}

export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';
export const DARK_INTEGRATED_START = '/** DARK INTEGRATED START **/';
export const DARK_INTEGRATED_END = '/** DARK INTEGRATED END **/';

export function getActiveTheme(theme: string, typescript: boolean) {
    return `${DARK_MODE_START}document.documentElement${typescript ? '?' : ''}.dataset.defaultTheme || '${theme}'${DARK_MODE_END}`;
}

export function getIntegratedDarkModeCode(exampleName: string, typescript?: boolean, apiName = 'params.api'): string {
    if (!exampleName.includes('integrated-charts-')) {
        return '';
    }
    return `${DARK_INTEGRATED_START}${(typescript ? darkModeTs : darkModeJS).replace(/params\.api/g, apiName)}${DARK_INTEGRATED_END}`;
}

const darkModeTs = `
        const isInitialModeDark = (): boolean => {
            const attr: string | null = document.documentElement.getAttribute('data-default-theme');
            return attr ? attr.endsWith('-dark') : false;
        };

        // update chart themes based on dark mode status
        const updateChartThemes = (isDark: boolean): void => {
            const themes: string[] = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
            const currentThemes = params.api.getGridOption('chartThemes');
            const customTheme = currentThemes && currentThemes.some(theme => theme.startsWith('my-custom-theme'));

            let modifiedThemes: string[] = customTheme
                ? (isDark ? ['my-custom-theme-dark', 'my-custom-theme-light'] : ['my-custom-theme-light', 'my-custom-theme-dark'])
                : Array.from(new Set(themes.map((theme) => theme + (isDark ? '-dark' : ''))));

            // updating the 'chartThemes' grid option will cause the chart to reactively update!
            params.api.setGridOption('chartThemes', modifiedThemes);
        };

        // update chart themes when example first loads
        updateChartThemes(isInitialModeDark());

        interface ColorSchemeChangeEventDetail {
            darkMode: boolean;
        }

        // event handler for color scheme changes
        const handleColorSchemeChange = (event: CustomEvent<ColorSchemeChangeEventDetail>): void => {
            const { darkMode } = event.detail;
            updateChartThemes(darkMode);
        }

        // listen for user-triggered dark mode changes (not removing listener is fine here!)
        document.addEventListener('color-scheme-change', handleColorSchemeChange as EventListener);
    `;


const darkModeJS = `
    const isInitialModeDark = () => {
            const attr = document.documentElement.getAttribute('data-default-theme');
            return attr ? attr.endsWith('-dark') : false;
        };

        const updateChartThemes = (isDark) => {
            const themes = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
            const currentThemes = params.api.getGridOption('chartThemes');
            const customTheme = currentThemes && currentThemes.some(theme => theme.startsWith('my-custom-theme'));

            let modifiedThemes = customTheme
                ? (isDark ? ['my-custom-theme-dark', 'my-custom-theme-light'] : ['my-custom-theme-light', 'my-custom-theme-dark'])
                : Array.from(new Set(themes.map((theme) => theme + (isDark ? '-dark' : ''))));

            // updating the 'chartThemes' grid option will cause the chart to reactively update!
            params.api.setGridOption('chartThemes', modifiedThemes);
        };

        // update chart themes when example first loads
        updateChartThemes(isInitialModeDark());

        const handleColorSchemeChange = (event) => {
            const { darkMode } = event.detail;
            updateChartThemes(darkMode);
        }

        // listen for user-triggered dark mode changes (not removing listener is fine here!)
        document.addEventListener('color-scheme-change', handleColorSchemeChange);
    `;
