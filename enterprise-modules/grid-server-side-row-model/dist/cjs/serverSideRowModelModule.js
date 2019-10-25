"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var serverSideRowModel_1 = require("./serverSideRowModel/serverSideRowModel");
exports.ServerSideRowModelModule = {
    moduleName: grid_core_1.ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': serverSideRowModel_1.ServerSideRowModel },
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
