import type {
    BeanCollection,
    ColumnNameService,
    FilterManager,
    FuncColsService,
    IAfterGuiAttachedParams,
    IFilterComp,
    IFilterParams,
    InternalColumn,
} from '@ag-grid-community/core';
import {
    AgPromise,
    AgSelect,
    Events,
    FilterWrapperComp,
    RefPlaceholder,
    TabGuardComp,
    _clearElement,
    _loadTemplate,
    _setDisplayed,
    _warnOnce,
} from '@ag-grid-community/core';

interface FilterColumnPair {
    filter: IFilterComp;
    column: InternalColumn;
}

export class GroupFilter extends TabGuardComp implements IFilterComp {
    private filterManager: FilterManager;
    private columnNameService: ColumnNameService;
    private funcColsService: FuncColsService;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.filterManager = beans.filterManager;
        this.columnNameService = beans.columnNameService;
        this.funcColsService = beans.funcColsService;
    }

    public static EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
    public static EVENT_SELECTED_COLUMN_CHANGED = 'selectedColumnChanged';

    private readonly eGroupField: HTMLElement = RefPlaceholder;
    private readonly eUnderlyingFilter: HTMLElement = RefPlaceholder;

    private params: IFilterParams;
    private groupColumn: InternalColumn;
    private selectedColumn: InternalColumn | undefined;
    private selectedFilter: IFilterComp | undefined;
    private filterColumnPairs: FilterColumnPair[] | undefined;
    private eGroupFieldSelect: AgSelect;
    private afterGuiAttachedParams: IAfterGuiAttachedParams | undefined;
    private filterWrapperComp?: FilterWrapperComp;

    constructor() {
        super(/* html */ `
            <div class="ag-group-filter">
                <div data-ref="eGroupField"></div>
                <div data-ref="eUnderlyingFilter"></div>
            </div>
        `);
    }

    public postConstruct() {
        this.initialiseTabGuard({});
    }

    public init(params: IFilterParams): AgPromise<void> {
        this.params = params;
        this.validateParams();
        return this.updateGroups().then(() => {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () =>
                this.onColumnRowGroupChanged()
            );
        });
    }

    private validateParams(): void {
        const { colDef } = this.params;
        if (colDef.field) {
            _warnOnce(
                'Group Column Filter does not work with the colDef property "field". This property will be ignored.'
            );
        }
        if (colDef.filterValueGetter) {
            _warnOnce(
                'Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'
            );
        }
        if (colDef.filterParams) {
            _warnOnce(
                'Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'
            );
        }
    }

    private updateGroups(): AgPromise<void> {
        const sourceColumns = this.updateGroupField();
        return this.getUnderlyingFilters(sourceColumns);
    }

    private getSourceColumns(): InternalColumn[] {
        this.groupColumn = this.params.column as InternalColumn;
        if (this.gos.get('treeData')) {
            _warnOnce(
                'Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'
            );
            return [];
        }
        const sourceColumns = this.funcColsService.getSourceColumnsForGroupColumn(this.groupColumn);
        if (!sourceColumns) {
            _warnOnce('Group Column Filter only works on group columns. Please use a different filter.');
            return [];
        }
        return sourceColumns;
    }

    private updateGroupField(): InternalColumn[] | null {
        _clearElement(this.eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        const allSourceColumns = this.getSourceColumns();
        const sourceColumns = allSourceColumns.filter((sourceColumn) => sourceColumn.isFilterAllowed());
        if (!sourceColumns.length) {
            this.selectedColumn = undefined;
            _setDisplayed(this.eGroupField, false);
            return null;
        }
        if (allSourceColumns.length === 1) {
            // we only want to hide the group field element if there's only one group column.
            // If there's one group column that has a filter, but multiple columns in total,
            // we should still show the select so the user knows which column it's for.
            this.selectedColumn = sourceColumns[0];
            _setDisplayed(this.eGroupField, false);
        } else {
            // keep the old selected column if it's still valid
            if (
                !this.selectedColumn ||
                !sourceColumns.some((column) => column.getId() === this.selectedColumn!.getId())
            ) {
                this.selectedColumn = sourceColumns[0];
            }
            this.createGroupFieldSelectElement(sourceColumns);
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(_loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            _setDisplayed(this.eGroupField, true);
        }

        return sourceColumns;
    }

    private createGroupFieldSelectElement(sourceColumns: InternalColumn[]): void {
        this.eGroupFieldSelect = this.createManagedBean(new AgSelect());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eGroupFieldSelect.setLabel(localeTextFunc('groupFilterSelect', 'Select field:'));
        this.eGroupFieldSelect.setLabelAlignment('top');
        this.eGroupFieldSelect.addOptions(
            sourceColumns.map((sourceColumn) => ({
                value: sourceColumn.getId(),
                text: this.columnNameService.getDisplayNameForColumn(sourceColumn, 'groupFilter', false) ?? undefined,
            }))
        );
        this.eGroupFieldSelect.setValue(this.selectedColumn!.getId());
        this.eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
        this.eGroupFieldSelect.addCssClass('ag-group-filter-field-select-wrapper');
        if (sourceColumns.length === 1) {
            this.eGroupFieldSelect.setDisabled(true);
        }
    }

    private getUnderlyingFilters(sourceColumns: InternalColumn[] | null): AgPromise<void> {
        if (!sourceColumns) {
            this.filterColumnPairs = undefined;
            this.selectedFilter = undefined;
            this.groupColumn.setFilterActive(false, 'columnRowGroupChanged');
            return AgPromise.resolve();
        }
        const filterPromises: AgPromise<IFilterComp>[] = [];
        const filterColumnPairs: FilterColumnPair[] = [];
        sourceColumns.forEach((column) => {
            const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
            if (filterWrapper?.filterPromise) {
                filterPromises.push(
                    filterWrapper.filterPromise.then((filter) => {
                        if (filter) {
                            filterColumnPairs.push({
                                filter,
                                column,
                            });
                        }
                        if (column.getId() === this.selectedColumn!.getId()) {
                            this.selectedFilter = filter ?? undefined;
                        }
                        return filter!;
                    })
                );
            }
        });
        return AgPromise.all(filterPromises).then(() => {
            this.filterColumnPairs = filterColumnPairs;
            this.groupColumn.setFilterActive(this.isFilterActive(), 'columnRowGroupChanged');
        });
    }

    private addUnderlyingFilterElement(): AgPromise<void> {
        _clearElement(this.eUnderlyingFilter);
        if (!this.selectedColumn) {
            return AgPromise.resolve();
        }
        const comp = this.createManagedBean(new FilterWrapperComp(this.selectedColumn, 'COLUMN_MENU'));
        this.filterWrapperComp = comp;
        if (!comp.hasFilter()) {
            return AgPromise.resolve();
        }
        this.eUnderlyingFilter.appendChild(comp.getGui());

        return (
            comp.getFilter()?.then(() => {
                comp.afterGuiAttached?.(this.afterGuiAttachedParams);
                if (
                    !this.afterGuiAttachedParams?.suppressFocus &&
                    this.eGroupFieldSelect &&
                    !this.eGroupFieldSelect.isDisabled()
                ) {
                    this.eGroupFieldSelect.getFocusableElement().focus();
                }
            }) ?? AgPromise.resolve()
        );
    }

    private updateSelectedColumn(columnId: string | null | undefined): void {
        if (!columnId) {
            return;
        }
        this.filterWrapperComp?.afterGuiDetached();
        this.destroyBean(this.filterWrapperComp);
        const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
        this.selectedColumn = selectedFilterColumnPair?.column;
        this.selectedFilter = selectedFilterColumnPair?.filter;

        this.dispatchEvent({
            type: GroupFilter.EVENT_SELECTED_COLUMN_CHANGED,
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
        _clearElement(this.eUnderlyingFilter);
        this.selectedFilter?.afterGuiDetached?.();
    }

    private onColumnRowGroupChanged(): void {
        this.updateGroups().then(() => {
            this.dispatchEvent({
                type: GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED,
            });
            this.eventService.dispatchEvent({
                type: 'filterAllowedUpdated',
            });
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

    public getSelectedColumn(): InternalColumn | undefined {
        return this.selectedColumn;
    }

    public isFilterAllowed(): boolean {
        return !!this.selectedColumn;
    }

    public destroy(): void {
        super.destroy();
    }
}
