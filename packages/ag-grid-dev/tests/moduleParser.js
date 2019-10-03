"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var exec = require('child_process').exec;
var referencedFiles = [];
function getReferencedImports(source) {
    var transpiledCode = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
    });
    var lines = transpiledCode.outputText.split(';');
    var requireLines = lines.filter(function (line) { return line.indexOf('require') !== -1; }).map(function (line) { return line.trim(); });
    var nameToImports = requireLines.reduce(function (acc, requireLine) {
        var name = requireLine.replace('var ', '').replace(/ .*/, '');
        var value = requireLine.replace(/.*require\(/, '').replace(/\).*/, '').replace(/'/g, '').replace(/"/g, '');
        acc[name] = value;
        return acc;
    }, {});
    var module = lines.filter(function (line) { return line.indexOf('__esModule') === -1; }).filter(function (line) { return line.indexOf('exports.') !== -1; })[0];
    var referencedImports = Object.keys(nameToImports).filter(function (dependency) { return module.indexOf(dependency) !== -1; });
    return referencedImports.map(function (referencedImport) { return nameToImports[referencedImport]; })
        .filter(function (referencedImport) { return referencedImport !== 'ag-grid-community'; });
}
/** Generate documention for all classes in a set of .ts files */
function generateDocumentation(fileName, options) {
    // Build a program using the set of root file names in fileNames
    var program = ts.createProgram([fileName], options);
    var checker = program.getTypeChecker(); // necessary - don't comment out
    // Visit every sourceFile in the program
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var sourceFile = _a[_i];
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }
    /** visit nodes finding exported classes */
    function visit(node) {
        if (node.kind === ts.SyntaxKind.VariableStatement && node.parent.fileName.indexOf('chartsModule') !== -1) {
            var identifierToResolvedFilename_1 = {};
            node.parent.identifiers.forEach(function (identifier) {
                var resolutions = ts.resolveModuleName(identifier, node.parent.resolvedPath, options, ts.createCompilerHost(options));
                if (resolutions.resolvedModule) {
                    identifierToResolvedFilename_1[identifier] = resolutions.resolvedModule.resolvedFileName.replace(/.*\/src/, '').replace('.ts', '.js');
                }
            });
            var referencedImports = getReferencedImports(node.parent.text);
            referencedFiles = referencedImports.map(function (referencedImport) { return identifierToResolvedFilename_1[referencedImport]; });
        }
    }
}
var _a = process.argv, a = _a[0], b = _a[1], input = _a[2], bundle = _a[3], include = _a[4];
generateDocumentation(input, {
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
});
referencedFiles.forEach(function (referencedFile) {
    exec("grep " + referencedFile + " " + bundle + " | wc -l", function (err, stdout) {
        if (err)
            return console.log(err);
        var expectFilesInBundle = include === "true";
        var result = stdout.trim();
        if (result === '0' && expectFilesInBundle) {
            console.log("ERROR! " + referencedFiles[0] + " not present in " + bundle + ", but we expect it to be");
            process.exit(1);
        }
        else if (result !== '0' && !expectFilesInBundle) {
            console.log("ERROR! " + referencedFiles[0] + " is present in " + bundle + " but it shouldn't be");
            process.exit(1);
        }
    });
});
