/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var rowNode_1 = require("../../entities/rowNode");
var constants_1 = require("../../constants");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var utils_1 = require("../../utils");
var eventService_1 = require("../../eventService");
var events_1 = require("../../events");
var flattenStage_1 = require("../inMemory/flattenStage");
var columnController_1 = require("../../columnController/columnController");
var ColumnVO = (function () {
    function ColumnVO() {
    }
    return ColumnVO;
}());
exports.ColumnVO = ColumnVO;
var EnterpriseRowModel = (function () {
    function EnterpriseRowModel() {
        // each time the data changes we increment the instance version.
        // that way we know to discard any daemon network calls, that are bringing
        // back data for an old version.
        this.instanceVersion = 0;
    }
    EnterpriseRowModel.prototype.postConstruct = function () {
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.datasource = this.gridOptionsWrapper.getEnterpriseDatasource();
        if (this.datasource) {
            this.reset();
        }
    };
    EnterpriseRowModel.prototype.onColumnRowGroupChanged = function () {
        if (this.datasource) {
            this.reset();
        }
    };
    EnterpriseRowModel.prototype.onRowGroupOpened = function (event) {
        var openedNode = event.node;
        if (openedNode.expanded && utils_1._.missing(openedNode.childrenAfterSort)) {
            this.loadNode(openedNode);
        }
        else {
            this.mapAndFireModelUpdated();
        }
    };
    EnterpriseRowModel.prototype.reset = function () {
        this.nextId = 0;
        this.rowsToDisplay = null;
        this.instanceVersion++;
        this.rootNode = new rowNode_1.RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.context.wireBean(this.rootNode);
        this.loadNode(this.rootNode);
        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        this.eventService.dispatchEvent(events_1.Events.EVENT_ROW_DATA_CHANGED);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start)
        this.eventService.dispatchEvent(events_1.Events.EVENT_MODEL_UPDATED);
    };
    EnterpriseRowModel.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
        this.reset();
    };
    EnterpriseRowModel.prototype.loadNode = function (rowNode) {
        var _this = this;
        var params = this.createLoadParams(rowNode);
        setTimeout(function () {
            _this.datasource.getRows(params);
        }, 0);
    };
    EnterpriseRowModel.prototype.createGroupKeys = function (groupNode) {
        var keys = [];
        var pointer = groupNode;
        while (pointer.level >= 0) {
            keys.push(groupNode.key);
            pointer = groupNode.parent;
        }
        return keys;
    };
    EnterpriseRowModel.prototype.createLoadParams = function (rowNode) {
        var groupKeys = this.createGroupKeys(rowNode);
        var rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
        var valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
        var pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());
        var params = {
            successCallback: this.successCallback.bind(this, this.instanceVersion, rowNode),
            failCallback: this.failCallback.bind(this, this.instanceVersion, rowNode),
            rowGroupCols: rowGroupColumnVos,
            valueCols: valueColumnVos,
            pivotCols: pivotColumnVos,
            groupKeys: groupKeys
        };
        return params;
    };
    EnterpriseRowModel.prototype.toValueObjects = function (columns) {
        var _this = this;
        return columns.map(function (col) { return ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: _this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }); });
    };
    EnterpriseRowModel.prototype.successCallback = function (instanceVersion, parentNode, dataItems) {
        var _this = this;
        var isDaemon = instanceVersion !== this.instanceVersion;
        if (isDaemon) {
            return;
        }
        var groupCols = this.columnController.getRowGroupColumns();
        var newNodesLevel = parentNode.level + 1;
        var newNodesAreGroups = groupCols.length > newNodesLevel;
        var field = newNodesAreGroups ? groupCols[newNodesLevel].getColDef().field : null;
        parentNode.childrenAfterSort = [];
        if (dataItems) {
            dataItems.forEach(function (dataItem) {
                var childNode = new rowNode_1.RowNode();
                _this.context.wireBean(childNode);
                childNode.group = newNodesAreGroups;
                childNode.level = newNodesLevel;
                childNode.parent = parentNode;
                childNode.setDataAndId(dataItem, _this.nextId.toString());
                if (newNodesAreGroups) {
                    childNode.expanded = false;
                    childNode.field = field;
                    childNode.key = dataItem[field];
                }
                parentNode.childrenAfterSort.push(childNode);
                _this.nextId++;
            });
        }
        this.mapAndFireModelUpdated();
    };
    EnterpriseRowModel.prototype.mapAndFireModelUpdated = function () {
        this.doRowsToDisplay();
        var event = { animate: true, keepRenderedRows: true, newData: false };
        this.eventService.dispatchEvent(events_1.Events.EVENT_MODEL_UPDATED, event);
    };
    EnterpriseRowModel.prototype.failCallback = function (instanceVersion, rowNode) {
        var isDaemon = instanceVersion !== this.instanceVersion;
        if (isDaemon) {
            return;
        }
    };
    EnterpriseRowModel.prototype.getRow = function (index) {
        return this.rowsToDisplay[index];
    };
    EnterpriseRowModel.prototype.getRowCount = function () {
        return this.rowsToDisplay ? this.rowsToDisplay.length : 0;
    };
    EnterpriseRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        if (this.rowHeight !== 0) {
            return Math.floor(pixel / this.rowHeight);
        }
        else {
            return 0;
        }
    };
    EnterpriseRowModel.prototype.getRowCombinedHeight = function () {
        return this.getRowCount() * this.rowHeight;
    };
    EnterpriseRowModel.prototype.isEmpty = function () {
        return utils_1._.missing(this.rootNode);
    };
    EnterpriseRowModel.prototype.isRowsToRender = function () {
        return this.rowsToDisplay ? this.rowsToDisplay.length > 0 : false;
    };
    EnterpriseRowModel.prototype.getType = function () {
        return constants_1.Constants.ROW_MODEL_TYPE_ENTERPRISE;
    };
    EnterpriseRowModel.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    };
    EnterpriseRowModel.prototype.forEachNode = function (callback) {
        console.log('forEachNode not supported in enterprise row model');
    };
    EnterpriseRowModel.prototype.insertItemsAtIndex = function (index, items, skipRefresh) {
        console.log('insertItemsAtIndex not supported in enterprise row model');
    };
    EnterpriseRowModel.prototype.removeItems = function (rowNodes, skipRefresh) {
        console.log('removeItems not supported in enterprise row model');
    };
    EnterpriseRowModel.prototype.addItems = function (item, skipRefresh) {
        console.log('addItems not supported in enterprise row model');
    };
    EnterpriseRowModel.prototype.isRowPresent = function (rowNode) {
        console.log('isRowPresent not supported in enterprise row model');
        return false;
    };
    return EnterpriseRowModel;
}());
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], EnterpriseRowModel.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], EnterpriseRowModel.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], EnterpriseRowModel.prototype, "context", void 0);
__decorate([
    context_1.Autowired('flattenStage'),
    __metadata("design:type", flattenStage_1.FlattenStage)
], EnterpriseRowModel.prototype, "flattenStage", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], EnterpriseRowModel.prototype, "columnController", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseRowModel.prototype, "postConstruct", null);
EnterpriseRowModel = __decorate([
    context_1.Bean('rowModel')
], EnterpriseRowModel);
exports.EnterpriseRowModel = EnterpriseRowModel;
