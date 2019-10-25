"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var rangeController_1 = require("./rangeSelection/rangeController");
var fillHandle_1 = require("./rangeSelection/fillHandle");
var rangeHandle_1 = require("./rangeSelection/rangeHandle");
exports.RangeSelectionModule = {
    moduleName: grid_core_1.ModuleNames.RangeSelectionModule,
    beans: [rangeController_1.RangeController],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: fillHandle_1.FillHandle },
        { componentName: 'AgRangeHandle', componentClass: rangeHandle_1.RangeHandle }
    ],
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
