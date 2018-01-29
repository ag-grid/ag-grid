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
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var DetailCellRenderer = (function (_super) {
    __extends(DetailCellRenderer, _super);
    function DetailCellRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DetailCellRenderer.prototype.init = function (params) {
        var _this = this;
        this.rowId = params.node.id;
        this.masterGridApi = params.api;
        this.selectAndSetTemplate(params);
        if (main_1._.exists(this.eDetailGrid)) {
            this.addThemeToDetailGrid();
            this.createDetailsGrid(params);
            this.registerDetailWithMaster(params.node);
            this.loadRowData(params);
            this.setupGrabMouseWheelEvent();
            setTimeout(function () { return _this.detailGridOptions.api.doLayout(); }, 0);
        }
        else {
            console.warn('ag-Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
    };
    DetailCellRenderer.prototype.addThemeToDetailGrid = function () {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        var theme = this.environment.getTheme();
        if (main_1._.exists(theme)) {
            main_1._.addCssClass(this.eDetailGrid, theme);
        }
    };
    DetailCellRenderer.prototype.setupGrabMouseWheelEvent = function () {
        var mouseWheelListener = function (event) {
            event.stopPropagation();
        };
        // event is 'mousewheel' for IE9, Chrome, Safari, Opera
        this.eDetailGrid.addEventListener('mousewheel', mouseWheelListener);
        // event is 'DOMMouseScroll' Firefox
        this.eDetailGrid.addEventListener('DOMMouseScroll', mouseWheelListener);
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
        if (main_1._.missing(paramsAny.template)) {
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
        if (main_1._.missing(gridOptions)) {
            console.warn('ag-Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
        }
        // IMPORTANT - gridOptions must be cloned
        this.detailGridOptions = main_1._.cloneObject(gridOptions);
        //Passing a dummy agGridReact bean in case this is for a REACT grid
        new main_1.Grid(this.eDetailGrid, this.detailGridOptions, {
            seedBeanInstances: {
                agGridReact: {}
            }
        });
        this.addDestroyFunc(function () { return _this.detailGridOptions.api.destroy(); });
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
        this.detailGridOptions.api.setRowData(rowData);
    };
    DetailCellRenderer.TEMPLATE = "<div class=\"ag-details-row\">\n            <div ref=\"eDetailGrid\" class=\"ag-details-grid\"/>\n        </div>";
    __decorate([
        main_1.RefSelector('eDetailGrid'),
        __metadata("design:type", HTMLElement)
    ], DetailCellRenderer.prototype, "eDetailGrid", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], DetailCellRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('environment'),
        __metadata("design:type", main_1.Environment)
    ], DetailCellRenderer.prototype, "environment", void 0);
    return DetailCellRenderer;
}(main_1.Component));
exports.DetailCellRenderer = DetailCellRenderer;
