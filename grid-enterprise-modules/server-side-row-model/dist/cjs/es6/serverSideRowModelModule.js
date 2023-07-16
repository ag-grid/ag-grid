"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideRowModelModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const serverSideRowModel_1 = require("./serverSideRowModel/serverSideRowModel");
const storeUtils_1 = require("./serverSideRowModel/stores/storeUtils");
const blockUtils_1 = require("./serverSideRowModel/blocks/blockUtils");
const nodeManager_1 = require("./serverSideRowModel/nodeManager");
const transactionManager_1 = require("./serverSideRowModel/transactionManager");
const expandListener_1 = require("./serverSideRowModel/listeners/expandListener");
const sortListener_1 = require("./serverSideRowModel/listeners/sortListener");
const filterListener_1 = require("./serverSideRowModel/listeners/filterListener");
const storeFactory_1 = require("./serverSideRowModel/stores/storeFactory");
const listenerUtils_1 = require("./serverSideRowModel/listeners/listenerUtils");
const serverSideSelectionService_1 = require("./serverSideRowModel/services/serverSideSelectionService");
const version_1 = require("./version");
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
