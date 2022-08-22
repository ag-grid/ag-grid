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
import { Component, Grid, RefSelector, _ } from "@ag-grid-community/core";
import { DetailCellRendererCtrl } from "./detailCellRendererCtrl";
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
        if (_.missing(this.params.template)) {
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
        var agGridReactCloned = agGridReact ? _.cloneObject(agGridReact) : undefined;
        // when we create detail grid, the detail grid needs frameworkComponentWrapper so that
        // it created child components correctly, ie  Angular detail grid can have Angular cell renderer.
        // this is only used by Angular and Vue, as React uses native React AG Grid detail grids
        var frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        var frameworkOverrides = this.getFrameworkOverrides();
        // tslint:disable-next-line
        new Grid(this.eDetailGrid, gridOptions, {
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
        RefSelector('eDetailGrid')
    ], DetailCellRenderer.prototype, "eDetailGrid", void 0);
    return DetailCellRenderer;
}(Component));
export { DetailCellRenderer };
