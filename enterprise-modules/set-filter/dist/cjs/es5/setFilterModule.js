"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var setFilter_1 = require("./setFilter/setFilter");
var setFloatingFilter_1 = require("./setFilter/setFloatingFilter");
exports.SetFilterModule = {
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
//# sourceMappingURL=setFilterModule.js.map