var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean } from "@ag-grid-community/core";
import { FullStore } from "./fullStore";
import { LazyStore } from "./lazy/lazyStore";
let StoreFactory = class StoreFactory {
    createStore(ssrmParams, parentNode) {
        const storeParams = this.getStoreParams(ssrmParams, parentNode);
        const CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;
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
            _.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.dynamicRowHeight');
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            const message = 'AG Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            _.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.autoRowHeightActive');
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
    Autowired('gridOptionsService')
], StoreFactory.prototype, "gridOptionsService", void 0);
__decorate([
    Autowired('columnModel')
], StoreFactory.prototype, "columnModel", void 0);
StoreFactory = __decorate([
    Bean('ssrmStoreFactory')
], StoreFactory);
export { StoreFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvc3RvcmVGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFRUCxNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRzdDLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7SUFLZCxXQUFXLENBQUMsVUFBc0IsRUFBRSxVQUFtQjtRQUMxRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVoRSxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlFLE9BQU8sSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRU8sY0FBYyxDQUFDLFVBQXNCLEVBQUUsVUFBbUI7UUFFOUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWhFLGtGQUFrRjtRQUNsRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDMUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUUv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