import { _, Bean, RowNode, BeanStub, Autowired, Column, GridOptions, UserComponentFactory, IFilterComp, FilterRequestSource, AgPromise, FilterUIInfo, IFilterParams, Events, ColumnEventType, ColumnModel, FilterModifiedEvent, ColumnApi, GridApi } from "@ag-grid-community/core";
import { expressionType } from "../filterMapping";
import { AdvancedFilterController, IFilterCompUI, IFilterParamSupport } from "./interfaces";

@Bean('advancedV1FilterController')
export class AdvancedV1FilterController extends BeanStub implements AdvancedFilterController<IFilterCompUI> {
    public readonly type = 'advanced';

    @Autowired('columnApi') private readonly columnApi: ColumnApi;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private readonly filterUIs: Record<string, IFilterCompUI> = {};

    public isActive(): boolean {
        return _.values(this.filterUIs)
            .some(ui => ui.comp.isFilterActive());
    }

    public isFilterActive(column: Column): boolean {
        return this.filterUIs[column.getColId()] != null;
    }

    public isResponsibleFor(column: Column): boolean {
        return expressionType(column.getColDef(), this.gridOptions) === 'custom';
    }

    public evaluate(params: { rowNode: RowNode }): boolean {
        const { rowNode, rowNode: { data } } = params;
        const filterParams = { node: rowNode, data: data };

        return _.values(this.filterUIs)
            .every(ui => ui.comp.doesFilterPass(filterParams));
    }

    public getFilterModel(): { [key: string]: any; } {
        const result: { [key: string]: any; } = {};

        for (const colId in this.filterUIs) {
            const model = this.filterUIs[colId].comp.getModel();

            if (model == null) { continue; }

            result[colId] = model;
        }

        return result;
    }

    public setFilterModel(model: { [key: string]: any; }, support: IFilterParamSupport): AgPromise<void> {
        const filterState = _.deepCloneObject(model);
        const remainingModelKeys = _.convertToSet(Object.keys(model));
        const promises: AgPromise<any>[] = [];

        // Handle update + removal cases.
        for (const colId in this.filterUIs) {
            const filterUi = this.filterUIs[colId];
            const column = this.columnModel.getPrimaryColumn(colId);
            if (!column) {
                this.destroyFilter(this.filterUIs[colId].column, 'filterDestroyed');
                continue;
            }

            if (remainingModelKeys.has(colId)) {
                filterUi.comp.setModel(filterState[colId]);
                remainingModelKeys.delete(colId);
            } else {
                this.destroyFilter(column, 'filterDestroyed');
            }
        }

        // Handle new cases.
        for (const colId in remainingModelKeys.values()) {
            const column = this.columnModel.getPrimaryColumn(colId);
            if (!column) {
                throw new Error('AG-Grid - model provided for unknown column: ' + colId);
            }

            const filterPromise = this.createFilterComp(column, 'NO_UI', support);
            promises.push(filterPromise?.then((ui) => ui?.comp?.setModel(filterState[colId])));

            remainingModelKeys.delete(colId);
        }

        return AgPromise.all(promises).then(() => undefined);
    }

    public getFilterUIInfo(column: Column, source: FilterRequestSource, support: IFilterParamSupport): AgPromise<FilterUIInfo> {
        const colId = column.getColId();

        if (this.filterUIs[colId] == null) {
            this.createFilterComp(column, source, support);
        }
        
        return AgPromise.resolve(this.filterUIs[colId]).then(ui => ui!.filterUIInfo);
    }

    public getAllFilterUIs(): Record<string, IFilterCompUI> {
        return Object.freeze(this.filterUIs);
    }

    public createFilterComp(column: Column, source: FilterRequestSource, support: IFilterParamSupport): AgPromise<IFilterCompUI> {
        const colId = column.getColId();
        if (this.filterUIs[colId] != null) { AgPromise.resolve(this.filterUIs[colId]); }

        const params = this.createFilterParams(column, source, support);
        const compDetails = this.userComponentFactory.getFilterDetails(column.getColDef(), params, 'agTextColumnFilter');
        if (compDetails == null) { throw new Error('AG Grid - unable to create filter for: ' + colId); }

        return compDetails.newAgStackInstance()
            .then((newComp: IFilterComp) => {
                const gui = document.createElement('div');
                gui.className = 'ag-filter';

                let guiFromFilter = newComp.getGui();
                gui.appendChild(guiFromFilter);

                if (newComp.onNewRowsLoaded) {
                    this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, () => newComp.onNewRowsLoaded?.());
                }
        
                this.filterUIs[colId] = {
                    type: 'IFilterComp',
                    comp: newComp,
                    filterUIInfo: {
                        gui,
                        afterGuiAttached: (params) => newComp.afterGuiAttached?.(params),
                    },
                    column,
                };
                return this.filterUIs[colId];
            });
    }

    public destroyFilter(column: Column, source: ColumnEventType): AgPromise<void> {
        const colId = column.getColId();
        const filterUI = this.filterUIs[colId];

        if (filterUI == null) { return AgPromise.resolve(); }
        
        const cleanup = () => {
            this.destroyBeans([ filterUI.comp ]);

            delete this.filterUIs[colId];
        };

        const setModelPromise = filterUI.comp.setModel(null);

        if (setModelPromise) {
            return setModelPromise.then(cleanup);
        } else {
            return AgPromise.resolve().then(cleanup);
        }
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

    private createFilterParams(column: Column, source: string, support: IFilterParamSupport): IFilterParams {
        return {
            ...support.createBaseFilterParams(column),
            filterModifiedCallback: () => {
                const event: FilterModifiedEvent = {
                    type: Events.EVENT_FILTER_MODIFIED,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    column,
                    filterInstance: {} as any, // TODO: How to resolve this strange dependency?
                };

                this.eventService.dispatchEvent(event);
            },
            filterChangedCallback: (additionalEventAttributes?: any) =>
                support.onFilterChanged({/* filterInstance, */ additionalEventAttributes, columns: [column]}),
            doesRowPassOtherFilter: node => support.doesRowPassOtherFilters(column, node),
        };
    }
}
