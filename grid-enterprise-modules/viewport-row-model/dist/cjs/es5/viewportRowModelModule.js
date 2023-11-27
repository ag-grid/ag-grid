"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportRowModelModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var version_1 = require("./version");
var viewportRowModel_1 = require("./viewportRowModel/viewportRowModel");
exports.ViewportRowModelModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.ViewportRowModelModule,
    rowModel: 'viewport',
    beans: [viewportRowModel_1.ViewportRowModel],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
