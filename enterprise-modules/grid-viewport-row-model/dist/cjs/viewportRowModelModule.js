"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var viewportRowModel_1 = require("./viewportRowModel/viewportRowModel");
exports.ViewportRowModelModule = {
    moduleName: grid_core_1.ModuleNames.ViewportRowModelModule,
    rowModels: { 'viewport': viewportRowModel_1.ViewportRowModel },
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
