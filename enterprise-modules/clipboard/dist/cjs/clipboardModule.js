"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var clipboardService_1 = require("./clipboard/clipboardService");
exports.ClipboardModule = {
    moduleName: core_1.ModuleNames.ClipboardModule,
    beans: [clipboardService_1.ClipboardService],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=clipboardModule.js.map