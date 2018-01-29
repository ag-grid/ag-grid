// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_1 = require("ag-grid");
var EnterpriseBlock = (function (_super) {
    __extends(EnterpriseBlock, _super);
    function EnterpriseBlock(pageNumber, parentRowNode, params, parentCache) {
        var _this = _super.call(this, pageNumber, params) || this;
        _this.params = params;
        _this.parentRowNode = parentRowNode;
        _this.parentCache = parentCache;
        _this.level = parentRowNode.level + 1;
        _this.groupLevel = _this.level < params.rowGroupCols.length;
        _this.leafGroup = _this.level === (params.rowGroupCols.length - 1);
        return _this;
    }
    EnterpriseBlock.prototype.createNodeIdPrefix = function () {
        var parts = [];
        var rowNode = this.parentRowNode;
        // pull keys from all parent nodes, but do not include the root node
        while (rowNode.level >= 0) {
            parts.push(rowNode.key);
            rowNode = rowNode.parent;
        }
        if (parts.length > 0) {
            this.nodeIdPrefix = parts.reverse().join('-') + '-';
        }
    };
    EnterpriseBlock.prototype.createIdForIndex = function (index) {
        if (ag_grid_1._.exists(this.nodeIdPrefix)) {
            return this.nodeIdPrefix + index.toString();
        }
        else {
            return index.toString();
        }
    };
    EnterpriseBlock.prototype.getNodeIdPrefix = function () {
        return this.nodeIdPrefix;
    };
    EnterpriseBlock.prototype.getRow = function (displayRowIndex) {
        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        var bottomPointer = this.getStartRow();
        // the end row depends on whether all this block is used or not. if the virtual row count
        // is before the end, then not all the row is used
        var virtualRowCount = this.parentCache.getVirtualRowCount();
        var endRow = this.getEndRow();
        var actualEnd = (virtualRowCount < endRow) ? virtualRowCount : endRow;
        var topPointer = actualEnd - 1;
        if (ag_grid_1._.missing(topPointer) || ag_grid_1._.missing(bottomPointer)) {
            console.warn("ag-grid: error: topPointer = " + topPointer + ", bottomPointer = " + bottomPointer);
            return null;
        }
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = _super.prototype.getRowUsingLocalIndex.call(this, midPointer);
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            var childrenCache = currentRowNode.childrenCache;
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            else if (currentRowNode.expanded && childrenCache && childrenCache.isDisplayIndexInCache(displayRowIndex)) {
                return childrenCache.getRow(displayRowIndex);
            }
            else if (currentRowNode.rowIndex < displayRowIndex) {
                bottomPointer = midPointer + 1;
            }
            else if (currentRowNode.rowIndex > displayRowIndex) {
                topPointer = midPointer - 1;
            }
        }
    };
    EnterpriseBlock.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('EnterpriseBlock');
    };
    EnterpriseBlock.prototype.init = function () {
        if (this.groupLevel) {
            var groupColVo = this.params.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }
        this.createNodeIdPrefix();
        _super.prototype.init.call(this, {
            context: this.context,
            rowRenderer: this.rowRenderer
        });
    };
    EnterpriseBlock.prototype.setDataAndId = function (rowNode, data, index) {
        rowNode.stub = false;
        if (ag_grid_1._.exists(data)) {
            // if the user is not providing id's, then we build an id based on the index.
            // for infinite scrolling, the index is used on it's own. for enterprise,
            // we combine the index with the level and group key, so that the id is
            // unique across the set.
            //
            // unique id is needed for selection (so selection can be maintained when
            // doing server side sorting / filtering) - if user is not providing id's
            // (and we use the indexes) then selection will not work between sorting &
            // filtering.
            //
            // id's are also used by the row renderer for updating the dom as it identifies
            // rowNodes by id
            var idToUse = this.createIdForIndex(index);
            rowNode.setDataAndId(data, idToUse);
            rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode));
            if (rowNode.group) {
                rowNode.key = this.valueService.getValue(this.rowGroupColumn, rowNode);
            }
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
        if (this.groupLevel) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
    };
    EnterpriseBlock.prototype.setChildCountIntoRowNode = function (rowNode) {
        var getChildCount = this.gridOptionsWrapper.getChildCountFunc();
        if (getChildCount) {
            rowNode.allChildrenCount = getChildCount(rowNode.data);
        }
    };
    EnterpriseBlock.prototype.setGroupDataIntoRowNode = function (rowNode) {
        var _this = this;
        var groupDisplayCols = this.columnController.getGroupDisplayColumns();
        groupDisplayCols.forEach(function (col) {
            if (col.isRowGroupDisplayed(_this.rowGroupColumn.getId())) {
                var groupValue = _this.valueService.getValue(_this.rowGroupColumn, rowNode);
                if (ag_grid_1._.missing(rowNode.groupData)) {
                    rowNode.groupData = {};
                }
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    };
    EnterpriseBlock.prototype.loadFromDatasource = function () {
        var _this = this;
        var params = this.createLoadParams();
        setTimeout(function () {
            _this.params.datasource.getRows(params);
        }, 0);
    };
    EnterpriseBlock.prototype.createBlankRowNode = function (rowIndex) {
        var rowNode = _super.prototype.createBlankRowNode.call(this, rowIndex);
        rowNode.group = this.groupLevel;
        rowNode.leafGroup = this.leafGroup;
        rowNode.level = this.level;
        rowNode.uiLevel = this.level;
        rowNode.parent = this.parentRowNode;
        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;
        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = this.groupField;
            rowNode.rowGroupColumn = this.rowGroupColumn;
        }
        return rowNode;
    };
    EnterpriseBlock.prototype.createGroupKeys = function (groupNode) {
        var keys = [];
        var pointer = groupNode;
        while (pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }
        keys.reverse();
        return keys;
    };
    EnterpriseBlock.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.blockTop && pixel < (this.blockTop + this.blockHeight);
    };
    EnterpriseBlock.prototype.getRowBounds = function (index, virtualRowCount) {
        var start = this.getStartRow();
        var end = this.getEndRow();
        for (var i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }
            var rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {
                if (rowNode.rowIndex === index) {
                    return {
                        rowHeight: rowNode.rowHeight,
                        rowTop: rowNode.rowTop
                    };
                }
                if (rowNode.group && rowNode.expanded && ag_grid_1._.exists(rowNode.childrenCache)) {
                    var enterpriseCache = rowNode.childrenCache;
                    if (enterpriseCache.isDisplayIndexInCache(index)) {
                        return enterpriseCache.getRowBounds(index);
                    }
                }
            }
        }
        console.error("ag-Grid: looking for invalid row index in Enterprise Row Model, index=" + index);
        return null;
    };
    EnterpriseBlock.prototype.getRowIndexAtPixel = function (pixel, virtualRowCount) {
        var start = this.getStartRow();
        var end = this.getEndRow();
        for (var i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }
            var rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {
                if (rowNode.isPixelInRange(pixel)) {
                    return rowNode.rowIndex;
                }
                if (rowNode.group && rowNode.expanded && ag_grid_1._.exists(rowNode.childrenCache)) {
                    var enterpriseCache = rowNode.childrenCache;
                    if (enterpriseCache.isPixelInRange(pixel)) {
                        return enterpriseCache.getRowIndexAtPixel(pixel);
                    }
                }
            }
        }
        console.warn("ag-Grid: invalid pixel range for enterprise block " + pixel);
        return 0;
    };
    EnterpriseBlock.prototype.clearRowTops = function (virtualRowCount) {
        this.forEachRowNode(virtualRowCount, function (rowNode) {
            rowNode.clearRowTop();
            var hasChildCache = rowNode.group && ag_grid_1._.exists(rowNode.childrenCache);
            if (hasChildCache) {
                var enterpriseCache = rowNode.childrenCache;
                enterpriseCache.clearRowTops();
            }
        });
    };
    EnterpriseBlock.prototype.setDisplayIndexes = function (displayIndexSeq, virtualRowCount, nextRowTop) {
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTop = nextRowTop.value;
        this.forEachRowNode(virtualRowCount, function (rowNode) {
            var rowIndex = displayIndexSeq.next();
            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(nextRowTop.value);
            nextRowTop.value += rowNode.rowHeight;
            var hasChildCache = rowNode.group && ag_grid_1._.exists(rowNode.childrenCache);
            if (hasChildCache) {
                var enterpriseCache = rowNode.childrenCache;
                if (rowNode.expanded) {
                    enterpriseCache.setDisplayIndexes(displayIndexSeq, nextRowTop);
                }
                else {
                    // we need to clear the row tops, as the row renderer depends on
                    // this to know if the row should be faded out
                    enterpriseCache.clearRowTops();
                }
            }
        });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeight = nextRowTop.value - this.blockTop;
    };
    EnterpriseBlock.prototype.forEachRowNode = function (virtualRowCount, callback) {
        var start = this.getStartRow();
        var end = this.getEndRow();
        for (var i = start; i <= end; i++) {
            // the blocks can have extra rows in them, if they are the last block
            // in the cache and the virtual row count doesn't divide evenly by the
            if (i >= virtualRowCount) {
                continue;
            }
            var rowNode = this.getRowUsingLocalIndex(i);
            if (rowNode) {
                callback(rowNode);
            }
        }
    };
    EnterpriseBlock.prototype.createLoadParams = function () {
        var groupKeys = this.createGroupKeys(this.parentRowNode);
        var request = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            rowGroupCols: this.params.rowGroupCols,
            valueCols: this.params.valueCols,
            pivotCols: this.params.pivotCols,
            pivotMode: this.params.pivotMode,
            groupKeys: groupKeys,
            filterModel: this.params.filterModel,
            sortModel: this.params.sortModel
        };
        var params = {
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            request: request
        };
        return params;
    };
    EnterpriseBlock.prototype.isDisplayIndexInBlock = function (displayIndex) {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    EnterpriseBlock.prototype.isBlockBefore = function (displayIndex) {
        return displayIndex >= this.displayIndexEnd;
    };
    EnterpriseBlock.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    EnterpriseBlock.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    EnterpriseBlock.prototype.getBlockHeight = function () {
        return this.blockHeight;
    };
    EnterpriseBlock.prototype.getBlockTop = function () {
        return this.blockTop;
    };
    __decorate([
        ag_grid_1.Autowired('context'),
        __metadata("design:type", ag_grid_1.Context)
    ], EnterpriseBlock.prototype, "context", void 0);
    __decorate([
        ag_grid_1.Autowired('rowRenderer'),
        __metadata("design:type", ag_grid_1.RowRenderer)
    ], EnterpriseBlock.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_1.ColumnController)
    ], EnterpriseBlock.prototype, "columnController", void 0);
    __decorate([
        ag_grid_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_1.ValueService)
    ], EnterpriseBlock.prototype, "valueService", void 0);
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_1.GridOptionsWrapper)
    ], EnterpriseBlock.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        __param(0, ag_grid_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [ag_grid_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], EnterpriseBlock.prototype, "setBeans", null);
    __decorate([
        ag_grid_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], EnterpriseBlock.prototype, "init", null);
    return EnterpriseBlock;
}(ag_grid_1.RowNodeBlock));
exports.EnterpriseBlock = EnterpriseBlock;
