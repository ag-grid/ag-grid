"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var clipboardService_1 = require("./clipboard/clipboardService");
exports.ClipboardModule = {
    moduleName: grid_core_1.ModuleNames.ClipboardModule,
    beans: [clipboardService_1.ClipboardService],
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
