import type {
    BeanCollection,
    ColumnModel,
    FuncColsService,
    GetServerSideGroupLevelParamsParams,
    IServerSideStore,
    NamedBean,
    RowNode,
    ServerSideGroupLevelParams,
    WithoutGridCommon,
} from 'ag-grid-community';
import { BeanStub, _warnOnce } from 'ag-grid-community';

import type { SSRMParams } from '../serverSideRowModel';
import { FullStore } from './fullStore';
import { LazyStore } from './lazy/lazyStore';

export class StoreFactory extends BeanStub implements NamedBean {
    beanName = 'ssrmStoreFactory' as const;

    private columnModel: ColumnModel;
    private funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.funcColsService = beans.funcColsService;
    }

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
            maxBlocksInCache,
        };

        return storeParams;
    }

    private getMaxBlocksInCache(
        infiniteScroll: boolean,
        ssrmParams: SSRMParams,
        userStoreParams?: ServerSideGroupLevelParams
    ): number | undefined {
        if (!infiniteScroll) {
            return undefined;
        }

        const maxBlocksInCache =
            userStoreParams && userStoreParams.maxBlocksInCache != null
                ? userStoreParams.maxBlocksInCache
                : this.gos.get('maxBlocksInCache');

        const maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;

        if (!maxBlocksActive) {
            return undefined;
        }

        if (ssrmParams.dynamicRowHeight) {
            const message =
                'Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            _warnOnce(message);
            return undefined;
        }

        if (this.columnModel.isAutoRowHeightActive()) {
            const message =
                'Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            _warnOnce(message);
            return undefined;
        }

        return maxBlocksInCache;
    }

    private getBlockSize(infiniteScroll: boolean, userStoreParams?: ServerSideGroupLevelParams): number | undefined {
        if (!infiniteScroll) {
            return undefined;
        }

        const blockSize =
            userStoreParams && userStoreParams.cacheBlockSize != null
                ? userStoreParams.cacheBlockSize
                : this.gos.get('cacheBlockSize');

        if (blockSize != null && blockSize > 0) {
            return blockSize;
        } else {
            return 100;
        }
    }

    private getLevelSpecificParams(parentNode: RowNode): ServerSideGroupLevelParams | undefined {
        const callback = this.gos.getCallback('getServerSideGroupLevelParams');
        if (!callback) {
            return undefined;
        }

        const params: WithoutGridCommon<GetServerSideGroupLevelParamsParams> = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.funcColsService.getRowGroupColumns(),
            pivotColumns: this.funcColsService.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode(),
        };

        const res = callback(params);

        return res;
    }

    private isInfiniteScroll(storeParams?: ServerSideGroupLevelParams): boolean {
        const res =
            storeParams && storeParams.suppressInfiniteScroll != null
                ? storeParams.suppressInfiniteScroll
                : this.isSuppressServerSideInfiniteScroll();
        return !res;
    }

    private isSuppressServerSideInfiniteScroll(): boolean {
        return this.gos.get('suppressServerSideInfiniteScroll');
    }
}
