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
import { _, PostConstruct, PreDestroy, RowNode, RowNodeBlock, Autowired } from "@ag-grid-community/core";
var InfiniteBlock = /** @class */ (function (_super) {
    __extends(InfiniteBlock, _super);
    function InfiniteBlock(id, parentCache, params) {
        var _this = _super.call(this, id) || this;
        _this.parentCache = parentCache;
        _this.params = params;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        _this.startRow = id * params.blockSize;
        _this.endRow = _this.startRow + params.blockSize;
        return _this;
    }
    InfiniteBlock.prototype.postConstruct = function () {
        this.createRowNodes();
    };
    InfiniteBlock.prototype.getBlockStateJson = function () {
        return {
            id: '' + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.getStartRow(),
                endRow: this.getEndRow(),
                pageStatus: this.getState()
            }
        };
    };
    InfiniteBlock.prototype.setDataAndId = function (rowNode, data, index) {
        // if there's no id and the rowNode was rendered before, it means this
        // was a placeholder rowNode and should not be recycled. Setting
        // `alreadyRendered`  to `false` forces the rowRenderer to flush it.
        if (!rowNode.id && rowNode.alreadyRendered) {
            rowNode.alreadyRendered = false;
        }
        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
        }
    };
    InfiniteBlock.prototype.loadFromDatasource = function () {
        var _this = this;
        var params = this.createLoadParams();
        if (_.missing(this.params.datasource.getRows)) {
            console.warn("AG Grid: datasource is missing getRows method");
            return;
        }
        // put in timeout, to force result to be async
        window.setTimeout(function () {
            _this.params.datasource.getRows(params);
        }, 0);
    };
    InfiniteBlock.prototype.processServerFail = function () {
        // todo - this method has better handling in SSRM
    };
    InfiniteBlock.prototype.createLoadParams = function () {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        var params = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gridOptionsService.context
        };
        return params;
    };
    InfiniteBlock.prototype.forEachNode = function (callback, sequence, rowCount) {
        var _this = this;
        this.rowNodes.forEach(function (rowNode, index) {
            var rowIndex = _this.startRow + index;
            if (rowIndex < rowCount) {
                callback(rowNode, sequence.next());
            }
        });
    };
    InfiniteBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    InfiniteBlock.prototype.getRow = function (rowIndex, dontTouchLastAccessed) {
        if (dontTouchLastAccessed === void 0) { dontTouchLastAccessed = false; }
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    };
    InfiniteBlock.prototype.getStartRow = function () {
        return this.startRow;
    };
    InfiniteBlock.prototype.getEndRow = function () {
        return this.endRow;
    };
    // creates empty row nodes, data is missing as not loaded yet
    InfiniteBlock.prototype.createRowNodes = function () {
        this.rowNodes = [];
        for (var i = 0; i < this.params.blockSize; i++) {
            var rowIndex = this.startRow + i;
            var rowNode = new RowNode(this.beans);
            rowNode.setRowHeight(this.params.rowHeight);
            rowNode.uiLevel = 0;
            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(this.params.rowHeight * rowIndex);
            this.rowNodes.push(rowNode);
        }
    };
    InfiniteBlock.prototype.processServerResult = function (params) {
        var _this = this;
        this.rowNodes.forEach(function (rowNode, index) {
            var data = params.rowData ? params.rowData[index] : undefined;
            _this.setDataAndId(rowNode, data, _this.startRow + index);
        });
        var finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        this.parentCache.pageLoaded(this, finalRowCount);
    };
    InfiniteBlock.prototype.destroyRowNodes = function () {
        this.rowNodes.forEach(function (rowNode) {
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown.
            rowNode.clearRowTopAndRowIndex();
        });
    };
    __decorate([
        Autowired('beans')
    ], InfiniteBlock.prototype, "beans", void 0);
    __decorate([
        PostConstruct
    ], InfiniteBlock.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], InfiniteBlock.prototype, "destroyRowNodes", null);
    return InfiniteBlock;
}(RowNodeBlock));
export { InfiniteBlock };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGVCbG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbmZpbml0ZVJvd01vZGVsL2luZmluaXRlQmxvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxhQUFhLEVBQ2IsVUFBVSxFQUNWLE9BQU8sRUFDUCxZQUFZLEVBR1osU0FBUyxFQUNaLE1BQU0seUJBQXlCLENBQUM7QUFHakM7SUFBbUMsaUNBQVk7SUFhM0MsdUJBQVksRUFBVSxFQUFFLFdBQTBCLEVBQUUsTUFBMkI7UUFBL0UsWUFDSSxrQkFBTSxFQUFFLENBQUMsU0FTWjtRQVBHLEtBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLG9FQUFvRTtRQUNwRSx3RUFBd0U7UUFDeEUsS0FBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVUsQ0FBQztRQUN2QyxLQUFJLENBQUMsTUFBTSxHQUFHLEtBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVUsQ0FBQzs7SUFDcEQsQ0FBQztJQUdTLHFDQUFhLEdBQXZCO1FBQ0ksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSx5Q0FBaUIsR0FBeEI7UUFDSSxPQUFPO1lBQ0gsRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ3JCLEtBQUssRUFBRTtnQkFDSCxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDekIsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQzVCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUN4QixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTthQUM5QjtTQUNKLENBQUM7SUFDTixDQUFDO0lBRVMs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