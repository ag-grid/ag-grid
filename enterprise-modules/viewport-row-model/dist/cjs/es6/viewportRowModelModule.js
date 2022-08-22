"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const viewportRowModel_1 = require("./viewportRowModel/viewportRowModel");
exports.ViewportRowModelModule = {
    moduleName: core_1.ModuleNames.ViewportRowModelModule,
    rowModels: { viewport: viewportRowModel_1.ViewportRowModel },
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
