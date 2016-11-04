"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var compiler_host_1 = require('./src/compiler_host');
exports.MetadataWriterHost = compiler_host_1.MetadataWriterHost;
exports.TsickleHost = compiler_host_1.TsickleHost;
var main_1 = require('./src/main');
exports.main = main_1.main;
__export(require('./src/cli_options'));
__export(require('./src/collector'));
__export(require('./src/schema'));
//# sourceMappingURL=index.js.map