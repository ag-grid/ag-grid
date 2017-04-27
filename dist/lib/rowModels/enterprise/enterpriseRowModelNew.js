// ag-grid-enterprise v9.1.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ag_grid_1 = require("ag-grid");
var enterpriseCache_1 = require("./enterpriseCache");
var EnterpriseRowModelNew = (function (_super) {
    __extends(EnterpriseRowModelNew, _super);
    function EnterpriseRowModelNew() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnterpriseRowModelNew.prototype.postConstruct = function () {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.addEventListeners();
    };
    EnterpriseRowModelNew.prototype.isLastRowFound = function () {
        return true;
    };
    EnterpriseRowModelNew.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    EnterpriseRowModelNew.prototype.onFilterChanged = function () {
        this.reset();
    };
    EnterpriseRowModelNew.prototype.onSortChanged = function () {
        this.reset();
    };
    EnterpriseRowModelNew.prototype.onValueChanged = function () {
        this.reset();
    };
    EnterpriseRowModelNew.prototype.onColumnRowGroupChanged = function () {
        this.reset();
    };
    EnterpriseRowModelNew.prototype.onRowGroupOpened = function (event) {
        var openedNode = event.node;
        if (openedNode.expanded && ag_grid_1._.missing(openedNode.childrenCache)) {
            this.createNodeCache(openedNode);
        }
        else {
        }
    };
    EnterpriseRowModelNew.prototype.reset = function () {
        this.rootNode = new ag_grid_1.RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.context.wireBean(this.rootNode);
        if (this.datasource) {
            this.createNodeCache(this.rootNode);
        }
        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        this.eventService.dispatchEvent(ag_grid_1.Events.EVENT_ROW_DATA_CHANGED);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start)
        this.eventService.dispatchEvent(ag_grid_1.Events.EVENT_MODEL_UPDATED);
    };
    EnterpriseRowModelNew.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
        this.reset();
    };
    EnterpriseRowModelNew.prototype.createNodeCache = function (rowNode) {
        var params = {
            datasource: this.datasource,
            lastAccessedSequence: new ag_grid_1.NumberSequence(),
            overflowSize: 2,
            initialRowCount: 2,
            pageSize: 10,
            rowHeight: 25
        };
        rowNode.childrenCache = new enterpriseCache_1.EnterpriseCache(params);
        this.context.wireBean(rowNode.childrenCache);
    };
    EnterpriseRowModelNew.prototype.getRowBounds = function (index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    };
    EnterpriseRowModelNew.prototype.getRow = function (index) {
        return null;
    };
    EnterpriseRowModelNew.prototype.getPageFirstRow = function () {
        return 0;
    };
    EnterpriseRowModelNew.prototype.getPageLastRow = function () {
        return 0;
    };
    EnterpriseRowModelNew.prototype.getRowCount = function () {
        return 0;
    };
    EnterpriseRowModelNew.prototype.getRowIndexAtPixel = function (pixel) {
        return 0;
    };
    EnterpriseRowModelNew.prototype.getCurrentPageHeight = function () {
        return 0;
    };
    EnterpriseRowModelNew.prototype.isEmpty = function () {
        return false;
    };
    EnterpriseRowModelNew.prototype.isRowsToRender = function () {
        return false;
    };
    EnterpriseRowModelNew.prototype.getType = function () {
        return ag_grid_1.Constants.ROW_MODEL_TYPE_ENTERPRISE;
    };
    EnterpriseRowModelNew.prototype.forEachNode = function (callback) {
        console.log('forEachNode not supported in enterprise row model');
    };
    EnterpriseRowModelNew.prototype.insertItemsAtIndex = function (index, items, skipRefresh) {
        console.log('insertItemsAtIndex not supported in enterprise row model');
    };
    EnterpriseRowModelNew.prototype.removeItems = function (rowNodes, skipRefresh) {
        console.log('removeItems not supported in enterprise row model');
    };
    EnterpriseRowModelNew.prototype.addItems = function (item, skipRefresh) {
        console.log('addItems not supported in enterprise row model');
    };
    EnterpriseRowModelNew.prototype.isRowPresent = function (rowNode) {
        console.log('isRowPresent not supported in enterprise row model');
        return false;
    };
    return EnterpriseRowModelNew;
}(ag_grid_1.BeanStub));
__decorate([
    ag_grid_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", ag_grid_1.GridOptionsWrapper)
], EnterpriseRowModelNew.prototype, "gridOptionsWrapper", void 0);
__decorate([
    ag_grid_1.Autowired('eventService'),
    __metadata("design:type", ag_grid_1.EventService)
], EnterpriseRowModelNew.prototype, "eventService", void 0);
__decorate([
    ag_grid_1.Autowired('context'),
    __metadata("design:type", ag_grid_1.Context)
], EnterpriseRowModelNew.prototype, "context", void 0);
__decorate([
    ag_grid_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseRowModelNew.prototype, "postConstruct", null);
EnterpriseRowModelNew = __decorate([
    ag_grid_1.Bean('rowModel')
], EnterpriseRowModelNew);
exports.EnterpriseRowModelNew = EnterpriseRowModelNew;
