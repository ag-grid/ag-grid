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
import { _, Autowired, Bean, BeanStub, Events, NumberSequence, PostConstruct, PreDestroy } from "@ag-grid-community/core";
import { InfiniteCache } from "./infiniteCache";
var InfiniteRowModel = /** @class */ (function (_super) {
    __extends(InfiniteRowModel, _super);
    function InfiniteRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InfiniteRowModel.prototype.getRowBounds = function (index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    };
    // we don't implement as lazy row heights is not supported in this row model
    InfiniteRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) {
        return false;
    };
    InfiniteRowModel.prototype.init = function () {
        var _this = this;
        if (!this.gridOptionsService.isRowModelType('infinite')) {
            return;
        }
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.addEventListeners();
        this.addDestroyFunc(function () { return _this.destroyCache(); });
        this.verifyProps();
    };
    InfiniteRowModel.prototype.verifyProps = function () {
        if (this.gridOptionsService.exists('initialGroupOrderComparator')) {
            var message_1 = "AG Grid: initialGroupOrderComparator cannot be used with Infinite Row Model. If using Infinite Row Model, then sorting is done on the server side, nothing to do with the client.";
            _.doOnce(function () { return console.warn(message_1); }, 'IRM.InitialGroupOrderComparator');
        }
    };
    InfiniteRowModel.prototype.start = function () {
        this.setDatasource(this.gridOptionsService.get('datasource'));
    };
    InfiniteRowModel.prototype.destroyDatasource = function () {
        if (this.datasource) {
            this.getContext().destroyBean(this.datasource);
            this.rowRenderer.datasourceChanged();
            this.datasource = null;
        }
    };
    InfiniteRowModel.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onCacheUpdated.bind(this));
    };
    InfiniteRowModel.prototype.onFilterChanged = function () {
        this.reset();
    };
    InfiniteRowModel.prototype.onSortChanged = function () {
        this.reset();
    };
    InfiniteRowModel.prototype.onColumnEverything = function () {
        var resetRequired;
        // if cache params, we require reset only if sort model has changed. we don't need to check
        // for filter model, as the filter manager will fire an event when columns change that result
        // in the filter changing.
        if (this.cacheParams) {
            resetRequired = this.isSortModelDifferent();
        }
        else {
            // if no cacheParams, means first time creating the cache, so always create one
            resetRequired = true;
        }
        if (resetRequired) {
            this.reset();
        }
    };
    InfiniteRowModel.prototype.isSortModelDifferent = function () {
        return !_.jsonEquals(this.cacheParams.sortModel, this.sortController.getSortModel());
    };
    InfiniteRowModel.prototype.getType = function () {
        return 'infinite';
    };
    InfiniteRowModel.prototype.setDatasource = function (datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.reset();
        }
    };
    InfiniteRowModel.prototype.isEmpty = function () {
        return !this.infiniteCache;
    };
    InfiniteRowModel.prototype.isRowsToRender = function () {
        return !!this.infiniteCache;
    };
    InfiniteRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        return this.infiniteCache ? this.infiniteCache.getRowNodesInRange(firstInRange, lastInRange) : [];
    };
    InfiniteRowModel.prototype.reset = function () {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (!this.datasource) {
            return;
        }
        // if user is providing id's, then this means we can keep the selection between datasource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        var getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        var userGeneratingIds = getRowIdFunc != null;
        if (!userGeneratingIds) {
            this.selectionService.reset();
        }
        this.resetCache();
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.createModelUpdatedEvent = function () {
        return {
            type: Events.EVENT_MODEL_UPDATED,
            // not sure if these should all be false - noticed if after implementing,
            // maybe they should be true?
            newPage: false,
            newData: false,
            keepRenderedRows: true,
            animate: false
        };
    };
    InfiniteRowModel.prototype.resetCache = function () {
        // if not first time creating a cache, need to destroy the old one
        this.destroyCache();
        this.cacheParams = {
            // the user provided datasource
            datasource: this.datasource,
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),
            rowNodeBlockLoader: this.rowNodeBlockLoader,
            // properties - this way we take a snapshot of them, so if user changes any, they will be
            // used next time we create a new cache, which is generally after a filter or sort change,
            // or a new datasource is set
            initialRowCount: this.defaultIfInvalid(this.gridOptionsService.getNum('infiniteInitialRowCount'), 1),
            maxBlocksInCache: this.gridOptionsService.getNum('maxBlocksInCache'),
            rowHeight: this.gridOptionsService.getRowHeightAsNumber(),
            // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
            // the current page and request first row of next page
            overflowSize: this.defaultIfInvalid(this.gridOptionsService.getNum('cacheOverflowSize'), 1),
            // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
            // server for one page at a time. so the default if not specified is 100.
            blockSize: this.defaultIfInvalid(this.gridOptionsService.getNum('cacheBlockSize'), 100),
            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new NumberSequence()
        };
        this.infiniteCache = this.createBean(new InfiniteCache(this.cacheParams));
    };
    InfiniteRowModel.prototype.defaultIfInvalid = function (value, defaultValue) {
        return value > 0 ? value : defaultValue;
    };
    InfiniteRowModel.prototype.destroyCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache = this.destroyBean(this.infiniteCache);
        }
    };
    InfiniteRowModel.prototype.onCacheUpdated = function () {
        var event = this.createModelUpdatedEvent();
        this.eventService.dispatchEvent(event);
    };
    InfiniteRowModel.prototype.getRow = function (rowIndex) {
        if (!this.infiniteCache) {
            return undefined;
        }
        if (rowIndex >= this.infiniteCache.getRowCount()) {
            return undefined;
        }
        return this.infiniteCache.getRow(rowIndex);
    };
    InfiniteRowModel.prototype.getRowNode = function (id) {
        var result;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    };
    InfiniteRowModel.prototype.forEachNode = function (callback) {
        if (this.infiniteCache) {
            this.infiniteCache.forEachNodeDeep(callback);
        }
    };
    InfiniteRowModel.prototype.getTopLevelRowCount = function () {
        return this.getRowCount();
    };
    InfiniteRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        return topLevelIndex;
    };
    InfiniteRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            var rowIndexForPixel = Math.floor(pixel / this.rowHeight);
            var lastRowIndex = this.getRowCount() - 1;
            if (rowIndexForPixel > lastRowIndex) {
                return lastRowIndex;
            }
            return rowIndexForPixel;
        }
        return 0;
    };
    InfiniteRowModel.prototype.getRowCount = function () {
        return this.infiniteCache ? this.infiniteCache.getRowCount() : 0;
    };
    InfiniteRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    InfiniteRowModel.prototype.refreshCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.refreshCache();
        }
    };
    InfiniteRowModel.prototype.purgeCache = function () {
        if (this.infiniteCache) {
            this.infiniteCache.purgeCache();
        }
    };
    // for iRowModel
    InfiniteRowModel.prototype.isLastRowIndexKnown = function () {
        if (this.infiniteCache) {
            return this.infiniteCache.isLastRowIndexKnown();
        }
        return false;
    };
    InfiniteRowModel.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        if (this.infiniteCache) {
            this.infiniteCache.setRowCount(rowCount, lastRowIndexKnown);
        }
    };
    __decorate([
        Autowired('filterManager')
    ], InfiniteRowModel.prototype, "filterManager", void 0);
    __decorate([
        Autowired('sortController')
    ], InfiniteRowModel.prototype, "sortController", void 0);
    __decorate([
        Autowired('selectionService')
    ], InfiniteRowModel.prototype, "selectionService", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], InfiniteRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('rowNodeBlockLoader')
    ], InfiniteRowModel.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        PostConstruct
    ], InfiniteRowModel.prototype, "init", null);
    __decorate([
        PreDestroy
    ], InfiniteRowModel.prototype, "destroyDatasource", null);
    InfiniteRowModel = __decorate([
        Bean('rowModel')
    ], InfiniteRowModel);
    return InfiniteRowModel;
}(BeanStub));
export { InfiniteRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGVSb3dNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbmZpbml0ZVJvd01vZGVsL2luZmluaXRlUm93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFDUixNQUFNLEVBSU4sY0FBYyxFQUNkLGFBQWEsRUFDYixVQUFVLEVBVWIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsYUFBYSxFQUF1QixNQUFNLGlCQUFpQixDQUFDO0FBR3JFO0lBQXNDLG9DQUFRO0lBQTlDOztJQTRSQSxDQUFDO0lBL1FVLHVDQUFZLEdBQW5CLFVBQW9CLEtBQWE7UUFDN0IsT0FBTztZQUNILFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLO1NBQ2pDLENBQUM7SUFDTixDQUFDO0lBRUQsNEVBQTRFO0lBQ3JFLGdEQUFxQixHQUE1QixVQUE2QixVQUFrQixFQUFFLFFBQWdCLEVBQUUsZUFBdUIsRUFBRSxhQUFxQjtRQUM3RyxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBR00sK0JBQUksR0FBWDtRQURBLGlCQWFDO1FBWEcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDckQsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUVoRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QixJQUFJLENBQUMsY0FBYyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsWUFBWSxFQUFFLEVBQW5CLENBQW1CLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsV0FB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