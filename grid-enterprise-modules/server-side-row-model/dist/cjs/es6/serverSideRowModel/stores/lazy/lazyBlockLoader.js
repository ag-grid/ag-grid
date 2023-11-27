"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyBlockLoader = void 0;
const core_1 = require("@ag-grid-community/core");
class LazyBlockLoader extends core_1.BeanStub {
    constructor(cache, parentNode, storeParams) {
        super();
        this.loadingNodes = new Set();
        this.checkForLoadQueued = false;
        this.loaderTimeout = undefined;
        this.nextBlockToLoad = undefined;
        this.parentNode = parentNode;
        this.cache = cache;
        this.storeParams = storeParams;
    }
    init() {
        this.addManagedListener(this.rowNodeBlockLoader, core_1.RowNodeBlockLoader.BLOCK_LOADED_EVENT, () => this.queueLoadAction());
    }
    isRowLoading(index) {
        return this.loadingNodes.has(index);
    }
    getBlockToLoad() {
        var _a;
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        // quick look-up for priority rows needing loading in viewport.
        for (let i = firstRowInViewport; i <= lastRowInViewport; i++) {
            const node = this.cache.getNodeCachedByDisplayIndex(i);
            if (!node) {
                // if no row details, ignore, as row hasn't been created
                // and it's too expensive to work out its location here
                continue;
            }
            const lazyNode = this.cache.getNodes().getBy('node', node);
            if (!lazyNode) {
                continue;
            }
            if (this.isRowLoading(lazyNode.index)) {
                continue;
            }
            if (node.__needsRefreshWhenVisible || (node.stub && !node.failedLoad)) {
                return this.getBlockStartIndexForIndex(lazyNode.index);
            }
        }
        const nodesToRefresh = this.cache.getNodesToRefresh();
        let nodeToRefresh = null;
        let nodeToRefreshDist = Number.MAX_SAFE_INTEGER;
        nodesToRefresh.forEach(node => {
            if (node.rowIndex == null) {
                nodeToRefresh = node;
                return;
            }
            if (this.isRowLoading(node.rowIndex)) {
                return;
            }
            const distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
            const distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
            if (distToViewportTop < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportTop;
            }
            if (distToViewportBottom < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportBottom;
            }
        });
        const lazyIndex = (_a = this.cache.getNodes().getBy('node', nodeToRefresh)) === null || _a === void 0 ? void 0 : _a.index;
        return lazyIndex == null ? undefined : this.getBlockStartIndexForIndex(lazyIndex);
    }
    reset() {
        this.loadingNodes.clear();
        clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;
    }
    executeLoad(startRow, endRow) {
        var _a;
        const ssrmParams = this.cache.getSsrmParams();
        const request = {
            startRow,
            endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: this.parentNode.getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };
        const removeNodesFromLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                this.loadingNodes.delete(startRow + i);
            }
        };
        const addNodesToLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                this.loadingNodes.add(startRow + i);
            }
        };
        const success = (params) => {
            this.rowNodeBlockLoader.loadComplete();
            this.cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
            this.queueLoadAction();
        };
        const fail = () => {
            this.rowNodeBlockLoader.loadComplete();
            this.cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
            this.queueLoadAction();
        };
        const params = {
            request,
            success,
            fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    }
    getNextBlockToLoad() {
        const result = this.getBlockToLoad();
        if (result != null) {
            return [String(result), result + this.getBlockSize()];
        }
        return null;
    }
    queueLoadCheck() {
        // already going to check next cycle, ignore.
        if (this.checkForLoadQueued) {
            return;
        }
        this.checkForLoadQueued = true;
        window.queueMicrotask(() => {
            this.checkForLoadQueued = false;
            this.queueLoadAction();
        });
    }
    queueLoadAction() {
        const nextBlockToLoad = this.getNextBlockToLoad();
        if (!nextBlockToLoad) {
            // there's no block we should be loading right now, clear the timeouts
            window.clearTimeout(this.loaderTimeout);
            this.loaderTimeout = undefined;
            this.nextBlockToLoad = undefined;
            return;
        }
        // if the next required block has changed, reset the loading timeout
        if (!this.nextBlockToLoad || (this.nextBlockToLoad[0] !== nextBlockToLoad[0] && this.nextBlockToLoad[1] !== nextBlockToLoad[1])) {
            this.nextBlockToLoad = nextBlockToLoad;
            window.clearTimeout(this.loaderTimeout);
            const [startRowString, endRow] = this.nextBlockToLoad;
            const startRow = Number(startRowString);
            this.loaderTimeout = window.setTimeout(() => {
                if (!this.cache.isAlive()) {
                    return;
                }
                this.loaderTimeout = undefined;
                this.attemptLoad(startRow, endRow);
                this.nextBlockToLoad = undefined;
            }, this.gridOptionsService.get('blockLoadDebounceMillis'));
        }
    }
    attemptLoad(start, end) {
        const availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }
        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(start, end);
        this.queueLoadAction();
    }
    getBlockSize() {
        return this.storeParams.cacheBlockSize || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
    }
    getBlockStartIndexForIndex(storeIndex) {
        const blockSize = this.getBlockSize();
        return storeIndex - (storeIndex % blockSize);
    }
    getBlockBoundsForIndex(storeIndex) {
        const startOfBlock = this.getBlockStartIndexForIndex(storeIndex);
        const blockSize = this.getBlockSize();
        return [startOfBlock, startOfBlock + blockSize];
    }
}
LazyBlockLoader.DEFAULT_BLOCK_SIZE = 100;
__decorate([
    (0, core_1.Autowired)('gridApi')
], LazyBlockLoader.prototype, "api", void 0);
__decorate([
    (0, core_1.Autowired)('rowNodeBlockLoader')
], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    core_1.PostConstruct
], LazyBlockLoader.prototype, "init", null);
exports.LazyBlockLoader = LazyBlockLoader;
