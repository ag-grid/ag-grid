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
        // this is only needed when suppressReactUi=true, once we remove the old way
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsQ2VsbFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21hc3RlckRldGFpbC9kZXRhaWxDZWxsUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQThCLFdBQVcsRUFBRSxDQUFDLEVBQTJELE1BQU0seUJBQXlCLENBQUM7QUFDL0osT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFbEU7SUFBd0Msc0NBQVM7SUFBakQ7O0lBcUhBLENBQUM7SUF0R1UsaUNBQUksR0FBWCxVQUFZLE1BQWlDO1FBQTdDLGlCQWVDO1FBYkcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFNUIsSUFBTSxTQUFTLEdBQXdCO1lBQ25DLG1CQUFtQixFQUFFLFVBQUMsWUFBb0IsRUFBRSxFQUFXLElBQUssT0FBQSxLQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUExQyxDQUEwQztZQUN0Ryw2QkFBNkIsRUFBRSxVQUFDLFlBQW9CLEVBQUUsRUFBVyxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBbkQsQ0FBbUQ7WUFDekgsYUFBYSxFQUFFLFVBQUEsV0FBVyxJQUFJLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBL0IsQ0FBK0I7WUFDN0QsVUFBVSxFQUFFLFVBQUEsT0FBTyxJQUFJLE9BQUEsS0FBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBeEIsQ0FBd0I7WUFDL0MsTUFBTSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsV0FBVyxFQUFoQixDQUFnQjtTQUNqQyxDQUFDO1FB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