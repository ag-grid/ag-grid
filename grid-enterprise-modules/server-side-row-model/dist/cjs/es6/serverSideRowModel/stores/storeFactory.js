"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreFactory = void 0;
const core_1 = require("@ag-grid-community/core");
const fullStore_1 = require("./fullStore");
const lazyStore_1 = require("./lazy/lazyStore");
let StoreFactory = class StoreFactory {
    createStore(ssrmParams, parentNode) {
        const storeParams = this.getStoreParams(ssrmParams, parentNode);
        const CacheClass = storeParams.suppressInfiniteScroll ? fullStore_1.FullStore : lazyStore_1.LazyStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    }
    getStoreParams(ssrmParams, parentNode) {
        const userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take infiniteScroll from there if it exists
        const infiniteScroll = this.isInfiniteScroll(userStoreParams);
        const cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        const maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
        const storeParams = {
            suppressInfiniteScroll: !infiniteScroll,
            cacheBlockSize,
            maxBlocksInCache
        };
        return storeParams;
    }
    getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        const maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsService.getNum('maxBlocksInCache');
        const maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
        if (!maxBlocksActive) {
            return undefined;
        }
        if (ssrmParams.dynamicRowHeight) {
            const message = 'AG Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            core_1._.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.dynamicRowHeight');
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            const message = 'AG Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            core_1._.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.autoRowHeightActive');
            return undefined;
        }
        return maxBlocksInCache;
    }
    getBlockSize(infiniteScroll, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        const blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsService.getNum('cacheBlockSize');
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    }
    getLevelSpecificParams(parentNode) {
        const callback = this.gridOptionsService.getCallback('getServerSideGroupLevelParams');
        if (!callback) {
            return undefined;
        }
        const params = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };
        const res = callback(params);
        if (res.storeType != null) {
            res.suppressInfiniteScroll = res.storeType !== "partial";
        }
        return res;
    }
    isInfiniteScroll(storeParams) {
        const res = (storeParams && storeParams.suppressInfiniteScroll != null)
            ? storeParams.suppressInfiniteScroll
            : this.isSuppressServerSideInfiniteScroll();
        return !res;
    }
    isSuppressServerSideInfiniteScroll() {
        return this.gridOptionsService.is('suppressServerSideInfiniteScroll');
    }
};
__decorate([
    core_1.Autowired('gridOptionsService')
], StoreFactory.prototype, "gridOptionsService", void 0);
__decorate([
    core_1.Autowired('columnModel')
], StoreFactory.prototype, "columnModel", void 0);
StoreFactory = __decorate([
    core_1.Bean('ssrmStoreFactory')
], StoreFactory);
exports.StoreFactory = StoreFactory;
