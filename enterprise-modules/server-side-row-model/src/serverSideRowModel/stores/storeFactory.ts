import {
    _,
    Autowired,
    Bean,
    IServerSideStore,
    RowNode,
    ServerSideGroupLevelParams,
    GetServerSideGroupLevelParamsParams,
    ColumnModel,
    WithoutGridCommon,
    GridOptionsService
} from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
import { FullStore } from "./fullStore";
import { LazyStore } from "./lazy/lazyStore";

@Bean('ssrmStoreFactory')
export class StoreFactory {

    @Autowired('gridOptionsService') private gridOptionsService: GridOptionsService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public createStore(ssrmParams: SSRMParams, parentNode: RowNode): IServerSideStore {
        const storeParams = this.getStoreParams(ssrmParams, parentNode);

        const CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;

        return new CacheClass(ssrmParams, storeParams, parentNode);
    }

    private getStoreParams(ssrmParams: SSRMParams, parentNode: RowNode): ServerSideGroupLevelParams {

        const userStoreParams = this.getLevelSpecificParams(parentNode);

        // if user provided overrideParams, we take infiniteScroll from there if it exists
        const infiniteScroll = this.isInfiniteScroll(userStoreParams);
        const cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        const maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);

        const storeParams: ServerSideGroupLevelParams = {
            suppressInfiniteScroll: !infiniteScroll,
            cacheBlockSize,
            maxBlocksInCache
        };

        return storeParams;
    }

    private getMaxBlocksInCache(infiniteScroll: boolean, ssrmParams: SSRMParams, userStoreParams?: ServerSideGroupLevelParams)
        : number | undefined {

        if (!infiniteScroll) { return undefined; }

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

    private getBlockSize(infiniteScroll: boolean, userStoreParams?: ServerSideGroupLevelParams): number | undefined {
        if (!infiniteScroll) { return undefined; }

        const blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsService.getNum('cacheBlockSize');

        if (blockSize != null && blockSize > 0) {
            return blockSize;
        } else {
            return 100;
        }
    }

    private getLevelSpecificParams(parentNode: RowNode): ServerSideGroupLevelParams | undefined {

        const callback = this.gridOptionsService.getCallback('getServerSideGroupLevelParams');
        if (!callback) { return undefined; }

        const params: WithoutGridCommon<GetServerSideGroupLevelParamsParams> = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };

        const res = callback(params);
        if (res.storeType!=null) {
            res.suppressInfiniteScroll = res.storeType!=="partial";
        }

        return res;
    }

    private isInfiniteScroll(storeParams?: ServerSideGroupLevelParams): boolean {
        const res = (storeParams && storeParams.suppressInfiniteScroll != null)
            ? storeParams.suppressInfiniteScroll
            : this.isSuppressServerSideInfiniteScroll();
        return !res;
    }

    private isSuppressServerSideInfiniteScroll(): boolean {
        return this.gridOptionsService.is('suppressServerSideInfiniteScroll');
    }
}