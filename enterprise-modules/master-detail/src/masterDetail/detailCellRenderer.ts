import { Component, GridOptions, ICellRenderer, RefSelector, _, GridApi, IDetailCellRenderer, IDetailCellRendererParams, ModuleRegistry, createGrid, GridParams } from "@ag-grid-community/core";
import { DetailCellRendererCtrl } from "./detailCellRendererCtrl";

export class DetailCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-details-row" role="gridcell">
            <div ref="eDetailGrid" class="ag-details-grid" role="presentation"></div>
        </div>`;

    @RefSelector('eDetailGrid') private eDetailGrid: HTMLElement;

    private detailApi: GridApi;

    private params: IDetailCellRendererParams;

    private ctrl: DetailCellRendererCtrl;

    public init(params: IDetailCellRendererParams): void {

        this.params = params;
        this.selectAndSetTemplate();

        const compProxy: IDetailCellRenderer = {
            addOrRemoveCssClass: (cssClassName: string, on: boolean) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveDetailGridCssClass: (cssClassName: string, on: boolean) => this.eDetailGrid.classList.toggle(cssClassName, on),
            setDetailGrid: gridOptions => this.setDetailGrid(gridOptions),
            setRowData: rowData => this.setRowData(rowData),
            getGui: () => this.eDetailGrid
        };

        this.ctrl = this.createManagedBean(new DetailCellRendererCtrl());
        this.ctrl.init(compProxy, params);
    }

    public refresh(): boolean {
        return this.ctrl && this.ctrl.refresh();
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }


    private selectAndSetTemplate(): void {

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
        } else {
            // use user provided template
            if (typeof this.params.template === 'string') {
                this.setTemplate(this.params.template);
            } else if (typeof this.params.template === 'function') {
                const templateFunc = this.params.template;
                const template = templateFunc(this.params);
                this.setTemplate(template);
            } else {
                console.warn('AG Grid: detailCellRendererParams.template should be function or string');
                setDefaultTemplate();
            }
        }

        if (this.eDetailGrid == null) {
            console.warn('AG Grid: reference to eDetailGrid was missing from the details template. ' +
                'Please add ref="eDetailGrid" to the template.');
        }
    }

    private setDetailGrid(gridOptions: GridOptions): void {
        if (!this.eDetailGrid) { return; }

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

        const api = createGrid(this.eDetailGrid, gridOptions, {
            frameworkOverrides,
            providedBeanInstances: {
                agGridReact: agGridReactCloned,
                frameworkComponentWrapper: frameworkComponentWrapper,
            },
            modules: ModuleRegistry.__getGridRegisteredModules(this.params.api.getGridId()),
        } as GridParams);

        this.detailApi = api;
        this.ctrl.registerDetailWithMaster(api);

        this.addDestroyFunc(() => {
            api?.destroy();
        });
    }

    private setRowData(rowData: any[]): void {
        // ensure detail grid api still exists (grid may be destroyed when async call tries to set data)
        this.detailApi && this.detailApi.setGridOption('rowData', rowData);
    }
}
