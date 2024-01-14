"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFilterModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const setFilter_1 = require("./setFilter/setFilter");
const setFloatingFilter_1 = require("./setFilter/setFloatingFilter");
const version_1 = require("./version");
exports.SetFilterModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agSetColumnFilter', componentClass: setFilter_1.SetFilter },
        { componentName: 'agSetColumnFloatingFilter', componentClass: setFloatingFilter_1.SetFloatingFilterComp },
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
