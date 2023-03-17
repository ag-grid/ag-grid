"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideRowModelModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var serverSideRowModel_1 = require("./serverSideRowModel/serverSideRowModel");
var storeUtils_1 = require("./serverSideRowModel/stores/storeUtils");
var blockUtils_1 = require("./serverSideRowModel/blocks/blockUtils");
var nodeManager_1 = require("./serverSideRowModel/nodeManager");
var transactionManager_1 = require("./serverSideRowModel/transactionManager");
var expandListener_1 = require("./serverSideRowModel/listeners/expandListener");
var sortListener_1 = require("./serverSideRowModel/listeners/sortListener");
var filterListener_1 = require("./serverSideRowModel/listeners/filterListener");
var storeFactory_1 = require("./serverSideRowModel/stores/storeFactory");
var listenerUtils_1 = require("./serverSideRowModel/listeners/listenerUtils");
var serverSideSelectionService_1 = require("./serverSideRowModel/services/serverSideSelectionService");
var version_1 = require("./version");
exports.ServerSideRowModelModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.ServerSideRowModelModule,
    rowModel: 'serverSide',
    beans: [serverSideRowModel_1.ServerSideRowModel, expandListener_1.ExpandListener, sortListener_1.SortListener, storeUtils_1.StoreUtils, blockUtils_1.BlockUtils, nodeManager_1.NodeManager, transactionManager_1.TransactionManager,
        filterListener_1.FilterListener, storeFactory_1.StoreFactory, listenerUtils_1.ListenerUtils, serverSideSelectionService_1.ServerSideSelectionService],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
