"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var serverSideRowModel_1 = require("./serverSideRowModel/serverSideRowModel");
exports.ServerSideRowModelModule = {
    moduleName: core_1.ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': serverSideRowModel_1.ServerSideRowModel },
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=serverSideRowModelModule.js.map