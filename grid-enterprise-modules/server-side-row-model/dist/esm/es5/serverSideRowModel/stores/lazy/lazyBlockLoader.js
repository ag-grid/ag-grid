var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { BeanStub, Autowired, PostConstruct, RowNodeBlockLoader } from "@ag-grid-community/core";
var LazyBlockLoader = /** @class */ (function (_super) {
    __extends(LazyBlockLoader, _super);
    function LazyBlockLoader(cache, parentNode, storeParams) {
        var _this = _super.call(this) || this;
        _this.loadingNodes = new Set();
        _this.checkForLoadQueued = false;
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
    LazyBlockLoader.prototype.getBlockToLoad = function () {
        var _this = this;
        var _a;
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        // quick look-up for priority rows needing loading in viewport.
        for (var i = firstRowInViewport; i <= lastRowInViewport; i++) {
            var node = this.cache.getNodeCachedByDisplayIndex(i);
            if (!node) {
                // if no row details, ignore, as row hasn't been created
                // and it's too expensive to work out its location here
                continue;
            }
            var lazyNode = this.cache.getNodes().getBy('node', node);
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
        var nodesToRefresh = this.cache.getNodesToRefresh();
        var nodeToRefresh = null;
        var nodeToRefreshDist = Number.MAX_SAFE_INTEGER;
        nodesToRefresh.forEach(function (node) {
            if (node.rowIndex == null) {
                nodeToRefresh = node;
                return;
            }
            if (_this.isRowLoading(node.rowIndex)) {
                return;
            }
            var distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
            var distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
            if (distToViewportTop < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportTop;
            }
            if (distToViewportBottom < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportBottom;
            }
        });
        var lazyIndex = (_a = this.cache.getNodes().getBy('node', nodeToRefresh)) === null || _a === void 0 ? void 0 : _a.index;
        return lazyIndex == null ? undefined : this.getBlockStartIndexForIndex(lazyIndex);
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
            success: success,
            fail: fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    };
    LazyBlockLoader.prototype.getNextBlockToLoad = function () {
        var result = this.getBlockToLoad();
        if (result != null) {
            return [String(result), result + this.getBlockSize()];
        }
        return null;
    };
    LazyBlockLoader.prototype.queueLoadCheck = function () {
        var _this = this;
        // already going to check next cycle, ignore.
        if (this.checkForLoadQueued) {
            return;
        }
        this.checkForLoadQueued = true;
        window.queueMicrotask(function () {
            _this.checkForLoadQueued = false;
            _this.queueLoadAction();
        });
    };
    LazyBlockLoader.prototype.queueLoadAction = function () {
        var _this = this;
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
            var _a = __read(this.nextBlockToLoad, 2), startRowString = _a[0], endRow_1 = _a[1];
            var startRow_1 = Number(startRowString);
            this.loaderTimeout = window.setTimeout(function () {
                if (!_this.cache.isAlive()) {
                    return;
                }
                _this.loaderTimeout = undefined;
                _this.attemptLoad(startRow_1, endRow_1);
                _this.nextBlockToLoad = undefined;
            }, this.gridOptionsService.get('blockLoadDebounceMillis'));
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
        Autowired('rowNodeBlockLoader')
    ], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        PostConstruct
    ], LazyBlockLoader.prototype, "init", null);
    return LazyBlockLoader;
}(BeanStub));
export { LazyBlockLoader };
