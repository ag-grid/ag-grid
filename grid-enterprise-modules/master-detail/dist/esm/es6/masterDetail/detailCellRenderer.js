var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Grid, RefSelector, _ } from "@ag-grid-community/core";
import { DetailCellRendererCtrl } from "./detailCellRendererCtrl";
export class DetailCellRenderer extends Component {
    init(params) {
        this.params = params;
        this.selectAndSetTemplate();
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveDetailGridCssClass: (cssClassName, on) => this.eDetailGrid.classList.toggle(cssClassName, on),
            setDetailGrid: gridOptions => this.setDetailGrid(gridOptions),
            setRowData: rowData => this.setRowData(rowData),
            getGui: () => this.eDetailGrid
        };
        this.ctrl = this.createManagedBean(new DetailCellRendererCtrl());
        this.ctrl.init(compProxy, params);
    }
    refresh() {
        return this.ctrl && this.ctrl.refresh();
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    selectAndSetTemplate() {
        if (this.params.pinned) {
            this.setTemplate('<div class="ag-details-row"></div>');
            return;
        }
        const setDefaultTemplate = () => {
            this.setTemplate(DetailCellRenderer.TEMPLATE);
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
                const templateFunc = this.params.template;
                const template = templateFunc(this.params);
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
    }
    setDetailGrid(gridOptions) {
        if (!this.eDetailGrid) {
            return;
        }
        // AG-1715
        // this is only needed when suppressReactUi=true, once we remove the old way
        // of doing react, and Master / Details is all native React, then we
        // can remove this code.
        const agGridReact = this.context.getBean('agGridReact');
        const agGridReactCloned = agGridReact ? _.cloneObject(agGridReact) : undefined;
        // when we create detail grid, the detail grid needs frameworkComponentWrapper so that
        // it created child components correctly, ie  Angular detail grid can have Angular cell renderer.
        // this is only used by Angular and Vue, as React uses native React AG Grid detail grids
        const frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        const frameworkOverrides = this.getFrameworkOverrides();
        // tslint:disable-next-line
        new Grid(this.eDetailGrid, gridOptions, {
            frameworkOverrides,
            providedBeanInstances: {
                agGridReact: agGridReactCloned,
                frameworkComponentWrapper: frameworkComponentWrapper
            }
        });
        this.detailApi = gridOptions.api;
        this.ctrl.registerDetailWithMaster(gridOptions.api, gridOptions.columnApi);
        this.addDestroyFunc(() => {
            if (gridOptions.api) {
                gridOptions.api.destroy();
            }
        });
    }
    setRowData(rowData) {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        this.detailApi && this.detailApi.setRowData(rowData);
    }
}
DetailCellRenderer.TEMPLATE = `<div class="ag-details-row" role="gridcell">
            <div ref="eDetailGrid" class="ag-details-grid" role="presentation"></div>
        </div>`;
__decorate([
    RefSelector('eDetailGrid')
], DetailCellRenderer.prototype, "eDetailGrid", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsQ2VsbFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21hc3RlckRldGFpbC9kZXRhaWxDZWxsUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQThCLFdBQVcsRUFBRSxDQUFDLEVBQTJELE1BQU0seUJBQXlCLENBQUM7QUFDL0osT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFbEUsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFNBQVM7SUFldEMsSUFBSSxDQUFDLE1BQWlDO1FBRXpDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBRTVCLE1BQU0sU0FBUyxHQUF3QjtZQUNuQyxtQkFBbUIsRUFBRSxDQUFDLFlBQW9CLEVBQUUsRUFBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztZQUN0Ryw2QkFBNkIsRUFBRSxDQUFDLFlBQW9CLEVBQUUsRUFBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztZQUN6SCxhQUFhLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztZQUM3RCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztZQUMvQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVc7U0FDakMsQ0FBQztRQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLElB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