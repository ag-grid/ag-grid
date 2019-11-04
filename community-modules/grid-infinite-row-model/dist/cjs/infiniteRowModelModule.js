"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-grid-community/grid-core");
var infiniteRowModel_1 = require("./infiniteRowModel/infiniteRowModel");
exports.InfiniteRowModelModule = {
    moduleName: grid_core_1.ModuleNames.InfiniteRowModelModule,
    rowModels: { 'infinite': infiniteRowModel_1.InfiniteRowModel }
};
