import {
    _,
    Autowired,
    Bean,
    GridOptionsWrapper,
    IServerSideStore,
    RowNode,
    ServerSideStoreParams,
    GetServerSideStoreParamsParams,
    ServerSideStoreType,
    ColumnModel
} from "@ag-grid-community/core";
import { PartialStore } from "./partialStore";
import { SSRMParams } from "../serverSideRowModel";
import { FullStore } from "./fullStore";

@Bean('ssrmStoreFactory')
export class StoreFactory {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public createStore(ssrmParams: SSRMParams, parentNode: RowNode): IServerSideStore {
        const storeParams = this.getStoreParams(ssrmParams, parentNode);

        const CacheClass = storeParams.storeType === 'partial' ? PartialStore : FullStore;

        return new CacheClass(ssrmParams, storeParams, parentNode);
    }

    private getStoreParams(ssrmParams: SSRMParams, parentNode: RowNode): ServerSideStoreParams {

        const userStoreParams = this.getLevelSpecificParams(parentNode);

        // if user provided overrideParams, we take storeType from there if it exists
        const storeType = this.getStoreType(userStoreParams);
        const cacheBlockSize = this.getBlockSize(storeType, userStoreParams);
        const maxBlocksInCache = this.getMaxBlocksInCache(storeType, ssrmParams, userStoreParams);

        const storeParams: ServerSideStoreParams = {
            storeType,
            cacheBlockSize,
            maxBlocksInCache
        };

        return storeParams;
    }

    private getMaxBlocksInCache(storeType: ServerSideStoreType, ssrmParams: SSRMParams, userStoreParams?: ServerSideStoreParams)
        : number | undefined {

        if (storeType == 'full') { return undefined; }

        const maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsWrapper.getMaxBlocksInCache();

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

    private getBlockSize(storeType: ServerSideStoreType, userStoreParams?: ServerSideStoreParams): number | undefined {
        if (storeType == 'full') { return undefined; }

        const blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsWrapper.getCacheBlockSize();

        if (blockSize != null && blockSize > 0) {
            return blockSize;
        } else {
            return 100;
        }
    }

    private getLevelSpecificParams(parentNode: RowNode): ServerSideStoreParams | undefined {

        const callback = this.gridOptionsWrapper.getServerSideStoreParamsFunc();
        if (!callback) { return undefined; }

        const params: GetServerSideStoreParamsParams = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };

        return callback(params);
    }

    private getStoreType(storeParams?: ServerSideStoreParams): ServerSideStoreType {

        const storeType = (storeParams && storeParams.storeType != null)
            ? storeParams.storeType
            : this.gridOptionsWrapper.getServerSideStoreType();

        switch (storeType) {
            case 'partial':
            case 'full':
                return storeType;
            case null:
            case undefined:
                return 'full';
            default:
                const serverTypes: ServerSideStoreType[] = ['full', 'partial'];
                const types = serverTypes.join(', ');
                console.warn(`AG Grid: invalid Server Side Store Type ${storeType}, valid types are [${types}]`);
                return 'partial';
        }
    }
}