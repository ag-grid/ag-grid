/**
          * @ag-grid-enterprise/master-detail - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.2.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __assign = (undefined && undefined.__assign) || function () {
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
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DetailCellRendererCtrl = /** @class */ (function (_super) {
    __extends$1(DetailCellRendererCtrl, _super);
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
        this.addManagedListener(params.node.parent, core.RowNode.EVENT_DATA_CHANGED, function () {
            _this.needRefresh = true;
        });
        this.addManagedListener(this.eventService, core.Events.EVENT_FULL_WIDTH_ROW_FOCUSED, this.onFullWidthRowFocused.bind(this));
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
        if (core._.missing(this.params.detailGridOptions)) {
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
    __decorate$1([
        core.Autowired('rowPositionUtils')
    ], DetailCellRendererCtrl.prototype, "rowPositionUtils", void 0);
    __decorate$1([
        core.Autowired('focusService')
    ], DetailCellRendererCtrl.prototype, "focusService", void 0);
    return DetailCellRendererCtrl;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DetailCellRenderer = /** @class */ (function (_super) {
    __extends(DetailCellRenderer, _super);
    function DetailCellRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DetailCellRenderer.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        this.selectAndSetTemplate();
        var compProxy = {
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            addOrRemoveDetailGridCssClass: function (cssClassName, on) { return _this.eDetailGrid.classList.toggle(cssClassName, on); },
            setDetailGrid: function (gridOptions) { return _this.setDetailGrid(gridOptions); },
            setRowData: function (rowData) { return _this.setRowData(rowData); },
            getGui: function () { return _this.eDetailGrid; }
        };
        this.ctrl = this.createManagedBean(new DetailCellRendererCtrl());
        this.ctrl.init(compProxy, params);
    };
    DetailCellRenderer.prototype.refresh = function () {
        return this.ctrl && this.ctrl.refresh();
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    DetailCellRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    DetailCellRenderer.prototype.selectAndSetTemplate = function () {
        var _this = this;
        if (this.params.pinned) {
            this.setTemplate('<div class="ag-details-row"></div>');
            return;
        }
        var setDefaultTemplate = function () {
            _this.setTemplate(DetailCellRenderer.TEMPLATE);
        };
        if (core._.missing(this.params.template)) {
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
                console.warn('AG Grid: detailCellRendererParams.template should be function or string');
                setDefaultTemplate();
            }
        }
        if (this.eDetailGrid == null) {
            console.warn('AG Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
    };
    DetailCellRenderer.prototype.setDetailGrid = function (gridOptions) {
        if (!this.eDetailGrid) {
            return;
        }
        // AG-1715
        // this is only needed when reactUi=false, once we remove the old way
        // of doing react, and Master / Details is all native React, then we
        // can remove this code.
        var agGridReact = this.context.getBean('agGridReact');
        var agGridReactCloned = agGridReact ? core._.cloneObject(agGridReact) : undefined;
        // when we create detail grid, the detail grid needs frameworkComponentWrapper so that
        // it created child components correctly, ie  Angular detail grid can have Angular cell renderer.
        // this is only used by Angular and Vue, as React uses native React AG Grid detail grids
        var frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        var frameworkOverrides = this.getFrameworkOverrides();
        // tslint:disable-next-line
        new core.Grid(this.eDetailGrid, gridOptions, {
            frameworkOverrides: frameworkOverrides,
            providedBeanInstances: {
                agGridReact: agGridReactCloned,
                frameworkComponentWrapper: frameworkComponentWrapper
            }
        });
        this.detailApi = gridOptions.api;
        this.ctrl.registerDetailWithMaster(gridOptions.api, gridOptions.columnApi);
        this.addDestroyFunc(function () {
            if (gridOptions.api) {
                gridOptions.api.destroy();
            }
        });
    };
    DetailCellRenderer.prototype.setRowData = function (rowData) {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        this.detailApi && this.detailApi.setRowData(rowData);
    };
    DetailCellRenderer.TEMPLATE = "<div class=\"ag-details-row\" role=\"gridcell\">\n            <div ref=\"eDetailGrid\" class=\"ag-details-grid\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        core.RefSelector('eDetailGrid')
    ], DetailCellRenderer.prototype, "eDetailGrid", void 0);
    return DetailCellRenderer;
}(core.Component));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.2.0';

var MasterDetailModule = {
    version: VERSION,
    moduleName: core.ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        { componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer }
    ],
    controllers: [
        { controllerName: 'detailCellRenderer', controllerClass: DetailCellRendererCtrl }
    ],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.MasterDetailModule = MasterDetailModule;
