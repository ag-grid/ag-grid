import { _, Autowired, Bean, BeanStub, Column, RowNode, ValueService, ColumnModel } from "@ag-grid-community/core";
import { ExpressionComponent } from "./components/interfaces";
import { FilterExpression } from "@ag-grid-community/core";
import { FilterChangeListener, FilterStateManager } from "./state/filterStateManager";

@Bean('filterManagerV2')
export class FilterManager extends BeanStub {
    @Autowired('filterStateManager') private readonly filterState: FilterStateManager;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    
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

    public initialiseFilterComponent<T extends ExpressionComponent>(column: Column, comp: T): T {
        comp.setParameters({
            stateManager: this.filterState.getStateManager(column),
        });
        return comp;
    }

    public addListenerForColumn(column: Column, cb: FilterChangeListener) {
        this.filterState.addListenerForColumn(column, cb);
    }

    private getCellValue(opts: { colId: string, rowNode: RowNode }): unknown {
        const { colId, rowNode } = opts;

        const column = this.columnModel.getGridColumn(colId);
        if (column == null) { return null; }

        return this.valueService.getValue(column, rowNode, true);
    }
}
