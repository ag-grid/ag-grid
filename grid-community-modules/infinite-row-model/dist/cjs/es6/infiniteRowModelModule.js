"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfiniteRowModelModule = void 0;
const core_1 = require("@ag-grid-community/core");
const infiniteRowModel_1 = require("./infiniteRowModel/infiniteRowModel");
const version_1 = require("./version");
exports.InfiniteRowModelModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [infiniteRowModel_1.InfiniteRowModel],
};
