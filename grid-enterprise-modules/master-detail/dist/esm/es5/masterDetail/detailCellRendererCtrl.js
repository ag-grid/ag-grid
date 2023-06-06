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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsQ2VsbFJlbmRlcmVyQ3RybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYXN0ZXJEZXRhaWwvZGV0YWlsQ2VsbFJlbmRlcmVyQ3RybC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsUUFBUSxFQUtSLE9BQU8sRUFHUCxNQUFNLEVBSU4sQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakM7SUFBNEMsMENBQVE7SUFBcEQ7UUFBQSxxRUEwTEM7UUFqTFcsd0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLGlCQUFXLEdBQUcsS0FBSyxDQUFDOztJQStLaEMsQ0FBQztJQTNLVSxxQ0FBSSxHQUFYLFVBQVksSUFBeUIsRUFBRSxNQUFpQztRQUF4RSxpQkFrQkM7UUFqQkcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBTSxtQ0FBbUMsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztRQUNsRSxJQUFJLG1DQUFtQyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRXBELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFPLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixFQUFFO1lBQ3JFLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxD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