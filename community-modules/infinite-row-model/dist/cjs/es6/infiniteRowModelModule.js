"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const infiniteRowModel_1 = require("./infiniteRowModel/infiniteRowModel");
exports.InfiniteRowModelModule = {
    moduleName: core_1.ModuleNames.InfiniteRowModelModule,
    rowModels: { infinite: infiniteRowModel_1.InfiniteRowModel }
};
