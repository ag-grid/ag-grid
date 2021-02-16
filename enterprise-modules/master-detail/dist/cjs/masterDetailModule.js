"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var detailCellRenderer_1 = require("./masterDetail/detailCellRenderer");
exports.MasterDetailModule = {
    moduleName: core_1.ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: detailCellRenderer_1.DetailCellRenderer }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=masterDetailModule.js.map