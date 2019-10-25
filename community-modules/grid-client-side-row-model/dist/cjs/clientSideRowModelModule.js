"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var clientSideRowModel_1 = require("./clientSideRowModel/clientSideRowModel");
var filterStage_1 = require("./clientSideRowModel/filterStage");
var sortStage_1 = require("./clientSideRowModel/sortStage");
var flattenStage_1 = require("./clientSideRowModel/flattenStage");
var sortService_1 = require("./clientSideRowModel/sortService");
var filterService_1 = require("./clientSideRowModel/filterService");
var immutableService_1 = require("./clientSideRowModel/immutableService");
exports.ClientSideRowModelModule = {
    moduleName: grid_core_1.ModuleNames.ClientSideRowModelModule,
    beans: [filterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage, sortService_1.SortService, filterService_1.FilterService, immutableService_1.ImmutableService],
    rowModels: { clientSide: clientSideRowModel_1.ClientSideRowModel }
};
