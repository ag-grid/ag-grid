"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var setFilter_1 = require("./setFilter/setFilter");
var setFloatingFilter_1 = require("./setFilter/setFloatingFilter");
exports.SetFilterModule = {
    moduleName: grid_core_1.ModuleNames.SetFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agSetColumnFilter', componentClass: setFilter_1.SetFilter },
        { componentName: 'agSetColumnFloatingFilter', componentClass: setFloatingFilter_1.SetFloatingFilterComp },
    ],
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
