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

export class GroupFilter extends TabGuardComp implements IFilterComp {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    @RefSelector('eGroupField') private readonly eGroupField: HTMLElement;
    @RefSelector('eUnderlyingFilter') private readonly eUnderlyingFilter: HTMLElement;

    private params: IFilterParams;
    private groupColumn: Column;
    private selectedColumn: Column;
    private sourceColumns: Column[];
    private filters: IFilterComp[];
    private eGroupFieldSelect: AgSelect;

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
        return this.updateGroups().then(isValid => {
            if (isValid) {
                this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
            }
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

    private updateGroups(): AgPromise<boolean> {
        const isValid = this.updateGroupField();
        if (!isValid) {
            return AgPromise.resolve(false);
        }
        return this.getUnderlyingFilters().then(() => true);
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
        this.sourceColumns = sourceColumns.filter(sourceColumn => sourceColumn.isFilterAllowed());
        if (!this.sourceColumns.length) {
            // TODO - prevent this from being reached.
        }
        return this.sourceColumns;
    }

    private updateGroupField(): boolean {
        _.clearElement(this.eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        this.sourceColumns = this.getSourceColumns();
        if (!this.sourceColumns.length) {
            // TODO - can we hide the filter completely here?
            _.setDisplayed(this.eGroupField, false);
            return false;
        }
        if (this.sourceColumns.length === 1) {
            this.selectedColumn = this.sourceColumns[0];
            // don't need group field element
            _.setDisplayed(this.eGroupField, false);
        } else {
            // keep the old selected column if it's still valid
            if (!this.selectedColumn || !this.sourceColumns.some(column => column.getId() === this.selectedColumn.getId())) {
                this.selectedColumn = this.sourceColumns[0];
            }
            this.createGroupFieldSelect();
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(_.loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            _.setDisplayed(this.eGroupField, true);
        }

        return true;
    }

    private createGroupFieldSelect(): void {
        this.eGroupFieldSelect = this.createManagedBean(new AgSelect());
        this.eGroupFieldSelect.setLabel('Select field:');
        this.eGroupFieldSelect.setLabelAlignment('top');
        this.eGroupFieldSelect.addOptions(this.sourceColumns.map(sourceColumn => ({
                value: sourceColumn.getId(),
            text: this.columnModel.getDisplayNameForColumn(sourceColumn, 'groupFilter', false) ?? undefined
        })));
        this.eGroupFieldSelect.setValue(this.selectedColumn.getId());
        this.eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
        this.eGroupFieldSelect.addCssClass('ag-simple-filter-body-wrapper');
    }

    private getUnderlyingFilters(): AgPromise<void> {
        const filterPromises: AgPromise<IFilterComp>[] = [];
        this.sourceColumns.forEach(sourceColumn => {
            const filterWrapper = this.filterManager.getOrCreateFilterWrapper(sourceColumn, 'COLUMN_MENU');
            if (filterWrapper?.filterPromise) {
                filterPromises.push(filterWrapper.filterPromise);
            }
        });
        return AgPromise.all(filterPromises).then(filters => {
            this.filters = filters as IFilterComp[];
            this.groupColumn.setFilterActive(this.isFilterActive(), 'columnRowGroupChanged');
        });
    }

    private showUnderlyingFilter(): AgPromise<void> {
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
        });
    }

    private updateSelectedColumn(columnId: string | null | undefined): void {
        if (!columnId) {
            return;
        }
        this.selectedColumn = this.sourceColumns.find(sourceColumn => sourceColumn.getId() === columnId)!;
        this.showUnderlyingFilter();
    }

    public destroy(): void {}

    public isFilterActive(): boolean {
        return this.filters.some(filter => filter.isFilterActive());
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

    public afterGuiAttached(params: IAfterGuiAttachedParams | undefined): void {
        this.showUnderlyingFilter();
    }

    public afterGuiDetached(): void {
        _.clearElement(this.eUnderlyingFilter);
    }

    private onColumnRowGroupChanged(): void {
        this.updateGroups();
    }
}
