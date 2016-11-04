"use strict";
var ts = require('typescript');
var schema_1 = require('../src/schema');
var symbols_1 = require('../src/symbols');
var typescript_mocks_1 = require('./typescript.mocks');
describe('Symbols', function () {
    var symbols;
    var someValue = 'some-value';
    beforeEach(function () { return symbols = new symbols_1.Symbols(null); });
    it('should be able to add a symbol', function () { return symbols.define('someSymbol', someValue); });
    beforeEach(function () { return symbols.define('someSymbol', someValue); });
    it('should be able to `has` a symbol', function () { return expect(symbols.has('someSymbol')).toBeTruthy(); });
    it('should be able to `get` a symbol value', function () { return expect(symbols.resolve('someSymbol')).toBe(someValue); });
    it('should be able to `get` a symbol value', function () { return expect(symbols.resolve('someSymbol')).toBe(someValue); });
    it('should be able to determine symbol is missing', function () { return expect(symbols.has('missingSymbol')).toBeFalsy(); });
    it('should return undefined from `get` for a missing symbol', function () { return expect(symbols.resolve('missingSymbol')).toBeUndefined(); });
    var host;
    var service;
    var program;
    var expressions;
    var imports;
    beforeEach(function () {
        host = new typescript_mocks_1.Host(FILES, ['consts.ts', 'expressions.ts', 'imports.ts']);
        service = ts.createLanguageService(host);
        program = service.getProgram();
        expressions = program.getSourceFile('expressions.ts');
        imports = program.getSourceFile('imports.ts');
    });
    it('should not have syntax errors in the test sources', function () {
        typescript_mocks_1.expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
        for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile = _a[_i];
            typescript_mocks_1.expectNoDiagnostics(service.getSyntacticDiagnostics(sourceFile.fileName));
        }
    });
    it('should be able to find the source files', function () {
        expect(expressions).toBeDefined();
        expect(imports).toBeDefined();
    });
    it('should be able to create symbols for a source file', function () {
        var symbols = new symbols_1.Symbols(expressions);
        expect(symbols).toBeDefined();
    });
    it('should be able to find symbols in expression', function () {
        var symbols = new symbols_1.Symbols(expressions);
        expect(symbols.has('someName')).toBeTruthy();
        expect(symbols.resolve('someName'))
            .toEqual({ __symbolic: 'reference', module: './consts', name: 'someName' });
        expect(symbols.has('someBool')).toBeTruthy();
        expect(symbols.resolve('someBool'))
            .toEqual({ __symbolic: 'reference', module: './consts', name: 'someBool' });
    });
    it('should be able to detect a * import', function () {
        var symbols = new symbols_1.Symbols(imports);
        expect(symbols.resolve('b')).toEqual({ __symbolic: 'reference', module: 'b' });
    });
    it('should be able to detect importing a default export', function () {
        var symbols = new symbols_1.Symbols(imports);
        expect(symbols.resolve('d')).toEqual({ __symbolic: 'reference', module: 'd', default: true });
    });
    it('should be able to import a renamed symbol', function () {
        var symbols = new symbols_1.Symbols(imports);
        expect(symbols.resolve('g')).toEqual({ __symbolic: 'reference', name: 'f', module: 'f' });
    });
    it('should be able to resolve any symbol in core global scope', function () {
        var core = program.getSourceFiles().find(function (source) { return source.fileName.endsWith('lib.d.ts'); });
        expect(core).toBeDefined();
        var visit = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.VariableStatement:
                case ts.SyntaxKind.VariableDeclarationList:
                    return ts.forEachChild(node, visit);
                case ts.SyntaxKind.VariableDeclaration:
                    var variableDeclaration = node;
                    var nameNode = variableDeclaration.name;
                    var name_1 = nameNode.text;
                    var result = symbols.resolve(name_1);
                    expect(schema_1.isMetadataGlobalReferenceExpression(result) && result.name).toEqual(name_1);
                    // Ignore everything after Float64Array as it is IE specific.
                    return name_1 === 'Float64Array';
            }
            return false;
        };
        ts.forEachChild(core, visit);
    });
});
var FILES = {
    'consts.ts': "\n    export var someName = 'some-name';\n    export var someBool = true;\n    export var one = 1;\n    export var two = 2;\n  ",
    'expressions.ts': "\n    import {someName, someBool, one, two} from './consts';\n  ",
    'imports.ts': "\n    import * as b from 'b';\n    import 'c';\n    import d from 'd';\n    import {f as g} from 'f';\n  "
};
//# sourceMappingURL=symbols.spec.js.map