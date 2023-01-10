"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowGroupingModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const aggregationStage_1 = require("./rowGrouping/aggregationStage");
const groupStage_1 = require("./rowGrouping/groupStage");
const pivotColDefService_1 = require("./rowGrouping/pivotColDefService");
const pivotStage_1 = require("./rowGrouping/pivotStage");
const aggFuncService_1 = require("./rowGrouping/aggFuncService");
const gridHeaderDropZones_1 = require("./rowGrouping/columnDropZones/gridHeaderDropZones");
const filterAggregatesStage_1 = require("./rowGrouping/filterAggregatesStage");
const version_1 = require("./version");
exports.RowGroupingModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.RowGroupingModule,
    beans: [aggregationStage_1.AggregationStage, filterAggregatesStage_1.FilterAggregatesStage, groupStage_1.GroupStage, pivotColDefService_1.PivotColDefService, pivotStage_1.PivotStage, aggFuncService_1.AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: gridHeaderDropZones_1.GridHeaderDropZones }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
