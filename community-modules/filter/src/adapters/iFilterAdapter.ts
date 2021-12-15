import { Autowired, AgPromise, Component, IFilterComp, RefSelector, IFilterParams, IDoesFilterPassParams, Column, GridOptions, FilterExpression } from "@ag-grid-community/core";
import { FilterManager } from "../filterManager";
import { createComponent } from "../filterMapping";

/**
 * Provides a temporary bridge between the V1 and V2 filter implementation, adapting the V2
 * implementation to meet the API contract for a V1 filter (IFilter).
 */
export class IFilterAdapter extends Component implements IFilterComp {
    @Autowired('filterManagerV2') private readonly filterManager: FilterManager;
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;

    @RefSelector('eFilterRoot') private readonly filterRoot: HTMLElement;

    private params: IFilterParams;

    public constructor() {
        super(/* html */`
            <div class="ag-filter-adapter" ref="eFilterRoot" role="presentation">
            </div>
        `);
    }

    public init(params: IFilterParams) {
        this.params = params;

        const { column, filterChangedCallback } = params;
        const comp = this.createFilterComponent(column);
        this.filterManager.initialiseFilterComponent(column, comp);
        this.filterRoot.appendChild(comp.getGui());

        this.filterManager.addListenerForColumn(column, ({ type }) => {
            if (type === 'revert') { return; }

            filterChangedCallback();
        });
    }

    public isFilterActive(): boolean {
        const colId = this.getColId();
        const exprs = this.filterManager.getFilterState() || {};
        const expr = exprs[colId];

        return expr != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const { node } = params;
        const colId = this.getColId();

        return this.filterManager.evaluateFilters({ rowNode: node, colId });
    }

    public getModel(): FilterExpression | null {
        const colId = this.getColId();
        const filterState = this.filterManager.getFilterState();
        return filterState && filterState[colId] || null;
    }

    public setModel(model: any): void | AgPromise<void> {
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

    private createFilterComponent(column: Column) {
        // @todo: Replace with UserComponentFactory?
        const exprComp = createComponent(column.getColDef(), this.gridOptions);
        this.createBean(exprComp);
        this.addDestroyFunc(() => this.destroyBean(exprComp));

        return exprComp;
    }

    private getColId() {
        return this.params.column.getColId();
    }
}
