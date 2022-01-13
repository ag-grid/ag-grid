import { AgPromise, Autowired, BeanStub, ColDef, Column, ColumnApi, ColumnEventType, ColumnModel, Events, FilterChangedEvent, FilterUIInfo, FilterRequestSource, GridApi, IFilterComp, IFilterManager, IFilterParams, IRowModel, PostConstruct, RowNode, _, ValueService, Bean, UserCompDetails, IMenuFactory } from "@ag-grid-community/core";
import { ExternalFilterController } from "../controllers/externalFilterController";
import { QuickFilterController } from "../controllers/quickFilterController";
import { AdvancedV2FilterController } from "../controllers/advancedV2FilterController";
import { FilterUI, IFilterParamSupport, InternalFilterController } from "../controllers/interfaces";
import { calculateAffectedColumns, findControllerFor } from "./helpers";
import { AdvancedV1FilterController } from "../controllers/advancedV1FilterController";
import { MODULE_MODE } from "../compatibility";

// TODO(AG-6000): Remove once v2 filters is released.
const BEAN_NAME = MODULE_MODE === 'disabled' ? 'filterManagerAdapter' : 'filterManager';
@Bean(BEAN_NAME)
export class IFilterManagerAdapter extends BeanStub implements IFilterManager {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('rowModel') private readonly rowModel: IRowModel;
    @Autowired('columnApi') private readonly columnApi: ColumnApi;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('valueService') private readonly valueService: ValueService;
    @Autowired('menuFactory') private readonly menuFactory: IMenuFactory;

    @Autowired('quickFilterController') private readonly quickFilterController: QuickFilterController;
    @Autowired('externalFilterController') private readonly externalFilterController: ExternalFilterController;
    @Autowired('advancedV1FilterController') private readonly advancedV1FilterController: AdvancedV1FilterController;
    @Autowired('advancedV2FilterController') private readonly advancedV2FilterController: AdvancedV2FilterController;
    private readonly allControllers: InternalFilterController[] = [];
    private readonly iFilterParamsSupport: IFilterParamSupport;

    private suppressFlashingCellsBecauseFiltering: boolean = false;

    public constructor() {
        super();

        const adaptor = this;
        this.iFilterParamsSupport = {
            createBaseFilterParams: (column) => adaptor.createFilterParams(column, column.getColDef()),
            doesRowPassOtherFilters: (column, rowNode) => adaptor.doesRowPassFilter({ rowNode, columnToSkip: column }),
            onFilterChanged: (params) => adaptor.onFilterChanged(params),
            showMenuAfterButtonClick: (column, source) => adaptor.menuFactory.showMenuAfterButtonClick(
                column,
                source,
                'floatingFilter',
                'filterMenuTab',
                ['filterMenuTab'],
            ),
        };
    }

    @PostConstruct
    private postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, (source) => this.onNewRowsLoaded(source));
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => this.onColumnsChanged());

        this.allControllers.push(
            this.quickFilterController,
            this.externalFilterController,
            this.advancedV1FilterController,
            this.advancedV2FilterController,
        );
        this.allControllers.forEach((controller) => {
            controller.init?.({ support: this.iFilterParamsSupport });
        });
    }

    public doesRowPassFilter(params: { rowNode: RowNode; columnToSkip?: Column }): boolean {
        return this.allControllers.filter(f => f.isActive())
            .every(f => f.evaluate(params));
    }

    public isAdvancedFilterPresent(): boolean {
        return this.allControllers
            .filter(f => f.type === 'advanced')
            .some(f => f.isActive());
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilterController.isActive();
    }

    public isAnyFilterPresent(): boolean {
        return this.allControllers.some(f => f.isActive());
    }

    public isFilterActive(column: Column): boolean {
        return this.allControllers.some(f => f.isFilterActive(column));
    }

    public isSuppressFlashingCellsBecauseFiltering(): boolean {
        return !this.gridOptionsWrapper.isAllowShowChangeAfterFilter() && this.suppressFlashingCellsBecauseFiltering;
    }

    public setQuickFilter(newFilter: any): void {
        this.quickFilterController.setQuickFilter(newFilter);
    }

    public getFilterModel(): { [key: string]: any; } {
        const result: { [key: string]: any; } = {};

        for (const controller of this.allControllers) {
            if (controller.type !== 'advanced') { continue; }

            const controllerResult = controller.getFilterModel();
            Object.assign(result, controllerResult);
        }

        return result;
    }

    public setFilterModel(model: { [key: string]: any; }): void {
        const previousFilterState = this.getFilterModel();
        const newFilterState = _.deepCloneObject(model);
        const modelKeys = _.convertToSet(Object.keys(model || {}));
        const affectedColumns: Column[] = calculateAffectedColumns(previousFilterState, newFilterState, this.columnModel);
        const promises: AgPromise<unknown>[] = [];

        for (const controller of this.allControllers) {
            if (controller.type !== 'advanced') { continue; }

            const modelUpdate: typeof model = {};
            for (const modelKey of modelKeys) {
                const column = this.columnModel.getPrimaryColumn(modelKey);
                if (column == null) { continue; }

                if (controller.isResponsibleFor(column)) {
                    modelUpdate[modelKey] = newFilterState[modelKey];
                    modelKeys.delete(modelKey);
                }
            }

            promises.push(controller.setFilterModel(modelUpdate));
        }

        if (modelKeys.size > 0) {
            throw new Error('AG-Grid - unrecognised columns for model update: ' + modelKeys);
        }

        if (affectedColumns.length > 0) {
            AgPromise.all(promises)
                .then(() => this.onFilterChanged({ columns: affectedColumns }));
        }
    }

    public createFilterParams(column: Column, colDef: ColDef): IFilterParams {
        const params: IFilterParams = {
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            column,
            colDef: _.cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => { },
            filterModifiedCallback: () => { },
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: () => true,
        };

        return params;
    }

    public getFilterUIInfo(column: Column, source: FilterRequestSource): AgPromise<FilterUIInfo> {
        const controller = findControllerFor(column, this.allControllers);
        if (!controller) { throw new Error('AG-Grid - couldn\'t find filter controller for column: ' + column.getColId()); }

        return controller.getFilterUIInfo(column, source);
    }

    public getFloatingFilterCompDetails(column: Column, source: FilterRequestSource): UserCompDetails {
        const controller = findControllerFor(column, this.allControllers);
        if (!controller) { throw new Error('AG-Grid - couldn\'t find filter controller for column: ' + column.getColId()); }

        return controller.getFloatingFilterCompDetails(column, source);
    }

    public getFilterComponent(column: Column, source: FilterRequestSource, createIfDoesNotExist = true): AgPromise<IFilterComp> | null {
        const controller = findControllerFor(column, this.allControllers);
        if (!controller) { throw new Error('AG-Grid - couldn\'t find filter controller for column: ' + column.getColId()); }

        const filterUiToResult = (filterUi: FilterUI) => {
            return filterUi.type === 'IFilterComp' ? filterUi.comp : filterUi.adaptor;
        };

        const colId = column.getColId();
        const filterUis = controller.getAllFilterUIs();
        if (filterUis[colId] != null) {
            return AgPromise.resolve(filterUiToResult(filterUis[colId]));
        }

        if (!createIfDoesNotExist) { return null; }

        return controller.createFilterComp(column, source)
            .then((filterUI) => {
                return filterUiToResult(filterUI!);
            });
    }

    public destroyFilter(column: Column, source: ColumnEventType): void {
        const controller = findControllerFor(column, this.allControllers);
        if (!controller) { throw new Error('AG-Grid - couldn\'t find filter controller for column: ' + column.getColId()); }

        controller.destroyFilter(column, source);
        this.onFilterChanged({columns: [column] }, source);
    }

    public onFilterChanged(
        params: { additionalEventAttributes?: any, columns?: Column[]} = {},
        source: ColumnEventType = 'filterChanged',
    ): void {
        const { additionalEventAttributes, columns } = params;

        this.updateFilterFlagInColumns(source, additionalEventAttributes);

        const filterChangedEvent: FilterChangedEvent = {
            type: Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            columns: columns || [],
        };

        if (additionalEventAttributes) {
            _.mergeDeep(filterChangedEvent, additionalEventAttributes);
        }

        // because internal events are not async in ag-grid, when the dispatchEvent
        // method comes back, we know all listeners have finished executing.
        this.suppressFlashingCellsBecauseFiltering = true;

        this.eventService.dispatchEvent(filterChangedEvent);

        this.suppressFlashingCellsBecauseFiltering = false;
    }

    private onColumnsChanged(): void {
        const columns: Column[] = [];

        for (const controller of this.allControllers) {
            if (controller.type !== 'advanced') { continue; }

            columns.push(...controller.onColumnsChanged());
        }

        if (columns.length > 0) {
            this.onFilterChanged({ columns });
        }
    }

    private onNewRowsLoaded(source: ColumnEventType): void {
        this.updateFilterFlagInColumns(source);
    }

    private updateFilterFlagInColumns(source: ColumnEventType, additionalEventAttributes?: any): void {
        const columns = this.columnModel.getAllPrimaryColumns() || [];
        columns.forEach((column) => {
            const active = this.isFilterActive(column);
            column.setFilterActive(active, source, additionalEventAttributes);
        });
    }

    private createValueGetter(column: Column): IFilterParams['valueGetter'] {
        return ({node}) => this.valueService.getValue(column, node, true);
    }
}