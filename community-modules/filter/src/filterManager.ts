import { _, Autowired, Bean, BeanStub, Column, FilterExpression, RowNode, ValueService, ColumnModel, IFilterComp, GridOptions, UserComponentFactory, IFilterParams, AgPromise, Component } from "@ag-grid-community/core";
import { ExpressionComponent } from "./components/interfaces";
import { createComponent } from "./filterMapping";
import { FilterChangeListener, FilterStateManager } from "./state/filterStateManager";

interface IFilterCompUI {
    type: 'IFilterComp';
    comp: IFilterComp;
}

interface ExpressionComponentUI {
    type: 'ExpressionComponent',
    comp: ExpressionComponent & Component,
}

export type FilterUI = IFilterCompUI | ExpressionComponentUI;

@Bean('filterManagerV2')
export class FilterManager extends BeanStub {
    @Autowired('filterStateManager') private readonly filterState: FilterStateManager;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private readonly filterUIs: Record<string, FilterUI> = {};
    
    public createFilterComp(column: Column, params: IFilterParams): AgPromise<FilterUI> {
        const colId = column.getColId();
        if (this.filterUIs[colId] != null) { AgPromise.resolve(this.filterUIs[colId]); }

        const filterExprComp = createComponent(column, this.gridOptions);
        if (filterExprComp) {
            this.filterUIs[colId] = {
                type: 'ExpressionComponent',
                comp: this.initialiseFilterComponent(column, filterExprComp),
            };
            return AgPromise.resolve(this.filterUIs[colId]);
        }

        const compDetails = this.userComponentFactory.getFilterDetails(column.getColDef(), params, 'agTextColumnFilter');
        if (compDetails == null) { throw new Error('AG Grid - unable to create filter for: ' + colId); }

        return compDetails.newAgStackInstance()
            .then((newComp: IFilterComp) => {
                this.filterUIs[colId] = {
                    type: 'IFilterComp',
                    comp: newComp,
                };
                return this.filterUIs[colId];
            });
    }

    public getFilterState(): {[key: string]: FilterExpression} | null {
        return this.filterState.getCurrentState();
    }

    public setFilterState(exprs: {[key: string]: FilterExpression} | null) {
        this.filterState.setCurrentState(exprs);
    }

    public evaluateFilters(params: { rowNode: RowNode, colId?: string }): boolean {
        const currentFilterState = this.filterState.getCurrentModel();
        if (currentFilterState == null) { return true; }

        const { rowNode, colId } = params;
        const columns = colId ? [colId] : Object.keys(currentFilterState);
        for (const columnId of columns) {
            const input = this.getCellValue({ colId: columnId, rowNode });
            const model = currentFilterState[columnId];

            if (!model.isNull() && !model.evaluate(input)) {
                return false;
            }
        }

        return true;
    }

    private initialiseFilterComponent<T extends ExpressionComponent>(column: Column, comp: T): T {
        this.createBean(comp);
        this.addDestroyFunc(() => this.destroyBean(comp));

        comp.setParameters({
            stateManager: this.filterState.getStateManager(column),
        });
        return comp;
    }

    public addListenerForColumn(source: any, column: Column, cb: FilterChangeListener) {
        this.filterState.addListenerForColumn(source, column, cb);
    }

    private getCellValue(opts: { colId: string, rowNode: RowNode }): unknown {
        const { colId, rowNode } = opts;

        const column = this.columnModel.getGridColumn(colId);
        if (column == null) { return null; }

        return this.valueService.getValue(column, rowNode, true);
    }
}
