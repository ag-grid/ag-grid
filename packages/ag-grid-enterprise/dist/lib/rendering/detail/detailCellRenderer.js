// ag-grid-enterprise v21.2.2
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
var DetailCellRenderer = /** @class */ (function (_super) {
    __extends(DetailCellRenderer, _super);
    function DetailCellRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.needRefresh = false;
        return _this;
    }
    DetailCellRenderer.prototype.refresh = function () {
        // if we return true, it means we pretend to the grid
        // that we have refreshed, so refresh will never happen.
        if (this.suppressRefresh) {
            return true;
        }
        // otherwise we only refresh if the data has changed in the node
        // since the last time. this happens when user updates data using transaction.
        var res = !this.needRefresh;
        this.needRefresh = false;
        return res;
    };
    DetailCellRenderer.prototype.init = function (params) {
        var _this = this;
        this.rowId = params.node.id;
        this.masterGridApi = params.api;
        this.suppressRefresh = params.suppressRefresh;
        this.selectAndSetTemplate(params);
        if (ag_grid_community_1._.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid(params);
            this.registerDetailWithMaster(params.node);
            this.loadRowData(params);
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
        this.addDestroyableEventListener(params.node.parent, ag_grid_community_1.RowNode.EVENT_DATA_CHANGED, function () {
            _this.needRefresh = true;
        });
    };
    DetailCellRenderer.prototype.addThemeToDetailGrid = function () {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        var theme = this.environment.getTheme().theme;
        if (theme) {
            ag_grid_community_1._.addCssClass(this.eDetailGrid, theme);
        }
    };
    DetailCellRenderer.prototype.registerDetailWithMaster = function (rowNode) {
        var _this = this;
        var gridInfo = {
            id: this.rowId,
            api: this.detailGridOptions.api,
            columnApi: this.detailGridOptions.columnApi
        };
        // register with api
        this.masterGridApi.addDetailGridInfo(this.rowId, gridInfo);
        // register with node
        rowNode.detailGridInfo = gridInfo;
        this.addDestroyFunc(function () {
            _this.masterGridApi.removeDetailGridInfo(_this.rowId); // unregister from api
            rowNode.detailGridInfo = null; // unregister from node
        });
    };
    DetailCellRenderer.prototype.selectAndSetTemplate = function (params) {
        var paramsAny = params;
        if (ag_grid_community_1._.missing(paramsAny.template)) {
            // use default template
            this.setTemplate(DetailCellRenderer.TEMPLATE);
        }
        else {
            // use user provided template
            if (typeof paramsAny.template === 'string') {
                this.setTemplate(paramsAny.template);
            }
            else if (typeof paramsAny.template === 'function') {
                var templateFunc = paramsAny.template;
                var template = templateFunc(params);
                this.setTemplate(template);
            }
            else {
                console.warn('ag-Grid: detailCellRendererParams.template should be function or string');
                this.setTemplate(DetailCellRenderer.TEMPLATE);
            }
        }
    };
    DetailCellRenderer.prototype.createDetailsGrid = function (params) {
        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api and columnApi into gridOptions
        var _this = this;
        var gridOptions = params.detailGridOptions;
        if (ag_grid_community_1._.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }
        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = ag_grid_community_1._.cloneObject(gridOptions);
        // tslint:disable-next-line
        new ag_grid_community_1.Grid(this.eDetailGrid, this.detailGridOptions, {
            $scope: params.$scope,
            $compile: params.$compile,
            seedBeanInstances: {
                // a temporary fix for AG-1574
                // AG-1715 raised to do a wider ranging refactor to improve this
                agGridReact: params.agGridReact,
                // AG-1716 - directly related to AG-1574 and AG-1715
                frameworkComponentWrapper: params.frameworkComponentWrapper
            }
        });
        this.addDestroyFunc(function () {
            if (_this.detailGridOptions.api) {
                _this.detailGridOptions.api.destroy();
            }
        });
    };
    DetailCellRenderer.prototype.loadRowData = function (params) {
        var userFunc = params.getDetailRowData;
        if (!userFunc) {
            console.warn('ag-Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }
        var funcParams = {
            node: params.node,
            data: params.data,
            successCallback: this.setRowData.bind(this)
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
        ag_grid_community_1.RefSelector('eDetailGrid'),
        __metadata("design:type", HTMLElement)
    ], DetailCellRenderer.prototype, "eDetailGrid", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], DetailCellRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('environment'),
        __metadata("design:type", ag_grid_community_1.Environment)
    ], DetailCellRenderer.prototype, "environment", void 0);
    return DetailCellRenderer;
}(ag_grid_community_1.Component));
exports.DetailCellRenderer = DetailCellRenderer;
