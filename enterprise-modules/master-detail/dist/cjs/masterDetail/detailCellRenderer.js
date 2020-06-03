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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var DetailCellRenderer = /** @class */ (function (_super) {
    __extends(DetailCellRenderer, _super);
    function DetailCellRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.needRefresh = false;
        _this.loadRowDataVersion = 0;
        return _this;
    }
    DetailCellRenderer.prototype.init = function (params) {
        var _this = this;
        // if embedFullWidthRows=true, then this component could be in a pinned section. we should not show detail
        // component if in the pinned section, on in the main body section.
        if (params.pinned) {
            this.setTemplate('<div class="ag-details-row"></div>');
            return;
        }
        this.params = params;
        this.checkForDeprecations();
        this.ensureValidRefreshStrategy();
        this.selectAndSetTemplate();
        if (core_1._.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid();
            this.registerDetailWithMaster();
            this.loadRowData();
            window.setTimeout(function () {
                // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
                if (_this.detailGridOptions.api) {
                    _this.detailGridOptions.api.doLayout();
                }
            }, 0);
        }
        else {
            console.warn('ag-Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
        this.addManagedListener(params.node.parent, core_1.RowNode.EVENT_DATA_CHANGED, function () {
            _this.needRefresh = true;
        });
        this.setupAutoGridHeight();
    };
    DetailCellRenderer.prototype.refresh = function () {
        var GET_GRID_TO_REFRESH = false;
        var GET_GRID_TO_DO_NOTHING = true;
        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        var doNotRefresh = !this.needRefresh || this.params.refreshStrategy === 'nothing';
        if (doNotRefresh) {
            // we do nothing in this refresh method, and also tell the grid to do nothing
            return GET_GRID_TO_DO_NOTHING;
        }
        // reset flag, so don't refresh again until more data changes.
        this.needRefresh = false;
        if (this.params.refreshStrategy === 'everything') {
            // we want full refresh, so tell the grid to destroy and recreate this cell
            return GET_GRID_TO_REFRESH;
        }
        else {
            // do the refresh here, and tell the grid to do nothing
            this.loadRowData();
            return GET_GRID_TO_DO_NOTHING;
        }
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    DetailCellRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    DetailCellRenderer.prototype.checkForDeprecations = function () {
        if (this.params.suppressRefresh) {
            console.warn("ag-Grid: as of v23.2.0, cellRendererParams.suppressRefresh for Detail Cell Renderer is no " +
                "longer used. Please set cellRendererParams.refreshStrategy = 'nothing' instead.");
            this.params.refreshStrategy = 'nothing';
        }
    };
    DetailCellRenderer.prototype.ensureValidRefreshStrategy = function () {
        switch (this.params.refreshStrategy) {
            case 'rows': return;
            case 'nothing': return;
            case 'everything': return;
        }
        // check for incorrectly supplied refresh strategy
        if (this.params.refreshStrategy) {
            console.warn("ag-Grid: invalid cellRendererParams.refreshStrategy = '" + this.params.refreshStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }
        // use default strategy
        this.params.refreshStrategy = 'rows';
    };
    DetailCellRenderer.prototype.setupAutoGridHeight = function () {
        var _this = this;
        if (!this.params.autoHeight) {
            return;
        }
        var gridApi = this.params.api;
        var onRowHeightChangedDebounced = core_1._.debounce(gridApi.onRowHeightChanged.bind(gridApi), 20);
        var checkRowSizeFunc = function () {
            var clientHeight = _this.getGui().clientHeight;
            if (clientHeight != null) {
                _this.params.node.setRowHeight(clientHeight);
                onRowHeightChangedDebounced();
            }
        };
        var resizeObserverDestroyFunc = this.resizeObserverService.observeResize(this.getGui(), checkRowSizeFunc);
        this.addDestroyFunc(resizeObserverDestroyFunc);
        checkRowSizeFunc();
    };
    DetailCellRenderer.prototype.addThemeToDetailGrid = function () {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        var theme = this.environment.getTheme().theme;
        if (theme) {
            core_1._.addCssClass(this.eDetailGrid, theme);
        }
    };
    DetailCellRenderer.prototype.registerDetailWithMaster = function () {
        var rowId = this.params.node.id;
        var masterGridApi = this.params.api;
        var gridInfo = {
            id: rowId,
            api: this.detailGridOptions.api,
            columnApi: this.detailGridOptions.columnApi
        };
        var rowNode = this.params.node;
        // register with api
        masterGridApi.addDetailGridInfo(rowId, gridInfo);
        // register with node
        rowNode.detailGridInfo = gridInfo;
        this.addDestroyFunc(function () {
            masterGridApi.removeDetailGridInfo(rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    };
    DetailCellRenderer.prototype.selectAndSetTemplate = function () {
        var _this = this;
        var setDefaultTemplate = function () {
            _this.setTemplate(DetailCellRenderer.TEMPLATE);
            var autoHeight = _this.params.autoHeight;
            _this.addCssClass(autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height');
            core_1._.addCssClass(_this.eDetailGrid, autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height');
        };
        if (core_1._.missing(this.params.template)) {
            // use default template
            setDefaultTemplate();
        }
        else {
            // use user provided template
            if (typeof this.params.template === 'string') {
                this.setTemplate(this.params.template);
            }
            else if (typeof this.params.template === 'function') {
                var templateFunc = this.params.template;
                var template = templateFunc(this.params);
                this.setTemplate(template);
            }
            else {
                console.warn('ag-Grid: detailCellRendererParams.template should be function or string');
                setDefaultTemplate();
            }
        }
    };
    DetailCellRenderer.prototype.createDetailsGrid = function () {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions
        var _this = this;
        var gridOptions = this.params.detailGridOptions;
        if (core_1._.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }
        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = core_1._.cloneObject(gridOptions);
        if (this.params.autoHeight) {
            this.detailGridOptions.domLayout = 'autoHeight';
        }
        // tslint:disable-next-line
        new core_1.Grid(this.eDetailGrid, this.detailGridOptions, {
            $scope: this.params.$scope,
            $compile: this.params.$compile,
            providedBeanInstances: {
                // a temporary fix for AG-1574
                // AG-1715 raised to do a wider ranging refactor to improve this
                agGridReact: this.params.agGridReact,
                // AG-1716 - directly related to AG-1574 and AG-1715
                frameworkComponentWrapper: this.params.frameworkComponentWrapper
            }
        });
        this.addDestroyFunc(function () {
            if (_this.detailGridOptions.api) {
                _this.detailGridOptions.api.destroy();
            }
        });
    };
    DetailCellRenderer.prototype.loadRowData = function () {
        var _this = this;
        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        var versionThisCall = this.loadRowDataVersion;
        var userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('ag-Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        var successCallback = function (rowData) {
            var mostRecentCall = _this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                _this.setRowData(rowData);
            }
        };
        var funcParams = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback
        };
        userFunc(funcParams);
    };
    DetailCellRenderer.prototype.setRowData = function (rowData) {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        if (this.detailGridOptions.api) {
            this.detailGridOptions.api.setRowData(rowData);
        }
    };
    DetailCellRenderer.TEMPLATE = "<div class=\"ag-details-row\">\n            <div ref=\"eDetailGrid\" class=\"ag-details-grid\"/>\n        </div>";
    __decorate([
        core_1.Autowired('environment')
    ], DetailCellRenderer.prototype, "environment", void 0);
    __decorate([
        core_1.RefSelector('eDetailGrid')
    ], DetailCellRenderer.prototype, "eDetailGrid", void 0);
    __decorate([
        core_1.Autowired('resizeObserverService')
    ], DetailCellRenderer.prototype, "resizeObserverService", void 0);
    return DetailCellRenderer;
}(core_1.Component));
exports.DetailCellRenderer = DetailCellRenderer;
//# sourceMappingURL=detailCellRenderer.js.map