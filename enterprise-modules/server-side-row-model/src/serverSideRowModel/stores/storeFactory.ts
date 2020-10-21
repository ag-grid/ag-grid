import {
    Autowired,
    Bean,
    GridOptionsWrapper,
    IServerSideStore,
    RowNode,
    ServerSideStoreParams,
    GetServerSideStoreParamsParams,
    ServerSideStoreType
} from "@ag-grid-community/core";
import {ClientSideStore} from "./clientSideStore";
import {InfiniteStore} from "./infiniteStore";
import {SSRMParams} from "../serverSideRowModel";

@Bean('ssrmStoreFactory')
export class StoreFactory {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public createStore(ssrmParams: SSRMParams, parentNode: RowNode): IServerSideStore {
        const storeParams = this.getStoreParams(parentNode);

        const CacheClass = storeParams.storeType === ServerSideStoreType.ClientSide ? ClientSideStore : InfiniteStore;

        return new CacheClass(ssrmParams, storeParams, parentNode);
    }

    private getStoreParams(parentNode: RowNode): ServerSideStoreParams {

        const userStoreParams = this.getLevelSpecificParams(parentNode);

        // if user provided overrideParams, we take storeType from there if it exists
        const storeType = this.getStoreType(userStoreParams);
        const cacheBlockSize = this.getBlockSize(storeType, userStoreParams);

        const storeParams: ServerSideStoreParams = {
            storeType,
            cacheBlockSize
        };

        return storeParams;
    }

    private getBlockSize(storeType: ServerSideStoreType, userStoreParams?: ServerSideStoreParams): number | undefined {
        if (storeType==ServerSideStoreType.ClientSide) { return undefined; }

        const blockSize = (userStoreParams && userStoreParams.cacheBlockSize!=null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsWrapper.getCacheBlockSize();

        if (blockSize!=null && blockSize>0) {
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
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined
        };

        return callback(params);
    }

    private getStoreType(storeParams?: ServerSideStoreParams): ServerSideStoreType {

        const storeType = (storeParams && storeParams.storeType!=null)
            ? storeParams.storeType
            : this.gridOptionsWrapper.getServerSideStoreType();

        switch (storeType) {
            case ServerSideStoreType.Infinite :
            case ServerSideStoreType.ClientSide :
                return storeType;
            case null :
            case undefined :
                return ServerSideStoreType.Infinite;
            default :
                const types = Object.keys(ServerSideStoreType).join(', ');
                console.log(`ag-Grid: invalid Server Side Store Type ${storeType}, valid types are [${types}]`);
                return ServerSideStoreType.Infinite;
        }
    }
}