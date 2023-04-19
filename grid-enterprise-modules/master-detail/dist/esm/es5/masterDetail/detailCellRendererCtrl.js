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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, BeanStub, RowNode, Events, _ } from "@ag-grid-community/core";
var DetailCellRendererCtrl = /** @class */ (function (_super) {
    __extends(DetailCellRendererCtrl, _super);
    function DetailCellRendererCtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.loadRowDataVersion = 0;
        _this.needRefresh = false;
        return _this;
    }
    DetailCellRendererCtrl.prototype.init = function (comp, params) {
        var _this = this;
        this.params = params;
        this.comp = comp;
        var doNothingBecauseInsidePinnedSection = params.pinned != null;
        if (doNothingBecauseInsidePinnedSection) {
            return;
        }
        this.setAutoHeightClasses();
        this.setupRefreshStrategy();
        this.addThemeToDetailGrid();
        this.createDetailGrid();
        this.loadRowData();
        this.addManagedListener(params.node.parent, RowNode.EVENT_DATA_CHANGED, function () {
            _this.needRefresh = true;
        });
        this.addManagedListener(this.eventService, Events.EVENT_FULL_WIDTH_ROW_FOCUSED, this.onFullWidthRowFocused.bind(this));
    };
    DetailCellRendererCtrl.prototype.onFullWidthRowFocused = function (e) {
        var params = this.params;
        var row = { rowIndex: params.node.rowIndex, rowPinned: params.node.rowPinned };
        var eventRow = { rowIndex: e.rowIndex, rowPinned: e.rowPinned };
        var isSameRow = this.rowPositionUtils.sameRow(row, eventRow);
        if (!isSameRow) {
            return;
        }
        this.focusService.focusInto(this.comp.getGui(), e.fromBelow);
    };
    DetailCellRendererCtrl.prototype.setAutoHeightClasses = function () {
        var autoHeight = this.gridOptionsService.is('detailRowAutoHeight');
        var parentClass = autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height';
        var detailClass = autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height';
        this.comp.addOrRemoveCssClass(parentClass, true);
        this.comp.addOrRemoveDetailGridCssClass(detailClass, true);
    };
    DetailCellRendererCtrl.prototype.setupRefreshStrategy = function () {
        var providedStrategy = this.params.refreshStrategy;
        var validSelection = providedStrategy == 'everything' || providedStrategy == 'nothing' || providedStrategy == 'rows';
        if (validSelection) {
            this.refreshStrategy = providedStrategy;
            return;
        }
        if (providedStrategy != null) {
            console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + providedStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }
        this.refreshStrategy = 'rows';
    };
    DetailCellRendererCtrl.prototype.addThemeToDetailGrid = function () {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        var theme = this.environment.getTheme().theme;
        if (theme) {
            this.comp.addOrRemoveDetailGridCssClass(theme, true);
        }
    };
    DetailCellRendererCtrl.prototype.createDetailGrid = function () {
        if (_.missing(this.params.detailGridOptions)) {
            console.warn('AG Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
            return;
        }
        var autoHeight = this.gridOptionsService.is('detailRowAutoHeight');
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions
        var gridOptions = __assign({}, this.params.detailGridOptions);
        if (autoHeight) {
            gridOptions.domLayout = 'autoHeight';
        }
        this.comp.setDetailGrid(gridOptions);
    };
    DetailCellRendererCtrl.prototype.registerDetailWithMaster = function (api, columnApi) {
        var rowId = this.params.node.id;
        var masterGridApi = this.params.api;
        var gridInfo = {
            id: rowId,
            api: api,
            columnApi: columnApi
        };
        var rowNode = this.params.node;
        // register with api
        masterGridApi.addDetailGridInfo(rowId, gridInfo);
        // register with node
        rowNode.detailGridInfo = gridInfo;
        this.addDestroyFunc(function () {
            // the gridInfo can be stale if a refresh happens and
            // a new row is created before the old one is destroyed.
            if (rowNode.detailGridInfo !== gridInfo) {
                return;
            }
            masterGridApi.removeDetailGridInfo(rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    };
    DetailCellRendererCtrl.prototype.loadRowData = function () {
        var _this = this;
        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        var versionThisCall = this.loadRowDataVersion;
        var userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('AG Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        var successCallback = function (rowData) {
            var mostRecentCall = _this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                _this.comp.setRowData(rowData);
            }
        };
        var funcParams = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback,
            context: this.gridOptionsService.context
        };
        userFunc(funcParams);
    };
    DetailCellRendererCtrl.prototype.refresh = function () {
        var GET_GRID_TO_REFRESH = false;
        var GET_GRID_TO_DO_NOTHING = true;
        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        var doNotRefresh = !this.needRefresh || this.refreshStrategy === 'nothing';
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }
        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;
        if (this.refreshStrategy === 'everything') {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        }
        else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    };
    __decorate([
        Autowired('rowPositionUtils')
    ], DetailCellRendererCtrl.prototype, "rowPositionUtils", void 0);
    __decorate([
        Autowired('focusService')
    ], DetailCellRendererCtrl.prototype, "focusService", void 0);
    return DetailCellRendererCtrl;
}(BeanStub));
export { DetailCellRendererCtrl };
