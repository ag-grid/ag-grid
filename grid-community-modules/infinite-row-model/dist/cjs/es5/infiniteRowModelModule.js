"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfiniteRowModelModule = void 0;
var core_1 = require("@ag-grid-community/core");
var infiniteRowModel_1 = require("./infiniteRowModel/infiniteRowModel");
var version_1 = require("./version");
exports.InfiniteRowModelModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [infiniteRowModel_1.InfiniteRowModel],
};
