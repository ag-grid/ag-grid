"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSideRowModelModule = void 0;
const core_1 = require("@ag-grid-community/core");
const clientSideRowModel_1 = require("./clientSideRowModel/clientSideRowModel");
const filterStage_1 = require("./clientSideRowModel/filterStage");
const sortStage_1 = require("./clientSideRowModel/sortStage");
const flattenStage_1 = require("./clientSideRowModel/flattenStage");
const sortService_1 = require("./clientSideRowModel/sortService");
const filterService_1 = require("./clientSideRowModel/filterService");
const immutableService_1 = require("./clientSideRowModel/immutableService");
const version_1 = require("./version");
exports.ClientSideRowModelModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [clientSideRowModel_1.ClientSideRowModel, filterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage, sortService_1.SortService, filterService_1.FilterService, immutableService_1.ImmutableService],
};
