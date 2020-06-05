"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var rangeController_1 = require("./rangeSelection/rangeController");
var fillHandle_1 = require("./rangeSelection/fillHandle");
var rangeHandle_1 = require("./rangeSelection/rangeHandle");
var selectionHandleFactory_1 = require("./rangeSelection/selectionHandleFactory");
exports.RangeSelectionModule = {
    moduleName: core_1.ModuleNames.RangeSelectionModule,
    beans: [rangeController_1.RangeController, selectionHandleFactory_1.SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: fillHandle_1.FillHandle },
        { componentName: 'AgRangeHandle', componentClass: rangeHandle_1.RangeHandle }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=rangeSelectionModule.js.map