import {
    _,
    AgPromise,
    AgSelect,
    Autowired,
    Column,
    ColumnModel,
    Events,
    FilterManager,
    IAfterGuiAttachedParams,
    IFilterComp,
    IFilterParams,
    PostConstruct,
    RefSelector,
    TabGuardComp,
} from '@ag-grid-community/core';

interface FilterColumnPair {
    filter: IFilterComp;
    column: Column;
}

export class GroupFilter extends TabGuardComp implements IFilterComp {
    public static EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
    public static EVENT_SELECTED_COLUMN_CHANGED = 'selectedColumnChanged';

    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    @RefSelector('eGroupField') private readonly eGroupField: HTMLElement;
    @RefSelector('eUnderlyingFilter') private readonly eUnderlyingFilter: HTMLElement;

    private params: IFilterParams;
    private groupColumn: Column;
    private selectedColumn: Column | undefined;
    private selectedFilter: IFilterComp | undefined;
    private filterColumnPairs: FilterColumnPair[] | undefined;
    private eGroupFieldSelect: AgSelect;
    private afterGuiAttachedParams: IAfterGuiAttachedParams | undefined;

    constructor() {
        super(/* html */ `
            <div class="ag-group-filter">
                <div ref="eGroupField"></div>
                <div ref="eUnderlyingFilter"></div>
            </div>
        `);
    }

    @PostConstruct
    private postConstruct() {
        this.initialiseTabGuard({});
    }

    public init(params: IFilterParams): AgPromise<void> {
        this.params = params;
        this.validateParams();
        return this.updateGroups().then(() => {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
        });
    }

    private validateParams(): void {
        const { colDef } = this.params;
        if (colDef.field) {
            _.doOnce(() => console.warn(
                        'AG Grid: Group Filter does not work with the colDef property "field". This property will be ignored.'
                ), 'groupFilterFieldParam'
            );
        } else if (colDef.filterValueGetter) {
            _.doOnce(() => console.warn(
                        'AG Grid: Group Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'
                ), 'groupFilterFilterValueGetterParam'
            );
        }
    }

    private updateGroups(): AgPromise<void> {
        const sourceColumns = this.updateGroupField();
        return this.getUnderlyingFilters(sourceColumns);
    }

    private getSourceColumns(): Column[] {
        this.groupColumn = this.params.column;
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(() => console.warn(
                        'AG Grid: Group Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'
                ), 'groupFilterTreeData'
            );
            return [];
        }
        const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.groupColumn);
        if (!sourceColumns) {
            _.doOnce(() => console.warn(
                    'AG Grid: Group Filter only works on group columns. Please use a different filter.'
                ), 'groupFilterNotGroupColumn'
            );
            return [];
        }
        return sourceColumns;
    }

    private updateGroupField(): Column[] | null {
        _.clearElement(this.eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        const allSourceColumns = this.getSourceColumns();
        const sourceColumns = allSourceColumns.filter(sourceColumn => sourceColumn.isFilterAllowed());
        if (!sourceColumns.length) {
            this.selectedColumn = undefined;
            _.setDisplayed(this.eGroupField, false);
            return null;
        }
        if (allSourceColumns.length === 1) {
            // we only want to hide the group field element if there's only one group column.
            // If there's one group column that has a filter, but multiple columns in total,
            // we should still show the select so the user knows which column it's for.
            this.selectedColumn = sourceColumns[0];
            _.setDisplayed(this.eGroupField, false);
        } else {
            // keep the old selected column if it's still valid
            if (!this.selectedColumn || !sourceColumns.some(column => column.getId() === this.selectedColumn!.getId())) {
                this.selectedColumn = sourceColumns[0];
            }
            this.createGroupFieldSelectElement(sourceColumns);
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(_.loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            _.setDisplayed(this.eGroupField, true);
        }

        return sourceColumns;
    }

    private createGroupFieldSelectElement(sourceColumns: Column[]): void {
        this.eGroupFieldSelect = this.createManagedBean(new AgSelect());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eGroupFieldSelect.setLabel(localeTextFunc('groupFilterSelect', 'Select field:'));
        this.eGroupFieldSelect.setLabelAlignment('top');
        this.eGroupFieldSelect.addOptions(sourceColumns.map(sourceColumn => ({
            value: sourceColumn.getId(),
            text: this.columnModel.getDisplayNameForColumn(sourceColumn, 'groupFilter', false) ?? undefined
        })));
        this.eGroupFieldSelect.setValue(this.selectedColumn!.getId());
        this.eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
        this.eGroupFieldSelect.addCssClass('ag-group-filter-field-select-wrapper');
        if (sourceColumns.length === 1) {
            this.eGroupFieldSelect.setDisabled(true);
        }
    }

    private getUnderlyingFilters(sourceColumns: Column[] | null): AgPromise<void> {
        if (!sourceColumns) {
            this.filterColumnPairs = undefined;
            this.selectedFilter = undefined;
            this.groupColumn.setFilterActive(false, 'columnRowGroupChanged');
            return AgPromise.resolve();
        }
        const filterPromises: AgPromise<IFilterComp>[] = [];
        const filterColumnPairs: FilterColumnPair[] = [];
        sourceColumns.forEach(column => {
            const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
            if (filterWrapper?.filterPromise) {
                filterPromises.push(filterWrapper.filterPromise.then(filter => {
                    if (filter) {
                        filterColumnPairs.push({
                            filter,
                            column
                        });
                    }
                    if (column.getId() === this.selectedColumn!.getId()) {
                        this.selectedFilter = filter ?? undefined;
                    }
                    return filter!;
                }));
            }
        });
        return AgPromise.all(filterPromises).then(() => {
            this.filterColumnPairs = filterColumnPairs;
            this.groupColumn.setFilterActive(this.isFilterActive(), 'columnRowGroupChanged');
        });
    }

    private addUnderlyingFilterElement(): AgPromise<void> {
        _.clearElement(this.eUnderlyingFilter);
        if (!this.selectedColumn) {
            return AgPromise.resolve();
        }
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.selectedColumn, 'COLUMN_MENU');
        if (!filterWrapper) {
            return AgPromise.resolve();
        }
        return filterWrapper.guiPromise.then(gui => {
            this.eUnderlyingFilter.appendChild(gui!);
            filterWrapper.filterPromise?.then(filter => {
                filter?.afterGuiAttached?.(this.afterGuiAttachedParams);
                if (!this.afterGuiAttachedParams?.suppressFocus && this.eGroupFieldSelect && !this.eGroupFieldSelect.isDisabled()) {
                    this.eGroupFieldSelect.getFocusableElement().focus();
                }
            });
        });
    }

    private updateSelectedColumn(columnId: string | null | undefined): void {
        if (!columnId) {
            return;
        }
        this.selectedFilter?.afterGuiDetached?.();
        const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
        this.selectedColumn = selectedFilterColumnPair?.column;
        this.selectedFilter = selectedFilterColumnPair?.filter;

        this.dispatchEvent({
            type: GroupFilter.EVENT_SELECTED_COLUMN_CHANGED
        });
        this.addUnderlyingFilterElement();
    }

    public isFilterActive(): boolean {
        return !!this.filterColumnPairs?.some(({ filter }) => filter.isFilterActive());
    }

    public doesFilterPass(): boolean {
        return true;
    }

    public getModel(): null {
        return null;
    }

    public setModel(): AgPromise<void> {
        return AgPromise.resolve();
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.afterGuiAttachedParams = params;
        this.addUnderlyingFilterElement();
    }

    public afterGuiDetached(): void {
        _.clearElement(this.eUnderlyingFilter);
        this.selectedFilter?.afterGuiDetached?.();
    }

    private onColumnRowGroupChanged(): void {
        this.updateGroups().then(() => {
            this.dispatchEvent({
                type: GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED
            });
            this.eventService.dispatchEvent({
                type: 'filterAllowedUpdated'
            })
        });
    }

    private getFilterColumnPair(columnId: string | undefined): FilterColumnPair | undefined {
        if (!columnId) {
            return undefined;
        }
        return this.filterColumnPairs?.find(({ column }) => column.getId() === columnId);
    }

    public getSelectedFilter(): IFilterComp | undefined {
        return this.selectedFilter;
    }

    public getSelectedColumn(): Column | undefined {
        return this.selectedColumn;
    }

    public isFilterAllowed(): boolean {
        return !!this.selectedColumn;
    }

    public destroy(): void {
        super.destroy();
    }
}
