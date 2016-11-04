"use strict";
var fs = require('fs');
var path = require('path');
var ts = require('typescript');
var tsc_1 = require('./tsc');
var compiler_host_1 = require('./compiler_host');
var cli_options_1 = require('./cli_options');
function main(project, cliOptions, codegen) {
    try {
        var projectDir = project;
        if (fs.lstatSync(project).isFile()) {
            projectDir = path.dirname(project);
        }
        // file names in tsconfig are resolved relative to this absolute path
        var basePath = path.resolve(process.cwd(), cliOptions.basePath || projectDir);
        // read the configuration options from wherever you store them
        var _a = tsc_1.tsc.readConfiguration(project, basePath), parsed_1 = _a.parsed, ngOptions_1 = _a.ngOptions;
        ngOptions_1.basePath = basePath;
        var host_1 = ts.createCompilerHost(parsed_1.options, true);
        // HACK: patch the realpath to solve symlink issue here:
        // https://github.com/Microsoft/TypeScript/issues/9552
        // todo(misko): remove once facade symlinks are removed
        host_1.realpath = function (path) { return path; };
        var program_1 = ts.createProgram(parsed_1.fileNames, parsed_1.options, host_1);
        var errors = program_1.getOptionsDiagnostics();
        tsc_1.check(errors);
        if (ngOptions_1.skipTemplateCodegen || !codegen) {
            codegen = function () { return Promise.resolve(null); };
        }
        return codegen(ngOptions_1, cliOptions, program_1, host_1).then(function () {
            // Create a new program since codegen files were created after making the old program
            var newProgram = ts.createProgram(parsed_1.fileNames, parsed_1.options, host_1, program_1);
            tsc_1.tsc.typeCheck(host_1, newProgram);
            // Emit *.js with Decorators lowered to Annotations, and also *.js.map
            var tsicklePreProcessor = new compiler_host_1.TsickleHost(host_1, newProgram);
            tsc_1.tsc.emit(tsicklePreProcessor, newProgram);
            if (!ngOptions_1.skipMetadataEmit) {
                // Emit *.metadata.json and *.d.ts
                // Not in the same emit pass with above, because tsickle erases
                // decorators which we want to read or document.
                // Do this emit second since TypeScript will create missing directories for us
                // in the standard emit.
                var metadataWriter = new compiler_host_1.MetadataWriterHost(host_1, newProgram, ngOptions_1);
                tsc_1.tsc.emit(metadataWriter, newProgram);
            }
        });
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.main = main;
// CLI entry point
if (require.main === module) {
    var args_1 = require('minimist')(process.argv.slice(2));
    var project = args_1.p || args_1.project || '.';
    var cliOptions = new cli_options_1.CliOptions(args_1);
    main(project, cliOptions).then(function (exitCode) { return process.exit(exitCode); }).catch(function (e) {
        console.error(e.stack);
        console.error('Compilation failed');
        process.exit(1);
    });
}
//# sourceMappingURL=main.js.map