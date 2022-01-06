import { Autowired, AgPromise, Component, IFilterComp, RefSelector, IFilterParams, IDoesFilterPassParams, FilterExpression } from "@ag-grid-community/core";

/**
 * Provides a temporary bridge between the V1 and V2 filter implementation, adapting the V2
 * implementation to meet the API contract for a V1 filter (IFilter).
 */
export class IFilterAdapter extends Component implements IFilterComp {
    @Autowired('filterManagerV2') private readonly filterManager: any; // TODO: Fix me!
    @RefSelector('eFilterRoot') private readonly filterRoot: HTMLElement;

    private wrappedUI: any; // TODO: Fix.
    private params: IFilterParams;

    public constructor() {
        super(/* html */`
            <div class="ag-filter-adapter" ref="eFilterRoot" role="presentation">
            </div>
        `);
    }

    public init(params: IFilterParams) {
        this.params = params;
        
        // TODO: Fix me!
        // this.filterComponentManager.createFilterComp(params.column, params)
        //     .then((result) => {
        //         if (result == null) { return; }

        //         this.wrappedUI = result;

        //         this.postInit(params);
        //     });
    }

    private postInit(params: IFilterParams) {
        const { comp, type } = this.wrappedUI;
        this.filterRoot.appendChild(comp.getGui());

        if (type === 'IFilterComp') { return; }

        const { column, filterChangedCallback } = params;

        this.filterManager.addListenerForColumn(this, column, (params: any) => { // TODO: Fix me!
            if (params.type === 'revert') { return; }

            filterChangedCallback();
        });
    }

    public isFilterActive(): boolean {
        if (this.wrappedUI.type === 'IFilterComp') {
            return this.wrappedUI.comp.isFilterActive();
        }

        const colId = this.getColId();
        const exprs = this.filterManager.getFilterState() || {};
        const expr = exprs[colId];

        return expr != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.wrappedUI.type === 'IFilterComp') {
            return this.wrappedUI.comp.doesFilterPass(params);
        }

        const { node } = params;
        const colId = this.getColId();

        return this.filterManager.evaluateFilters({ rowNode: node, colId });
    }

    public getModel(): FilterExpression | null {
        if (this.wrappedUI.type === 'IFilterComp') {
            return this.wrappedUI.comp.getModel();
        }

        const colId = this.getColId();
        const filterState = this.filterManager.getFilterState();
        return filterState && filterState[colId] || null;
    }

    public setModel(model: any): void | AgPromise<void> {
        if (this.wrappedUI.type === 'IFilterComp') {
            return this.wrappedUI.comp.setModel(model);
        }

        const otherState = this.filterManager.getFilterState();
        const colId = this.getColId();
        this.filterManager.setFilterState({
            ...otherState,
            [colId]: model,
        });
    }

    public destroy() {
        super.destroy();
    }

    private getColId() {
        return this.params.column.getColId();
    }
}
