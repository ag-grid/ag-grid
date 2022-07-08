"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const clientSideRowModel_1 = require("./clientSideRowModel/clientSideRowModel");
const filterStage_1 = require("./clientSideRowModel/filterStage");
const sortStage_1 = require("./clientSideRowModel/sortStage");
const flattenStage_1 = require("./clientSideRowModel/flattenStage");
const sortService_1 = require("./clientSideRowModel/sortService");
const filterService_1 = require("./clientSideRowModel/filterService");
const immutableService_1 = require("./clientSideRowModel/immutableService");
exports.ClientSideRowModelModule = {
    moduleName: core_1.ModuleNames.ClientSideRowModelModule,
    beans: [filterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage, sortService_1.SortService, filterService_1.FilterService, immutableService_1.ImmutableService],
    rowModels: { clientSide: clientSideRowModel_1.ClientSideRowModel }
};
