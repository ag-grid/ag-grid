import * as ts from "typescript";

const {exec} = require('child_process');

let referencedFiles = []

function getReferencedImports(source) {
    let transpiledCode = ts.transpileModule(source, {
        compilerOptions: {module: ts.ModuleKind.CommonJS}
    });
    let lines = transpiledCode.outputText.split(';')
    let requireLines = lines.filter(line => line.indexOf('require') !== -1).map(line => line.trim())

    let nameToImports = requireLines.reduce((acc, requireLine) => {
        let name = requireLine.replace('var ', '').replace(/ .*/, '');
        let value = requireLine.replace(/.*require\(/, '').replace(/\).*/, '').replace(/'/g, '').replace(/"/g, '');
        acc[name] = value;
        return acc;
    }, {});

    let module = lines.filter(line => line.indexOf('__esModule') === -1).filter(line => line.indexOf('exports.') !== -1)[0]

    let referencedImports = Object.keys(nameToImports).filter(dependency => module.indexOf(dependency) !== -1)

    return referencedImports.map(referencedImport => nameToImports[referencedImport])
        .filter(referencedImport => referencedImport !== 'ag-grid-community');
}

/** Generate documention for all classes in a set of .ts files */
function generateDocumentation(fileName: string, options: ts.CompilerOptions): void {
    // Build a program using the set of root file names in fileNames
    let program = ts.createProgram([fileName], options);
    let checker = program.getTypeChecker(); // necessary - don't comment out

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }

    /** visit nodes finding exported classes */
    function visit(node: any) {
        if (node.kind === ts.SyntaxKind.VariableStatement && node.parent.fileName.indexOf('chartsModule') !== -1) {
            const identifierToResolvedFilename = {};
            node.parent.identifiers.forEach(identifier => {
                const resolutions = ts.resolveModuleName(identifier, node.parent.resolvedPath, options, ts.createCompilerHost(options));
                if (resolutions.resolvedModule) {
                    identifierToResolvedFilename[identifier] = resolutions.resolvedModule.resolvedFileName.replace(/.*\/src/, '').replace('.ts', '.js');
                }
            });

            const referencedImports = getReferencedImports(node.parent.text);
            referencedFiles = referencedImports.map(referencedImport => identifierToResolvedFilename[referencedImport])
        }
    }
}

const [a, b, input, bundle, include] = process.argv;

generateDocumentation(input, {
    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
});

referencedFiles.forEach(referencedFile => {
    exec(`grep ${referencedFile} ${bundle} | wc -l`, (err, stdout) => {
        if (err) return console.log(err);

        const expectFilesInBundle = include === "true";
        const result = stdout.trim();
        if (result === '0' && expectFilesInBundle) {
            console.log(`ERROR! ${referencedFiles[0]} not present in ${bundle}, but we expect it to be`);
            process.exit(1);
        } else if (result !== '0' && !expectFilesInBundle) {
            console.log(`ERROR! ${referencedFiles[0]} is present in ${bundle} but it shouldn't be`);
            process.exit(1);
        }
    })
});


