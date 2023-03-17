"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiFilterModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const multiFilter_1 = require("./multiFilter/multiFilter");
const multiFloatingFilter_1 = require("./multiFilter/multiFloatingFilter");
const version_1 = require("./version");
exports.MultiFilterModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.MultiFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agMultiColumnFilter', componentClass: multiFilter_1.MultiFilter },
        { componentName: 'agMultiColumnFloatingFilter', componentClass: multiFloatingFilter_1.MultiFloatingFilterComp },
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
