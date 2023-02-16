"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportRowModelModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const version_1 = require("./version");
const viewportRowModel_1 = require("./viewportRowModel/viewportRowModel");
exports.ViewportRowModelModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.ViewportRowModelModule,
    rowModels: { viewport: viewportRowModel_1.ViewportRowModel },
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
