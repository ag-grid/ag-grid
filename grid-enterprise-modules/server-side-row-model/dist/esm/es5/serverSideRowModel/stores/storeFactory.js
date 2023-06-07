var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean } from "@ag-grid-community/core";
import { FullStore } from "./fullStore";
import { LazyStore } from "./lazy/lazyStore";
var StoreFactory = /** @class */ (function () {
    function StoreFactory() {
    }
    StoreFactory.prototype.createStore = function (ssrmParams, parentNode) {
        var storeParams = this.getStoreParams(ssrmParams, parentNode);
        var CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    };
    StoreFactory.prototype.getStoreParams = function (ssrmParams, parentNode) {
        var userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take infiniteScroll from there if it exists
        var infiniteScroll = this.isInfiniteScroll(userStoreParams);
        var cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        var maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
        var storeParams = {
            suppressInfiniteScroll: !infiniteScroll,
            cacheBlockSize: cacheBlockSize,
            maxBlocksInCache: maxBlocksInCache
        };
        return storeParams;
    };
    StoreFactory.prototype.getMaxBlocksInCache = function (infiniteScroll, ssrmParams, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        var maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsService.getNum('maxBlocksInCache');
        var maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
        if (!maxBlocksActive) {
            return undefined;
        }
        if (ssrmParams.dynamicRowHeight) {
            var message_1 = 'AG Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            _.doOnce(function () { return console.warn(message_1); }, 'storeFactory.maxBlocksInCache.dynamicRowHeight');
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            var message_2 = 'AG Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            _.doOnce(function () { return console.warn(message_2); }, 'storeFactory.maxBlocksInCache.autoRowHeightActive');
            return undefined;
        }
        return maxBlocksInCache;
    };
    StoreFactory.prototype.getBlockSize = function (infiniteScroll, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        var blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsService.getNum('cacheBlockSize');
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    };
    StoreFactory.prototype.getLevelSpecificParams = function (parentNode) {
        var callback = this.gridOptionsService.getCallback('getServerSideGroupLevelParams');
        if (!callback) {
            return undefined;
        }
        var params = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };
        var res = callback(params);
        if (res.storeType != null) {
            res.suppressInfiniteScroll = res.storeType !== "partial";
        }
        return res;
    };
    StoreFactory.prototype.isInfiniteScroll = function (storeParams) {
        var res = (storeParams && storeParams.suppressInfiniteScroll != null)
            ? storeParams.suppressInfiniteScroll
            : this.isSuppressServerSideInfiniteScroll();
        return !res;
    };
    StoreFactory.prototype.isSuppressServerSideInfiniteScroll = function () {
        return this.gridOptionsService.is('suppressServerSideInfiniteScroll');
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
    return StoreFactory;
}());
export { StoreFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvc3RvcmVGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFRUCxNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRzdDO0lBQUE7SUE0R0EsQ0FBQztJQXZHVSxrQ0FBVyxHQUFsQixVQUFtQixVQUFzQixFQUFFLFVBQW1CO1FBQzFELElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWhFLElBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFOUUsT0FBTyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFTyxxQ0FBYyxHQUF0QixVQUF1QixVQUFzQixFQUFFLFVBQW1CO1FBRTlELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVoRSxrRkFBa0Y7UUFDbEYsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzFFLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDLENB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