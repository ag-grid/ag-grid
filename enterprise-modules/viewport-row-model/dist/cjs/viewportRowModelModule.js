"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var viewportRowModel_1 = require("./viewportRowModel/viewportRowModel");
exports.ViewportRowModelModule = {
    moduleName: core_1.ModuleNames.ViewportRowModelModule,
    rowModels: { 'viewport': viewportRowModel_1.ViewportRowModel },
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=viewportRowModelModule.js.map