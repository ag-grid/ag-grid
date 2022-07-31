"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const richSelectCellEditor_1 = require("./richSelect/richSelectCellEditor");
exports.RichSelectModule = {
    moduleName: core_1.ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        { componentName: 'agRichSelect', componentClass: richSelectCellEditor_1.RichSelectCellEditor },
        { componentName: 'agRichSelectCellEditor', componentClass: richSelectCellEditor_1.RichSelectCellEditor }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
