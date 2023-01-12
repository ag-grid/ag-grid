var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub, Autowired, _, PostConstruct, RowNodeBlockLoader } from "@ag-grid-community/core";
export class LazyBlockLoader extends BeanStub {
    constructor(cache, parentNode, storeParams) {
        super();
        this.loadingNodes = new Set();
        this.loaderTimeout = undefined;
        this.nextBlockToLoad = undefined;
        this.parentNode = parentNode;
        this.cache = cache;
        this.storeParams = storeParams;
    }
    init() {
        this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader.BLOCK_LOADED_EVENT, () => this.queueLoadAction());
    }
    isRowLoading(index) {
        return index in this.loadingNodes;
    }
    doesRowNeedLoaded(index) {
        // block already loading, don't duplicate request
        if (this.loadingNodes.has(index)) {
            return false;
        }
        const node = this.cache.getRowByStoreIndex(index);
        if (!node) {
            return false;
        }
        // user has manually refreshed this node
        if (node.__needsRefresh) {
            return true;
        }
        const firstRow = this.api.getFirstDisplayedRow();
        const lastRow = this.api.getLastDisplayedRow();
        const isRowInViewport = node.rowIndex != null && node.rowIndex >= firstRow && node.rowIndex <= lastRow;
        // other than refreshing nodes, only ever load nodes in viewport
        if (!isRowInViewport) {
            return false;
        }
        // if node is a loading stub, or if it needs reverified, we refresh
        return (node.stub && !node.failedLoad) || node.__needsRefreshWhenVisible;
    }
    getBlocksToLoad() {
        const indexesToLoad = new Set();
        // filter for nodes somewhat reasonably close to viewport, so we don't refresh all data
        // sort by distance to viewport, so user is making relevant requests
        this.cache.getNodeMapEntries().forEach(([stringIndex, node]) => {
            const numericIndex = Number(stringIndex);
            const blockStart = this.getBlockStartIndexForIndex(numericIndex);
            // if node is a loading stub, or has manually been marked as needsRefresh we refresh
            if (this.doesRowNeedLoaded(numericIndex)) {
                indexesToLoad.add(blockStart);
                return;
            }
        });
        return [...indexesToLoad];
    }
    getNodeRanges() {
        const ranges = {};
        this.getBlocksToLoad().forEach(index => {
            const rangeSize = _.oneOrGreater(this.gridOptionsService.getNum('cacheBlockSize')) || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
            const translatedIndex = index - (index % rangeSize);
            ranges[translatedIndex] = translatedIndex + rangeSize;
        });
        return ranges;
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
            successCallback: (rowData, rowCount) => success({ rowData, rowCount }),
            success,
            failCallback: fail,
            fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context')
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    }
    isBlockInViewport(blockStart, blockEnd) {
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        const blockContainsViewport = blockStart <= firstRowInViewport && blockEnd >= lastRowInViewport;
        const blockEndIsInViewport = blockEnd > firstRowInViewport && blockEnd < lastRowInViewport;
        const blockStartIsInViewport = blockStart > firstRowInViewport && blockStart < lastRowInViewport;
        return blockContainsViewport || blockEndIsInViewport || blockStartIsInViewport;
    }
    getNextBlockToLoad() {
        const ranges = this.getNodeRanges();
        const toLoad = Object.entries(ranges);
        if (toLoad.length === 0) {
            return null;
        }
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        toLoad.sort(([aStart, aEnd], [bStart, bEnd]) => {
            const isAInViewport = this.isBlockInViewport(Number(aStart), aEnd);
            const isBInViewport = this.isBlockInViewport(Number(bStart), bEnd);
            // always prioritise loading blocks in viewport
            if (isAInViewport) {
                return -1;
            }
            // always prioritise loading blocks in viewport
            if (isBInViewport) {
                return 1;
            }
            // prioritise based on how close to the viewport the block is
            return Math.abs(firstRowInViewport - Number(aStart)) - Math.abs(firstRowInViewport - Number(bStart));
        });
        return toLoad[0];
    }
    queueLoadAction() {
        var _a;
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
                this.loaderTimeout = undefined;
                this.attemptLoad(startRow, endRow);
                this.nextBlockToLoad = undefined;
            }, (_a = this.gridOptionsService.getNum('blockLoadDebounceMillis')) !== null && _a !== void 0 ? _a : 0);
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
    Autowired('gridApi')
], LazyBlockLoader.prototype, "api", void 0);
__decorate([
    Autowired('columnApi')
], LazyBlockLoader.prototype, "columnApi", void 0);
__decorate([
    Autowired('rowNodeBlockLoader')
], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    PostConstruct
], LazyBlockLoader.prototype, "init", null);
