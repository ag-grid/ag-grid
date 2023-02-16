var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { BeanStub, Autowired, _, PostConstruct, RowNodeBlockLoader } from "@ag-grid-community/core";
var LazyBlockLoader = /** @class */ (function (_super) {
    __extends(LazyBlockLoader, _super);
    function LazyBlockLoader(cache, parentNode, storeParams) {
        var _this = _super.call(this) || this;
        _this.loadingNodes = new Set();
        _this.loaderTimeout = undefined;
        _this.nextBlockToLoad = undefined;
        _this.parentNode = parentNode;
        _this.cache = cache;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyBlockLoader.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader.BLOCK_LOADED_EVENT, function () { return _this.queueLoadAction(); });
    };
    LazyBlockLoader.prototype.isRowLoading = function (index) {
        return this.loadingNodes.has(index);
    };
    LazyBlockLoader.prototype.doesRowNeedLoaded = function (index) {
        // block already loading, don't duplicate request
        if (this.loadingNodes.has(index)) {
            return false;
        }
        var node = this.cache.getRowByStoreIndex(index);
        if (!node) {
            return false;
        }
        // user has manually refreshed this node
        if (node.__needsRefresh) {
            return true;
        }
        var firstRow = this.api.getFirstDisplayedRow();
        var lastRow = this.api.getLastDisplayedRow();
        var isRowInViewport = node.rowIndex != null && node.rowIndex >= firstRow && node.rowIndex <= lastRow;
        // other than refreshing nodes, only ever load nodes in viewport
        if (!isRowInViewport) {
            return false;
        }
        // if node is a loading stub, or if it needs reverified, we refresh
        return (node.stub && !node.failedLoad) || node.__needsRefreshWhenVisible;
    };
    LazyBlockLoader.prototype.getBlocksToLoad = function () {
        var _this = this;
        var indexesToLoad = new Set();
        // filter for nodes somewhat reasonably close to viewport, so we don't refresh all data
        // sort by distance to viewport, so user is making relevant requests
        this.cache.getNodeMapEntries().forEach(function (_a) {
            var _b = __read(_a, 2), stringIndex = _b[0], node = _b[1];
            var numericIndex = Number(stringIndex);
            var blockStart = _this.getBlockStartIndexForIndex(numericIndex);
            // if node is a loading stub, or has manually been marked as needsRefresh we refresh
            if (_this.doesRowNeedLoaded(numericIndex)) {
                indexesToLoad.add(blockStart);
                return;
            }
        });
        return __spread(indexesToLoad);
    };
    LazyBlockLoader.prototype.getNodeRanges = function () {
        var _this = this;
        var ranges = {};
        this.getBlocksToLoad().forEach(function (index) {
            var rangeSize = _.oneOrGreater(_this.gridOptionsService.getNum('cacheBlockSize')) || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
            var translatedIndex = index - (index % rangeSize);
            ranges[translatedIndex] = translatedIndex + rangeSize;
        });
        return ranges;
    };
    LazyBlockLoader.prototype.reset = function () {
        this.loadingNodes.clear();
        clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;
    };
    LazyBlockLoader.prototype.executeLoad = function (startRow, endRow) {
        var _this = this;
        var _a;
        var ssrmParams = this.cache.getSsrmParams();
        var request = {
            startRow: startRow,
            endRow: endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: this.parentNode.getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };
        var removeNodesFromLoadingMap = function () {
            for (var i = 0; i < endRow - startRow; i++) {
                _this.loadingNodes.delete(startRow + i);
            }
        };
        var addNodesToLoadingMap = function () {
            for (var i = 0; i < endRow - startRow; i++) {
                _this.loadingNodes.add(startRow + i);
            }
        };
        var success = function (params) {
            _this.rowNodeBlockLoader.loadComplete();
            _this.cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
            _this.queueLoadAction();
        };
        var fail = function () {
            _this.rowNodeBlockLoader.loadComplete();
            _this.cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
            _this.queueLoadAction();
        };
        var params = {
            request: request,
            successCallback: function (rowData, rowCount) { return success({ rowData: rowData, rowCount: rowCount }); },
            success: success,
            failCallback: fail,
            fail: fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    };
    LazyBlockLoader.prototype.isBlockInViewport = function (blockStart, blockEnd) {
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        var blockContainsViewport = blockStart <= firstRowInViewport && blockEnd >= lastRowInViewport;
        var blockEndIsInViewport = blockEnd > firstRowInViewport && blockEnd < lastRowInViewport;
        var blockStartIsInViewport = blockStart > firstRowInViewport && blockStart < lastRowInViewport;
        return blockContainsViewport || blockEndIsInViewport || blockStartIsInViewport;
    };
    LazyBlockLoader.prototype.getNextBlockToLoad = function () {
        var _this = this;
        var ranges = this.getNodeRanges();
        var toLoad = Object.entries(ranges);
        if (toLoad.length === 0) {
            return null;
        }
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        toLoad.sort(function (_a, _b) {
            var _c = __read(_a, 2), aStart = _c[0], aEnd = _c[1];
            var _d = __read(_b, 2), bStart = _d[0], bEnd = _d[1];
            var isAInViewport = _this.isBlockInViewport(Number(aStart), aEnd);
            var isBInViewport = _this.isBlockInViewport(Number(bStart), bEnd);
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
    };
    LazyBlockLoader.prototype.queueLoadAction = function () {
        var _this = this;
        var _a;
        var nextBlockToLoad = this.getNextBlockToLoad();
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
            var _b = __read(this.nextBlockToLoad, 2), startRowString = _b[0], endRow_1 = _b[1];
            var startRow_1 = Number(startRowString);
            this.loaderTimeout = window.setTimeout(function () {
                _this.loaderTimeout = undefined;
                _this.attemptLoad(startRow_1, endRow_1);
                _this.nextBlockToLoad = undefined;
            }, (_a = this.gridOptionsService.getNum('blockLoadDebounceMillis')) !== null && _a !== void 0 ? _a : 0);
        }
    };
    LazyBlockLoader.prototype.attemptLoad = function (start, end) {
        var availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }
        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(start, end);
        this.queueLoadAction();
    };
    LazyBlockLoader.prototype.getBlockSize = function () {
        return this.storeParams.cacheBlockSize || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
    };
    LazyBlockLoader.prototype.getBlockStartIndexForIndex = function (storeIndex) {
        var blockSize = this.getBlockSize();
        return storeIndex - (storeIndex % blockSize);
    };
    LazyBlockLoader.prototype.getBlockBoundsForIndex = function (storeIndex) {
        var startOfBlock = this.getBlockStartIndexForIndex(storeIndex);
        var blockSize = this.getBlockSize();
        return [startOfBlock, startOfBlock + blockSize];
    };
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
    return LazyBlockLoader;
}(BeanStub));
export { LazyBlockLoader };
