import {
    Autowired,
    Bean,
    BeanStub,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    LoadSuccessParams,
    RowNode,
    RowNodeBlockLoader,
    RowRenderer,
} from '@ag-grid-community/core';

import { ServerSideRowModel } from '../../serverSideRowModel';
import { LazyCache } from './lazyCache';
import { LazyStore } from './lazyStore';

@Bean('lazyBlockLoadingService')
export class LazyBlockLoadingService extends BeanStub {
    public static DEFAULT_BLOCK_SIZE = 100;

    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('rowModel') private rowModel: ServerSideRowModel;

    // a map of caches to loading nodes
    private cacheLoadingNodesMap: Map<LazyCache, Set<number>> = new Map();

    // if a check is queued to happen this cycle
    private isCheckQueued = false;

    // this is cached for blockLoadDebounce
    private nextBlockToLoad?: { cache: LazyCache; index: number } = undefined;
    private loaderTimeout?: number;

    protected override postConstruct() {
        super.postConstruct();
        // after a block is loaded, check if we have a block to load now that
        // `maxConcurrentDatasourceRequests` has changed
        this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader.BLOCK_LOADED_EVENT, () =>
            this.queueLoadCheck()
        );
    }

    public subscribe(cache: LazyCache) {
        this.cacheLoadingNodesMap.set(cache, new Set());
    }

    public unsubscribe(cache: LazyCache) {
        this.cacheLoadingNodesMap.delete(cache);
    }

    /**
     * Queues a microtask to check if any blocks need to be loaded.
     */
    public queueLoadCheck() {
        if (this.isCheckQueued) {
            return;
        }
        this.isCheckQueued = true;
        window.queueMicrotask(() => {
            this.queueLoadAction();
            this.isCheckQueued = false;
        });
    }

    private queueLoadAction() {
        const nextBlockToLoad = this.getBlockToLoad();
        if (!nextBlockToLoad) {
            return;
        }

        // for blockLoadDebounceMillis, if the next block to load is the same as the last block to load, ignore
        // otherwise cancel existing timeout and requeue
        const isSameBlock =
            this.nextBlockToLoad &&
            this.nextBlockToLoad.cache === nextBlockToLoad.cache &&
            this.nextBlockToLoad.index === nextBlockToLoad.index;
        if (isSameBlock) {
            return;
        }

        if (!this.nextBlockToLoad || !isSameBlock) {
            this.nextBlockToLoad = nextBlockToLoad;
            window.clearTimeout(this.loaderTimeout);

            const startRow = Number(this.nextBlockToLoad.index);
            const cache = this.nextBlockToLoad.cache;
            const endRow = nextBlockToLoad.index + nextBlockToLoad.cache.getBlockSize();
            this.loaderTimeout = window.setTimeout(() => {
                if (!cache.isAlive()) {
                    return;
                }
                this.loaderTimeout = undefined;
                this.attemptLoad(cache, startRow, endRow);
                this.nextBlockToLoad = undefined;
            }, this.gos.get('blockLoadDebounceMillis'));
        }
    }

    private attemptLoad(cache: LazyCache, start: number, end: number) {
        const availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }

        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(cache, start, end);

        // requeue a load action before waiting for a response, this is to enable
        // more than one block to load simultaneously due to maxConcurrentDatasourceRequests
        this.queueLoadCheck();
    }

    private executeLoad(cache: LazyCache, startRow: number, endRow: number) {
        const ssrmParams = cache.getSsrmParams();
        const request: IServerSideGetRowsRequest = {
            startRow,
            endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: (cache as any).store.getParentNode().getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };

        const loadingNodes = this.cacheLoadingNodesMap.get(cache)!;
        const removeNodesFromLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                loadingNodes.delete(startRow + i);
            }
        };

        const addNodesToLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                loadingNodes.add(startRow + i);
            }
        };

        const success = (params: LoadSuccessParams) => {
            this.rowNodeBlockLoader.loadComplete();
            cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
        };

        const fail = () => {
            this.rowNodeBlockLoader.loadComplete();
            cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
        };

        const params: IServerSideGetRowsParams = this.gos.addGridCommonParams({
            request,
            success,
            fail,
            parentNode: (cache as any).store.getParentNode(),
        });

        addNodesToLoadingMap();
        cache.getSsrmParams().datasource?.getRows(params);
    }

    private getBlockToLoad() {
        const firstRowInViewport = this.rowRenderer.getFirstVirtualRenderedRow();
        const lastRowInViewport = this.rowRenderer.getLastVirtualRenderedRow();

        // quick look-up for priority rows needing loading in viewport.
        for (let i = firstRowInViewport; i <= lastRowInViewport; i++) {
            const row = this.rowModel.getRow(i);
            if (!row) {
                continue;
            }

            const store = row.parent && row.parent.childStore;
            if (!store || !(store instanceof LazyStore)) {
                continue;
            }

            const cache: LazyCache = store.getCache();
            const lazyNode = cache.getNodes().getBy('node', row);
            if (!lazyNode) {
                continue;
            }

            const loadingNodes = this.cacheLoadingNodesMap.get(cache);
            if (loadingNodes?.has(lazyNode.index)) {
                continue;
            }

            if (row.__needsRefreshWhenVisible || (row.stub && !row.failedLoad)) {
                return {
                    cache: cache,
                    index: cache.getBlockStartIndex(lazyNode.index),
                };
            }
        }

        let cacheToRefresh: LazyCache | null = null;
        let nodeToRefresh: RowNode | null = null;
        let nodeToRefreshDist: number = Number.MAX_SAFE_INTEGER;

        for (const cache of this.cacheLoadingNodesMap.keys()) {
            const nodesToRefresh = cache.getNodesToRefresh();
            nodesToRefresh.forEach((node) => {
                if (node.rowIndex == null) {
                    nodeToRefresh = node;
                    cacheToRefresh = cache;
                    return;
                }

                const lazyNode = cache.getNodes().getBy('node', node);
                if (!lazyNode) {
                    return;
                }

                const loadingNodes = this.cacheLoadingNodesMap.get(cache);
                if (loadingNodes?.has(lazyNode.index)) {
                    return;
                }

                const distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
                const distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
                if (distToViewportTop < nodeToRefreshDist) {
                    nodeToRefresh = node;
                    nodeToRefreshDist = distToViewportTop;
                    cacheToRefresh = cache;
                }

                if (distToViewportBottom < nodeToRefreshDist) {
                    nodeToRefresh = node;
                    nodeToRefreshDist = distToViewportBottom;
                    cacheToRefresh = cache;
                }
            });
        }

        if (!cacheToRefresh) {
            return undefined;
        }

        const lazyCache = cacheToRefresh as LazyCache;

        const lazyIndex = lazyCache.getNodes().getBy('node', nodeToRefresh)?.index;
        return lazyIndex == null
            ? undefined
            : {
                  cache: lazyCache,
                  index: lazyCache.getBlockStartIndex(lazyIndex),
              };
    }

    public isRowLoading(cache: LazyCache, index: number) {
        return this.cacheLoadingNodesMap.get(cache)?.has(index) ?? false;
    }
}
