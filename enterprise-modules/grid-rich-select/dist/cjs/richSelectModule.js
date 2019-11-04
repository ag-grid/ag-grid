"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-grid-community/grid-core");
var grid_core_2 = require("@ag-grid-enterprise/grid-core");
var richSelectCellEditor_1 = require("./richSelect/richSelectCellEditor");
exports.RichSelectModule = {
    moduleName: grid_core_1.ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        { componentName: 'agRichSelect', componentClass: richSelectCellEditor_1.RichSelectCellEditor },
        { componentName: 'agRichSelectCellEditor', componentClass: richSelectCellEditor_1.RichSelectCellEditor }
    ],
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
