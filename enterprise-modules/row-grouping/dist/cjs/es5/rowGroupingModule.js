"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var aggregationStage_1 = require("./rowGrouping/aggregationStage");
var groupStage_1 = require("./rowGrouping/groupStage");
var pivotColDefService_1 = require("./rowGrouping/pivotColDefService");
var pivotStage_1 = require("./rowGrouping/pivotStage");
var aggFuncService_1 = require("./rowGrouping/aggFuncService");
var gridHeaderDropZones_1 = require("./rowGrouping/columnDropZones/gridHeaderDropZones");
var filterAggregatesStage_1 = require("./rowGrouping/filterAggregatesStage");
exports.RowGroupingModule = {
    moduleName: core_1.ModuleNames.RowGroupingModule,
    beans: [aggregationStage_1.AggregationStage, filterAggregatesStage_1.FilterAggregatesStage, groupStage_1.GroupStage, pivotColDefService_1.PivotColDefService, pivotStage_1.PivotStage, aggFuncService_1.AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: gridHeaderDropZones_1.GridHeaderDropZones }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
