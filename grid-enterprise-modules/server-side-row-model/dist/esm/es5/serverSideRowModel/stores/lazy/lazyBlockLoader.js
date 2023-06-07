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
    LazyBlockLoader.prototype.getNextBlockToLoad = function () {
        var result = this.getBlockToLoad();
        if (result != null && result < 0) {
            this.getBlockToLoad();
        }
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
                if (!_this.cache.isAlive()) {
                    return;
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eUJsb2NrTG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvbGF6eS9sYXp5QmxvY2tMb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUF1RixhQUFhLEVBQUUsa0JBQWtCLEVBQWlELE1BQU0seUJBQXlCLENBQUM7QUFHck87SUFBcUMsbUNBQVE7SUFtQnpDLHlCQUFZLEtBQWdCLEVBQUUsVUFBbUIsRUFBRSxXQUF1QztRQUExRixZQUNJLGlCQUFPLFNBSVY7UUFoQk8sa0JBQVksR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUt0Qyx3QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFDcEMsbUJBQWEsR0FBdUIsU0FBUyxDQUFDO1FBQzlDLHFCQUFlLEdBQWlDLFNBQVMsQ0FBQztRQU05RCxLQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixLQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7SUFDbkMsQ0FBQztJQUdPLDhCQUFJLEdBQVo7UUFEQSxpQkFHQztRQURHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsa0JBQWtCLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxlQUFlLEVBQUUsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO0lBQzFILENBQUM7SUFFTSxzQ0FBWSxHQUFuQixVQUFvQixLQUFhO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLHdDQUFjLEdBQXRCOztRQUNJLElBQU0sa0JBQWtCLEdBQUcs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