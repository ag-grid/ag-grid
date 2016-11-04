"use strict";
var ts = require('typescript');
var evaluator_1 = require('../src/evaluator');
var symbols_1 = require('../src/symbols');
var typescript_mocks_1 = require('./typescript.mocks');
describe('Evaluator', function () {
    var documentRegistry = ts.createDocumentRegistry();
    var host;
    var service;
    var program;
    var typeChecker;
    var symbols;
    var evaluator;
    beforeEach(function () {
        host = new typescript_mocks_1.Host(FILES, [
            'expressions.ts', 'consts.ts', 'const_expr.ts', 'forwardRef.ts', 'classes.ts',
            'newExpression.ts', 'errors.ts', 'declared.ts'
        ]);
        service = ts.createLanguageService(host, documentRegistry);
        program = service.getProgram();
        typeChecker = program.getTypeChecker();
        symbols = new symbols_1.Symbols(null);
        evaluator = new evaluator_1.Evaluator(symbols, new Map());
    });
    it('should not have typescript errors in test data', function () {
        typescript_mocks_1.expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
        for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile = _a[_i];
            typescript_mocks_1.expectNoDiagnostics(service.getSyntacticDiagnostics(sourceFile.fileName));
            if (sourceFile.fileName != 'errors.ts') {
                // Skip errors.ts because we it has intentional semantic errors that we are testing for.
                typescript_mocks_1.expectNoDiagnostics(service.getSemanticDiagnostics(sourceFile.fileName));
            }
        }
    });
    it('should be able to fold literal expressions', function () {
        var consts = program.getSourceFile('consts.ts');
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(consts, 'someName').initializer)).toBeTruthy();
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(consts, 'someBool').initializer)).toBeTruthy();
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(consts, 'one').initializer)).toBeTruthy();
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(consts, 'two').initializer)).toBeTruthy();
    });
    it('should be able to fold expressions with foldable references', function () {
        var expressions = program.getSourceFile('expressions.ts');
        symbols.define('someName', 'some-name');
        symbols.define('someBool', true);
        symbols.define('one', 1);
        symbols.define('two', 2);
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(expressions, 'three').initializer)).toBeTruthy();
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(expressions, 'four').initializer)).toBeTruthy();
        symbols.define('three', 3);
        symbols.define('four', 4);
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(expressions, 'obj').initializer)).toBeTruthy();
        expect(evaluator.isFoldable(typescript_mocks_1.findVar(expressions, 'arr').initializer)).toBeTruthy();
    });
    it('should be able to evaluate literal expressions', function () {
        var consts = program.getSourceFile('consts.ts');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(consts, 'someName').initializer)).toBe('some-name');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(consts, 'someBool').initializer)).toBe(true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(consts, 'one').initializer)).toBe(1);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(consts, 'two').initializer)).toBe(2);
    });
    it('should be able to evaluate expressions', function () {
        var expressions = program.getSourceFile('expressions.ts');
        symbols.define('someName', 'some-name');
        symbols.define('someBool', true);
        symbols.define('one', 1);
        symbols.define('two', 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'three').initializer)).toBe(3);
        symbols.define('three', 3);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'four').initializer)).toBe(4);
        symbols.define('four', 4);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'obj').initializer))
            .toEqual({ one: 1, two: 2, three: 3, four: 4 });
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'arr').initializer)).toEqual([1, 2, 3, 4]);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bTrue').initializer)).toEqual(true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bFalse').initializer)).toEqual(false);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bAnd').initializer)).toEqual(true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bOr').initializer)).toEqual(true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'nDiv').initializer)).toEqual(2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'nMod').initializer)).toEqual(1);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bLOr').initializer)).toEqual(false || true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bLAnd').initializer)).toEqual(true && true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bBOr').initializer)).toEqual(0x11 | 0x22);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bBAnd').initializer)).toEqual(0x11 & 0x03);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bXor').initializer)).toEqual(0x11 ^ 0x21);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bEqual').initializer))
            .toEqual(1 == '1');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bNotEqual').initializer))
            .toEqual(1 != '1');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bIdentical').initializer))
            .toEqual(1 === '1');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bNotIdentical').initializer))
            .toEqual(1 !== '1');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bLessThan').initializer)).toEqual(1 < 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bGreaterThan').initializer)).toEqual(1 > 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bLessThanEqual').initializer))
            .toEqual(1 <= 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bGreaterThanEqual').initializer))
            .toEqual(1 >= 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bShiftLeft').initializer)).toEqual(1 << 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bShiftRight').initializer))
            .toEqual(-1 >> 2);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'bShiftRightU').initializer))
            .toEqual(-1 >>> 2);
    });
    it('should report recursive references as symbolic', function () {
        var expressions = program.getSourceFile('expressions.ts');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'recursiveA').initializer))
            .toEqual({ __symbolic: 'reference', name: 'recursiveB' });
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(expressions, 'recursiveB').initializer))
            .toEqual({ __symbolic: 'reference', name: 'recursiveA' });
    });
    it('should correctly handle special cases for CONST_EXPR', function () {
        var const_expr = program.getSourceFile('const_expr.ts');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(const_expr, 'bTrue').initializer)).toEqual(true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(const_expr, 'bFalse').initializer)).toEqual(false);
    });
    it('should resolve a forwardRef', function () {
        var forwardRef = program.getSourceFile('forwardRef.ts');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(forwardRef, 'bTrue').initializer)).toEqual(true);
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(forwardRef, 'bFalse').initializer)).toEqual(false);
    });
    it('should return new expressions', function () {
        symbols.define('Value', { __symbolic: 'reference', module: './classes', name: 'Value' });
        evaluator = new evaluator_1.Evaluator(symbols, new Map());
        var newExpression = program.getSourceFile('newExpression.ts');
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(newExpression, 'someValue').initializer)).toEqual({
            __symbolic: 'new',
            expression: { __symbolic: 'reference', name: 'Value', module: './classes' },
            arguments: ['name', 12]
        });
        expect(evaluator.evaluateNode(typescript_mocks_1.findVar(newExpression, 'complex').initializer)).toEqual({
            __symbolic: 'new',
            expression: { __symbolic: 'reference', name: 'Value', module: './classes' },
            arguments: ['name', 12]
        });
    });
    it('should support referene to a declared module type', function () {
        var declared = program.getSourceFile('declared.ts');
        var aDecl = typescript_mocks_1.findVar(declared, 'a');
        expect(evaluator.evaluateNode(aDecl.type)).toEqual({
            __symbolic: 'select',
            expression: { __symbolic: 'reference', name: 'Foo' },
            member: 'A'
        });
    });
    it('should return errors for unsupported expressions', function () {
        var errors = program.getSourceFile('errors.ts');
        var fDecl = typescript_mocks_1.findVar(errors, 'f');
        expect(evaluator.evaluateNode(fDecl.initializer))
            .toEqual({ __symbolic: 'error', message: 'Function call not supported', line: 1, character: 12 });
        var eDecl = typescript_mocks_1.findVar(errors, 'e');
        expect(evaluator.evaluateNode(eDecl.type)).toEqual({
            __symbolic: 'error',
            message: 'Could not resolve type',
            line: 2,
            character: 11,
            context: { typeName: 'NotFound' }
        });
        var sDecl = typescript_mocks_1.findVar(errors, 's');
        expect(evaluator.evaluateNode(sDecl.initializer)).toEqual({
            __symbolic: 'error',
            message: 'Name expected',
            line: 3,
            character: 14,
            context: { received: '1' }
        });
        var tDecl = typescript_mocks_1.findVar(errors, 't');
        expect(evaluator.evaluateNode(tDecl.initializer)).toEqual({
            __symbolic: 'error',
            message: 'Expression form not supported',
            line: 4,
            character: 12
        });
    });
    it('should be able to fold an array spread', function () {
        var expressions = program.getSourceFile('expressions.ts');
        symbols.define('arr', [1, 2, 3, 4]);
        var arrSpread = typescript_mocks_1.findVar(expressions, 'arrSpread');
        expect(evaluator.evaluateNode(arrSpread.initializer)).toEqual([0, 1, 2, 3, 4, 5]);
    });
    it('should be able to produce a spread expression', function () {
        var expressions = program.getSourceFile('expressions.ts');
        var arrSpreadRef = typescript_mocks_1.findVar(expressions, 'arrSpreadRef');
        expect(evaluator.evaluateNode(arrSpreadRef.initializer)).toEqual([
            0, { __symbolic: 'spread', expression: { __symbolic: 'reference', name: 'arrImport' } }, 5
        ]);
    });
});
var FILES = {
    'directives.ts': "\n    export function Pipe(options: { name?: string, pure?: boolean}) {\n      return function(fn: Function) { }\n    }\n    ",
    'classes.ts': "\n    export class Value {\n      constructor(public name: string, public value: any) {}\n    }\n  ",
    'consts.ts': "\n    export var someName = 'some-name';\n    export var someBool = true;\n    export var one = 1;\n    export var two = 2;\n    export var arrImport = [1, 2, 3, 4];\n  ",
    'expressions.ts': "\n    import {arrImport} from './consts';\n\n    export var someName = 'some-name';\n    export var someBool = true;\n    export var one = 1;\n    export var two = 2;\n\n    export var three = one + two;\n    export var four = two * two;\n    export var obj = { one: one, two: two, three: three, four: four };\n    export var arr = [one, two, three, four];\n    export var bTrue = someBool;\n    export var bFalse = !someBool;\n    export var bAnd = someBool && someBool;\n    export var bOr = someBool || someBool;\n    export var nDiv = four / two;\n    export var nMod = (four + one) % two;\n\n    export var bLOr = false || true;             // true\n    export var bLAnd = true && true;             // true\n    export var bBOr = 0x11 | 0x22;               // 0x33\n    export var bBAnd = 0x11 & 0x03;              // 0x01\n    export var bXor = 0x11 ^ 0x21;               // 0x20\n    export var bEqual = 1 == <any>\"1\";           // true\n    export var bNotEqual = 1 != <any>\"1\";        // false\n    export var bIdentical = 1 === <any>\"1\";      // false\n    export var bNotIdentical = 1 !== <any>\"1\";   // true\n    export var bLessThan = 1 < 2;                // true\n    export var bGreaterThan = 1 > 2;             // false\n    export var bLessThanEqual = 1 <= 2;          // true\n    export var bGreaterThanEqual = 1 >= 2;       // false\n    export var bShiftLeft = 1 << 2;              // 0x04\n    export var bShiftRight = -1 >> 2;            // -1\n    export var bShiftRightU = -1 >>> 2;          // 0x3fffffff\n\n    export var arrSpread = [0, ...arr, 5];\n\n    export var arrSpreadRef = [0, ...arrImport, 5];\n\n    export var recursiveA = recursiveB;\n    export var recursiveB = recursiveA;\n  ",
    'A.ts': "\n    import {Pipe} from './directives';\n\n    @Pipe({name: 'A', pure: false})\n    export class A {}",
    'B.ts': "\n    import {Pipe} from './directives';\n    import {someName, someBool} from './consts';\n\n    @Pipe({name: someName, pure: someBool})\n    export class B {}",
    'const_expr.ts': "\n    function CONST_EXPR(value: any) { return value; }\n    export var bTrue = CONST_EXPR(true);\n    export var bFalse = CONST_EXPR(false);\n  ",
    'forwardRef.ts': "\n    function forwardRef(value: any) { return value; }\n    export var bTrue = forwardRef(() => true);\n    export var bFalse = forwardRef(() => false);\n  ",
    'newExpression.ts': "\n    import {Value} from './classes';\n    function CONST_EXPR(value: any) { return value; }\n    function forwardRef(value: any) { return value; }\n    export const someValue = new Value(\"name\", 12);\n    export const complex = CONST_EXPR(new Value(\"name\", forwardRef(() => 12)));\n  ",
    'errors.ts': "\n    let f = () => 1;\n    let e: NotFound;\n    let s = { 1: 1, 2: 2 };\n    let t = typeof 12;\n  ",
    'declared.ts': "\n    declare namespace Foo {\n      type A = string;\n    }\n\n    let a: Foo.A = 'some value';\n  "
};
//# sourceMappingURL=evaluator.spec.js.map