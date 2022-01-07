import { _, Bean, RowNode, BeanStub, Autowired, Column, IRowModel, ValueService, GridOptions, UserComponentFactory, AgPromise, FilterRequestSource, FilterUIInfo, IFilterParams, ColumnEventType, ColumnModel } from "@ag-grid-community/core";
import { createComponent, expressionType } from "../filterMapping";
import { IFilterAdapter } from "../adapters/iFilterAdapter";
import { AdvancedFilterController, ExpressionComponentUI, IFilterParamSupport } from "./interfaces";
import { ExpressionComponent } from "../components/interfaces";
import { FilterChangeListener, FilterStateManager } from "../state/filterStateManager";

@Bean('advancedV2FilterController')
export class AdvancedV2FilterController extends BeanStub implements AdvancedFilterController<ExpressionComponentUI> {
    public readonly type = 'advanced';

    @Autowired('rowModel') private readonly rowModel: IRowModel;
    @Autowired('valueService') private readonly valueService: ValueService;
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @Autowired('filterStateManager') private readonly filterState: FilterStateManager;

    private readonly filterUIs: Record<string, ExpressionComponentUI> = {};

    public isActive(): boolean {
        return this.filterState.getCurrentState() != null;
    }

    public isFilterActive(column: Column): boolean {
        const colId = column.getColId();
        const exprs = this.filterState.getCurrentState() || {};
        const expr = exprs[colId];
        
        return expr != null;
    }
    
    public isResponsibleFor(column: Column): boolean {
        return expressionType(column.getColDef(), this.gridOptions) !== 'unknown';
    }

    public evaluate(params: { rowNode: RowNode, colId?: string, columnToSkip?: Column }): boolean {
        const currentFilterState = this.filterState.getCurrentModel();
        if (currentFilterState == null) { return true; }

        const { rowNode, colId, columnToSkip } = params;
        const rawColumns = colId ? [colId] : Object.keys(currentFilterState);
        const columns = rawColumns.filter(k => k !== columnToSkip?.getColId());
        for (const columnId of columns) {
            const input = this.getCellValue({ colId: columnId, rowNode });
            const model = currentFilterState[columnId];

            if (!model.isNull() && !model.evaluate(input)) {
                return false;
            }
        }

        return true;
    }
    
    public getFilterModel(): { [key: string]: any; } {
        return this.filterState.getCurrentState() || {};
    }

    public setFilterModel(exprs: {[key: string]: any} | null): AgPromise<void> {
        this.filterState.setCurrentState(exprs);

        return AgPromise.resolve();
    }

    public getFilterUIInfo(column: Column, source: FilterRequestSource, support: IFilterParamSupport): AgPromise<FilterUIInfo> {
        const colId = column.getColId();

        if (this.filterUIs[colId] == null) {
            this.createFilterComp(column, source, support);
        }
        
        return AgPromise.resolve(this.filterUIs[colId]).then(ui => ui!.filterUIInfo);
    }

    public getAllFilterUIs(): Record<string, ExpressionComponentUI> {
        return { ...this.filterUIs };
    }

    public createFilterComp(column: Column, source: FilterRequestSource, support: IFilterParamSupport): AgPromise<ExpressionComponentUI> {
        const colId = column.getColId();
        if (this.filterUIs[colId] != null) { AgPromise.resolve(this.filterUIs[colId]); }

        // TODO: Need to pass IFilterParams to component / model.

        const filterExprComp = createComponent(column, this.gridOptions);
        if (!filterExprComp) {
            throw new Error('AG-Grid - unable to create filter UI component for: ' + column.getColId());
        }
        
        const comp = this.initialiseFilterComponent(column, filterExprComp);

        const adaptor = this.createBean(new IFilterAdapter());
        this.addDestroyFunc(() => this.destroyBean(adaptor));

        this.filterUIs[colId] = {
            type: 'ExpressionComponent',
            comp,
            filterUIInfo: { gui: comp.getGui() },
            adaptor,
            column,
        };

        this.addListenerForColumn(this, column, ({ type }) => {
            if (type === 'revert') { return; }
            
            support.onFilterChanged({ additionalEventAttributes: {}, columns: [column] });
        });

        return AgPromise.resolve(this.filterUIs[colId]);
    }

    public destroyFilter(column: Column, source: ColumnEventType): AgPromise<void> {
        const colId = column.getColId();
        const filterUI = this.filterUIs[colId];

        if (filterUI != null) {
            this.destroyBeans([ filterUI.comp ]);
            delete this.filterUIs[colId];
        }    
        
        // TODO: How should filter state be affected?

        return AgPromise.resolve(undefined as void);
    }

    public onColumnsChanged(): Column[] {
        const result: Column[] = [];

        for (const colId in this.filterUIs) {
            const filterUI = this.filterUIs[colId];
            const currentColumn = this.columnModel.getPrimaryColumn(colId);
            if (currentColumn) { continue; }

            result.push(filterUI.column);
            this.destroyFilter(filterUI.column, 'filterDestroyed');
        }

        return result;
    }

    public addListenerForColumn(source: any, column: Column, cb: FilterChangeListener) {
        this.filterState.addListenerForColumn(source, column, cb);
    }

    private initialiseFilterComponent<T extends ExpressionComponent>(column: Column, comp: T): T {
        this.createBean(comp);
        this.addDestroyFunc(() => this.destroyBean(comp));

        comp.setParameters({
            stateManager: this.filterState.getStateManager(column),
        });
        return comp;
    }

    private getCellValue(opts: { colId: string, rowNode: RowNode }): unknown {
        const { colId, rowNode } = opts;

        const column = this.columnModel.getGridColumn(colId);
        if (column == null) { return null; }

        return this.valueService.getValue(column, rowNode, true);
    }
}
