#!/usr/bin/env node
"use strict";
require('reflect-metadata');
var tsc = require('@angular/tsc-wrapped');
var codegen_1 = require('./codegen');
function codegen(ngOptions, cliOptions, program, host) {
    return codegen_1.CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
}
// CLI entry point
if (require.main === module) {
    var args = require('minimist')(process.argv.slice(2));
    var project = args.p || args.project || '.';
    var cliOptions = new tsc.NgcCliOptions(args);
    tsc.main(project, cliOptions, codegen).then(function (exitCode) { return process.exit(exitCode); }).catch(function (e) {
        console.error(e.stack);
        console.error('Compilation failed');
        process.exit(1);
    });
}
//# sourceMappingURL=main.js.map