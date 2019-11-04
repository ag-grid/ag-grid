"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-grid-community/grid-core");
var grid_core_2 = require("@ag-grid-enterprise/grid-core");
var detailCellRenderer_1 = require("./masterDetail/detailCellRenderer");
exports.MasterDetailModule = {
    moduleName: grid_core_1.ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: detailCellRenderer_1.DetailCellRenderer }
    ],
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
