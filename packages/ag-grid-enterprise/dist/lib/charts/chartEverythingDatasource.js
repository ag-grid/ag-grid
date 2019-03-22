// ag-grid-enterprise v20.2.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var ChartEverythingDatasource = /** @class */ (function (_super) {
    __extends(ChartEverythingDatasource, _super);
    function ChartEverythingDatasource() {
        var _this = _super.call(this) || this;
        _this.errors = [];
        return _this;
    }
    ChartEverythingDatasource.prototype.getErrors = function () {
        return this.errors;
    };
    ChartEverythingDatasource.prototype.addError = function (error) {
        this.errors.push(error);
    };
    ChartEverythingDatasource.prototype.clearErrors = function () {
        this.errors = [];
    };
    ChartEverythingDatasource.prototype.postConstruct = function () {
        if (this.clientSideRowModel.getType() !== ag_grid_community_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.error('ChartEverythingDatasource only works with ClientSideRowModel');
            return;
        }
        this.reset();
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_COLUMN_VISIBLE, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_CELL_VALUE_CHANGED, this.onModelUpdated.bind(this));
    };
    ChartEverythingDatasource.prototype.reset = function () {
        this.clearErrors();
        this.calculateFields();
        this.calculateCategoryCols();
        this.calculateRowCount();
        console.log("rows", this.rows);
        console.log("colIds", this.colIds);
        console.log("categoryCols", this.categoryCols);
    };
    ChartEverythingDatasource.prototype.calculateCategoryCols = function () {
        var _this = this;
        this.categoryCols = [];
        var isDimension = function (col) { return col.getColDef().enableRowGroup || col.getColDef().enablePivot; };
        var cols = this.columnController.getAllDisplayedColumns();
        // pull out all dimension columns from the range
        cols.forEach(function (col) {
            var isDim = isDimension(col);
            console.log("isDim(" + col.getColId() + ") = " + isDim);
            if (isDim) {
                _this.categoryCols.push(col);
            }
        });
    };
    ChartEverythingDatasource.prototype.onModelUpdated = function () {
        this.reset();
        this.dispatchEvent({ type: 'modelUpdated' });
    };
    ChartEverythingDatasource.prototype.calculateRowCount = function () {
        var firstRow = this.clientSideRowModel.getRow(0);
        var rootNode = this.clientSideRowModel.getRootNode();
        // if we are doing pivot mode and no row group, it means we are showing
        // the root node and no other rows. otherwise we are showing children of
        // the root node.
        if (firstRow === rootNode) {
            this.rows = [rootNode];
        }
        else {
            this.rows = rootNode.childrenAfterSort;
        }
    };
    ChartEverythingDatasource.prototype.calculateFields = function () {
        var _this = this;
        var pivotActive = this.columnController.isPivotActive();
        var cols = pivotActive ?
            // when pivoting, we show all the columns, regardless of the child group open/closed
            // (pivot can have groups closed when showing total columns)
            this.columnController.getAllGridColumns() :
            // when not pivoting, we display all the columns currently visible
            this.columnController.getAllDisplayedColumns();
        this.colIds = [];
        this.colDisplayNames = [];
        this.colsMapped = {};
        if (!cols) {
            return;
        }
        cols.forEach(function (col) {
            console.log("isValue(" + col.getColId() + ") = " + col.getColDef().enableValue);
            // only measure columns can be values
            if (!col.getColDef().enableValue) {
                return;
            }
            // we never chart total columns, as total cols in charts look weird
            if (col.getColDef().pivotTotalColumnIds) {
                return;
            }
            var colId = col.getColId();
            var displayName = _this.getColumnName(col);
            _this.colIds.push(colId);
            _this.colDisplayNames.push(displayName ? displayName : '');
            _this.colsMapped[colId] = col;
        });
    };
    ChartEverythingDatasource.prototype.getColumnName = function (col) {
        if (this.columnController.isPivotActive()) {
            var valueColumns = this.columnController.getValueColumns();
            var parts = [];
            if (valueColumns.length > 1) {
                var part = this.columnController.getDisplayNameForColumn(col, 'chart');
                parts.unshift(part ? part : '');
            }
            var pointer = col.getParent();
            while (pointer) {
                var part = this.columnController.getDisplayNameForColumnGroup(pointer, 'chart');
                parts.unshift(part ? part : '');
                pointer = pointer.getParent();
            }
            return parts.join('');
        }
        else {
            var displayName = this.columnController.getDisplayNameForColumn(col, 'chart');
            return displayName ? displayName : '';
        }
    };
    ChartEverythingDatasource.prototype.getCategory = function (i) {
        var _this = this;
        var rowNode = this.rows[i];
        var resParts = [];
        if (this.categoryCols) {
            this.categoryCols.forEach(function (col) {
                var part = _this.valueService.getValue(col, rowNode);
                // force return type to be string or empty string (as value can be an object)
                var partStr = (part && part.toString) ? part.toString() : '';
                resParts.push(partStr);
            });
            var res = resParts.join(', ');
            return res;
        }
        if (this.getRowCount() > 1) {
            return 'Total ' + i;
        }
        else {
            return 'Total';
        }
    };
    ChartEverythingDatasource.prototype.getFields = function () {
        return this.colIds;
    };
    ChartEverythingDatasource.prototype.getFieldNames = function () {
        return this.colDisplayNames;
    };
    ChartEverythingDatasource.prototype.getValue = function (i, field) {
        var rowNode = this.rows[i];
        var col = this.colsMapped[field];
        var res = this.valueService.getValue(col, rowNode);
        return res;
    };
    ChartEverythingDatasource.prototype.getRowCount = function () {
        return this.rows.length;
    };
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ChartEverythingDatasource.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], ChartEverythingDatasource.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", ag_grid_community_1.ClientSideRowModel)
    ], ChartEverythingDatasource.prototype, "clientSideRowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('paginationProxy'),
        __metadata("design:type", ag_grid_community_1.PaginationProxy)
    ], ChartEverythingDatasource.prototype, "paginationProxy", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ChartEverythingDatasource.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartEverythingDatasource.prototype, "postConstruct", null);
    return ChartEverythingDatasource;
}(ag_grid_community_1.BeanStub));
exports.ChartEverythingDatasource = ChartEverythingDatasource;
