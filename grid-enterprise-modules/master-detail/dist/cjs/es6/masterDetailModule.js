"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDetailModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const detailCellRenderer_1 = require("./masterDetail/detailCellRenderer");
const detailCellRendererCtrl_1 = require("./masterDetail/detailCellRendererCtrl");
const version_1 = require("./version");
exports.MasterDetailModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: detailCellRenderer_1.DetailCellRenderer }
    ],
    controllers: [
        { controllerName: 'detailCellRenderer', controllerClass: detailCellRendererCtrl_1.DetailCellRendererCtrl }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
