import type {
    BeanCollection,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    LoadSuccessParams,
    NamedBean,
    RowNode,
    RowRenderer,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _getGrandTotalRow,
    _getMaxConcurrentDatasourceRequests,
} from 'ag-grid-community';

import type { ServerSideRowModel } from '../../serverSideRowModel';
import type { LazyCache } from './lazyCache';
import type { LazyStore } from './lazyStore';

export class LazyBlockLoadingService extends BeanStub implements NamedBean {
    beanName = 'lazyBlockLoadingSvc' as const;

    private outboundRequests: number = 0;
    private maxOutboundRequests: number | undefined;

    private rowRenderer: RowRenderer;
    private rowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowRenderer = beans.rowRenderer;
        this.rowModel = beans.rowModel as ServerSideRowModel;
    }

    // a map of caches to loading nodes
    private readonly cacheLoadingNodesMap: Map<LazyCache, Set<number>> = new Map();

    // if a check is queued to happen this cycle
    private isCheckQueued = false;

    // this is cached for blockLoadDebounce
    private nextBlockToLoad?: BlockToLoad = undefined;
    private loaderTimeout?: number;

    // set from a request until the next macrotask, so completions in that window are known to be synchronous
    private isInLoadTask = false;
    private syncLoadedBlocks: BlockToLoad[] = [];
    private yieldTimeout?: number;
    private requestCount = 0;

    // framework wrappers can re-emit onGridReady in a microtask, so the first load waits a task to stay after it
    private isGridReadyDelivered = false;

    public postConstruct() {
        this.maxOutboundRequests = _getMaxConcurrentDatasourceRequests(this.gos);

        const onGridReady = () => {
            window.setTimeout(() => {
                this.isGridReadyDelivered = true;
                if (this.isCheckQueued) {
                    this.runLoadCheck();
                }
            });
        };
        this.eventSvc.addListener('gridReady', onGridReady, true);
        this.addDestroyFunc(() => this.eventSvc.removeListener('gridReady', onGridReady, true));
    }

    public subscribe(cache: LazyCache) {
        this.cacheLoadingNodesMap.set(cache, new Set());
    }

    public unsubscribe(cache: LazyCache) {
        this.cacheLoadingNodesMap.delete(cache);
    }

    /** Queues a microtask to check for blocks to load, so a synchronous datasource fills stubs before paint. */
    public queueLoadCheck() {
        if (this.isCheckQueued) {
            return;
        }
        this.isCheckQueued = true;
        if (this.isGridReadyDelivered) {
            queueMicrotask(() => this.runLoadCheck());
        }
    }

    // timers call this directly rather than through a microtask, so flushing fake timers still loads synchronously
    private runLoadCheck(debouncedBlock?: BlockToLoad) {
        // this loop does the work of any check queued while it runs
        this.isCheckQueued = true;
        try {
            if (debouncedBlock && !this.loadsBlock(() => this.attemptLoad(debouncedBlock))) {
                return;
            }
            while (this.isAlive()) {
                const nextBlockToLoad = this.getBlockToLoad();
                if (!nextBlockToLoad) {
                    return;
                }
                const isOffViewportAfterLoad = !nextBlockToLoad.inViewport && this.isInLoadTask;
                const isLoadedThisTask = this.syncLoadedBlocks.some((block) => isSameBlock(nextBlockToLoad, block));
                if (isOffViewportAfterLoad || isLoadedThisTask) {
                    // only rendered rows must fill before paint, so yield to the browser between other loads
                    this.yieldTimeout ??= window.setTimeout(() => {
                        this.yieldTimeout = undefined;
                        this.runLoadCheck();
                    });
                    return;
                }
                if (!this.loadsBlock(() => this.queueLoadAction(nextBlockToLoad))) {
                    return;
                }
            }
        } finally {
            this.isCheckQueued = false;
        }
    }

    private loadsBlock(load: () => void): boolean {
        const requestCount = this.requestCount;
        load();
        return this.requestCount !== requestCount;
    }

    private onLoadComplete(): void {
        this.outboundRequests -= 1;
        this.queueLoadCheck();
    }

    private hasAvailableLoadBandwidth() {
        if (this.maxOutboundRequests === undefined) {
            return true;
        }
        return this.outboundRequests < this.maxOutboundRequests;
    }

    private queueLoadAction(nextBlockToLoad: BlockToLoad) {
        // for blockLoadDebounceMillis, if the next block to load is the same as the last block to load, ignore
        // otherwise cancel existing timeout and requeue
        if (isSameBlock(nextBlockToLoad, this.nextBlockToLoad)) {
            return;
        }

        window.clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;

        const debounceMillis = this.gos.get('blockLoadDebounceMillis');
        if (!debounceMillis) {
            this.nextBlockToLoad = undefined;
            this.attemptLoad(nextBlockToLoad);
            return;
        }

        this.nextBlockToLoad = nextBlockToLoad;
        this.loaderTimeout = window.setTimeout(() => {
            this.loaderTimeout = undefined;
            this.nextBlockToLoad = undefined;
            this.runLoadCheck(nextBlockToLoad);
        }, debounceMillis);
    }

    private attemptLoad({ cache, index: startRow }: BlockToLoad) {
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (!cache.isAlive() || !this.hasAvailableLoadBandwidth()) {
            return;
        }
        this.executeLoad(cache, startRow, startRow + cache.getBlockSize());
    }

    private executeLoad(cache: LazyCache, startRow: number, endRow: number) {
        const ssrmParams = cache.getSsrmParams();
        const parentNode = cache.store.getParentNode() as RowNode;
        const request: IServerSideGetRowsRequest = {
            startRow,
            endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: parentNode.getRoute() ?? [],
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

        let settled = false;
        const settle = (applyResult: () => void) => {
            if (settled) {
                this.warn(338);
                return;
            }
            settled = true;
            if (this.isInLoadTask) {
                this.syncLoadedBlocks.push({ cache, index: startRow });
            }
            this.onLoadComplete();
            // cleared first so the store update fired by the result can evict these rows
            removeNodesFromLoadingMap();
            applyResult();
        };

        const success = (params: LoadSuccessParams) =>
            settle(() => cache.onLoadSuccess(startRow, endRow - startRow, params));
        const fail = () => settle(() => cache.onLoadFailed(startRow, endRow - startRow));

        const isRootStore = parentNode.level === -1;
        const store = isRootStore ? cache.store : undefined;
        const needsGrandTotal = isRootStore && store?.grandTotalData === undefined && !!_getGrandTotalRow(this.gos);

        const params: IServerSideGetRowsParams = _addGridCommonParams(this.gos, {
            request,
            success,
            fail,
            parentNode,
            needsGrandTotal,
        });

        addNodesToLoadingMap();
        this.outboundRequests += 1;
        this.requestCount += 1;
        if (!this.isInLoadTask) {
            this.isInLoadTask = true;
            window.setTimeout(() => {
                this.isInLoadTask = false;
                this.syncLoadedBlocks = [];
            });
        }
        cache.getSsrmParams().datasource?.getRows(params);
    }

    private getBlockToLoad(): (BlockToLoad & { inViewport: boolean }) | undefined {
        const firstRowInViewport = this.rowRenderer.firstRenderedRow;
        const lastRowInViewport = this.rowRenderer.lastRenderedRow;

        // quick look-up for priority rows needing loading in viewport.
        for (let i = firstRowInViewport; i <= lastRowInViewport; i++) {
            const row = this.rowModel.getRow(i);
            if (!row) {
                continue;
            }

            const store = row.parent?.childStore as LazyStore | undefined;
            if (!store) {
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
                    inViewport: true,
                };
            }
        }

        let cacheToRefresh: LazyCache | null = null;
        let nodeToRefresh: RowNode | null = null;
        let nodeToRefreshDist: number = Number.MAX_SAFE_INTEGER;

        for (const cache of this.cacheLoadingNodesMap.keys()) {
            const nodesToRefresh = cache.getNodesToRefresh();
            nodesToRefresh.forEach((node) => {
                const lazyNode = cache.getNodes().getBy('node', node);
                if (!lazyNode) {
                    return;
                }

                const loadingNodes = this.cacheLoadingNodesMap.get(cache);
                if (loadingNodes?.has(lazyNode.index)) {
                    return;
                }

                if (node.rowIndex == null) {
                    nodeToRefresh = node;
                    cacheToRefresh = cache;
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
                  inViewport: false,
              };
    }

    public isRowLoading(cache: LazyCache, index: number) {
        return this.cacheLoadingNodesMap.get(cache)?.has(index) ?? false;
    }
}

type BlockToLoad = { cache: LazyCache; index: number };

const isSameBlock = (a: BlockToLoad, b: BlockToLoad | undefined): boolean =>
    a.cache === b?.cache && a.index === b.index;
