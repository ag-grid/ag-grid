"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailCellRenderer = void 0;
const core_1 = require("@ag-grid-community/core");
const detailCellRendererCtrl_1 = require("./detailCellRendererCtrl");
class DetailCellRenderer extends core_1.Component {
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
        this.ctrl = this.createManagedBean(new detailCellRendererCtrl_1.DetailCellRendererCtrl());
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
        const agGridReactCloned = agGridReact ? core_1._.cloneObject(agGridReact) : undefined;
        // when we create detail grid, the detail grid needs frameworkComponentWrapper so that
        // it created child components correctly, ie  Angular detail grid can have Angular cell renderer.
        // this is only used by Angular and Vue, as React uses native React AG Grid detail grids
        const frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        const frameworkOverrides = this.getFrameworkOverrides();
        const api = (0, core_1.createGrid)(this.eDetailGrid, gridOptions, {
            frameworkOverrides,
            providedBeanInstances: {
                agGridReact: agGridReactCloned,
                frameworkComponentWrapper: frameworkComponentWrapper,
            },
            modules: core_1.ModuleRegistry.__getGridRegisteredModules(this.params.api.getGridId()),
        });
        this.detailApi = api;
        this.ctrl.registerDetailWithMaster(api, new core_1.ColumnApi(api));
        this.addDestroyFunc(() => {
            api === null || api === void 0 ? void 0 : api.destroy();
        });
    }
    setRowData(rowData) {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        this.detailApi && this.detailApi.setGridOption('rowData', rowData);
    }
}
DetailCellRenderer.TEMPLATE = `<div class="ag-details-row" role="gridcell">
            <div ref="eDetailGrid" class="ag-details-grid" role="presentation"></div>
        </div>`;
__decorate([
    (0, core_1.RefSelector)('eDetailGrid')
], DetailCellRenderer.prototype, "eDetailGrid", void 0);
exports.DetailCellRenderer = DetailCellRenderer;
