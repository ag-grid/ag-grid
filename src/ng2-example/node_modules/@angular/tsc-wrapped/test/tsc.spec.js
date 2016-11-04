"use strict";
var ts = require('typescript');
var tsc_1 = require('../src/tsc');
describe('options parsing', function () {
    var tsc = new tsc_1.Tsc(function () { return "\n{\n    \"angularCompilerOptions\": {\n        \"googleClosureOutput\": true\n    },\n    \"compilerOptions\": {\n        \"module\": \"commonjs\",\n        \"outDir\": \"built\"\n    }\n}"; }, function () { return ['tsconfig.json']; });
    it('should combine all options into ngOptions', function () {
        var _a = tsc.readConfiguration('projectDir', 'basePath'), parsed = _a.parsed, ngOptions = _a.ngOptions;
        expect(ngOptions).toEqual({
            genDir: 'basePath',
            googleClosureOutput: true,
            module: ts.ModuleKind.CommonJS,
            outDir: 'basePath/built',
            configFilePath: undefined
        });
    });
});
//# sourceMappingURL=tsc.spec.js.map