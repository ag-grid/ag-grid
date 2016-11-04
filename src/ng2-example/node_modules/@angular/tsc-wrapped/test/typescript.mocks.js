"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fs = require('fs');
var ts = require('typescript');
var Host = (function () {
    function Host(directory, scripts) {
        this.directory = directory;
        this.scripts = scripts;
    }
    Host.prototype.getCompilationSettings = function () {
        return {
            experimentalDecorators: true,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES5
        };
    };
    Host.prototype.getScriptFileNames = function () { return this.scripts; };
    Host.prototype.getScriptVersion = function (fileName) { return '1'; };
    Host.prototype.getScriptSnapshot = function (fileName) {
        var content = this.getFileContent(fileName);
        if (content)
            return ts.ScriptSnapshot.fromString(content);
    };
    Host.prototype.getCurrentDirectory = function () { return '/'; };
    Host.prototype.getDefaultLibFileName = function (options) { return 'lib.d.ts'; };
    Host.prototype.getFileContent = function (fileName) {
        var names = fileName.split('/');
        if (names[names.length - 1] === 'lib.d.ts') {
            return fs.readFileSync(ts.getDefaultLibFilePath(this.getCompilationSettings()), 'utf8');
        }
        var current = this.directory;
        if (names.length && names[0] === '')
            names.shift();
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            if (!current || typeof current === 'string')
                return undefined;
            current = current[name_1];
        }
        if (typeof current === 'string')
            return current;
    };
    return Host;
}());
exports.Host = Host;
var MockNode = (function () {
    function MockNode(kind, flags, pos, end) {
        if (kind === void 0) { kind = ts.SyntaxKind.Identifier; }
        if (flags === void 0) { flags = 0; }
        if (pos === void 0) { pos = 0; }
        if (end === void 0) { end = 0; }
        this.kind = kind;
        this.flags = flags;
        this.pos = pos;
        this.end = end;
    }
    MockNode.prototype.getSourceFile = function () { return null; };
    MockNode.prototype.getChildCount = function (sourceFile) { return 0; };
    MockNode.prototype.getChildAt = function (index, sourceFile) { return null; };
    MockNode.prototype.getChildren = function (sourceFile) { return []; };
    MockNode.prototype.getStart = function (sourceFile) { return 0; };
    MockNode.prototype.getFullStart = function () { return 0; };
    MockNode.prototype.getEnd = function () { return 0; };
    MockNode.prototype.getWidth = function (sourceFile) { return 0; };
    MockNode.prototype.getFullWidth = function () { return 0; };
    MockNode.prototype.getLeadingTriviaWidth = function (sourceFile) { return 0; };
    MockNode.prototype.getFullText = function (sourceFile) { return ''; };
    MockNode.prototype.getText = function (sourceFile) { return ''; };
    MockNode.prototype.getFirstToken = function (sourceFile) { return null; };
    MockNode.prototype.getLastToken = function (sourceFile) { return null; };
    return MockNode;
}());
exports.MockNode = MockNode;
var MockIdentifier = (function (_super) {
    __extends(MockIdentifier, _super);
    function MockIdentifier(name, kind, flags, pos, end) {
        if (kind === void 0) { kind = ts.SyntaxKind.Identifier; }
        if (flags === void 0) { flags = 0; }
        if (pos === void 0) { pos = 0; }
        if (end === void 0) { end = 0; }
        _super.call(this, kind, flags, pos, end);
        this.name = name;
        this.text = name;
    }
    return MockIdentifier;
}(MockNode));
exports.MockIdentifier = MockIdentifier;
var MockVariableDeclaration = (function (_super) {
    __extends(MockVariableDeclaration, _super);
    function MockVariableDeclaration(name, kind, flags, pos, end) {
        if (kind === void 0) { kind = ts.SyntaxKind.VariableDeclaration; }
        if (flags === void 0) { flags = 0; }
        if (pos === void 0) { pos = 0; }
        if (end === void 0) { end = 0; }
        _super.call(this, kind, flags, pos, end);
        this.name = name;
    }
    MockVariableDeclaration.of = function (name) {
        return new MockVariableDeclaration(new MockIdentifier(name));
    };
    return MockVariableDeclaration;
}(MockNode));
exports.MockVariableDeclaration = MockVariableDeclaration;
var MockSymbol = (function () {
    function MockSymbol(name, node, flags) {
        if (node === void 0) { node = MockVariableDeclaration.of(name); }
        if (flags === void 0) { flags = 0; }
        this.name = name;
        this.node = node;
        this.flags = flags;
    }
    MockSymbol.prototype.getFlags = function () { return this.flags; };
    MockSymbol.prototype.getName = function () { return this.name; };
    MockSymbol.prototype.getDeclarations = function () { return [this.node]; };
    MockSymbol.prototype.getDocumentationComment = function () { return []; };
    MockSymbol.of = function (name) { return new MockSymbol(name); };
    return MockSymbol;
}());
exports.MockSymbol = MockSymbol;
function expectNoDiagnostics(diagnostics) {
    for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
        var diagnostic = diagnostics_1[_i];
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        console.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
    }
    expect(diagnostics.length).toBe(0);
}
exports.expectNoDiagnostics = expectNoDiagnostics;
function expectValidSources(service, program) {
    expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var sourceFile = _a[_i];
        expectNoDiagnostics(service.getSyntacticDiagnostics(sourceFile.fileName));
        expectNoDiagnostics(service.getSemanticDiagnostics(sourceFile.fileName));
    }
}
exports.expectValidSources = expectValidSources;
function allChildren(node, cb) {
    return ts.forEachChild(node, function (child) {
        var result = cb(node);
        if (result) {
            return result;
        }
        return allChildren(child, cb);
    });
}
exports.allChildren = allChildren;
function findClass(sourceFile, name) {
    return ts.forEachChild(sourceFile, function (node) { return isClass(node) && isNamed(node.name, name) ? node : undefined; });
}
exports.findClass = findClass;
function findVar(sourceFile, name) {
    return allChildren(sourceFile, function (node) { return isVar(node) && isNamed(node.name, name) ? node : undefined; });
}
exports.findVar = findVar;
function isClass(node) {
    return node.kind === ts.SyntaxKind.ClassDeclaration;
}
exports.isClass = isClass;
function isNamed(node, name) {
    return node.kind === ts.SyntaxKind.Identifier && node.text === name;
}
exports.isNamed = isNamed;
function isVar(node) {
    return node.kind === ts.SyntaxKind.VariableDeclaration;
}
exports.isVar = isVar;
//# sourceMappingURL=typescript.mocks.js.map