import type {
    AgColumn,
    BeanCollection,
    ElementParams,
    FilterDisplayParams,
    IAfterGuiAttachedParams,
    IFilterComp,
    IFilterParams,
} from 'ag-grid-community';
import {
    AgPromise,
    AgSelect,
    FilterComp,
    RefPlaceholder,
    TabGuardComp,
    _clearElement,
    _createElement,
    _setDisplayed,
    _warn,
} from 'ag-grid-community';

import type { GroupFilterHandler } from './groupFilterHandler';
import type { GroupFilterService } from './groupFilterService';

interface FilterColumnPair {
    filter: IFilterComp;
    column: AgColumn;
}

export type GroupFilterEvent = 'columnsChanged';

const GroupFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-group-filter',
    children: [
        { tag: 'div', ref: 'eGroupField' },
        { tag: 'div', ref: 'eUnderlyingFilter' },
    ],
};
export class GroupFilter extends TabGuardComp<GroupFilterEvent> implements IFilterComp {
    public readonly filterType = 'group' as const;

    private readonly eGroupField: HTMLElement = RefPlaceholder;
    private readonly eUnderlyingFilter: HTMLElement = RefPlaceholder;

    private groupFilterSvc: GroupFilterService;

    private params: FilterDisplayParams;
    private groupColumn: AgColumn;
    private selectedFilter: IFilterComp | undefined;
    private filterColumnPairs: FilterColumnPair[] | undefined;
    private eGroupFieldSelect: AgSelect;
    private afterGuiAttachedParams: IAfterGuiAttachedParams | undefined;
    private filterComp?: FilterComp;

    constructor() {
        super(GroupFilterElement);
    }

    public wireBeans(beans: BeanCollection): void {
        this.groupFilterSvc = beans.groupFilter as GroupFilterService;
    }

    public postConstruct() {
        this.initialiseTabGuard({});
    }

    public init(legacyParams: IFilterParams): AgPromise<void> {
        this.params = legacyParams as unknown as FilterDisplayParams;
        return this.updateParams().then(() => {
            this.addHandlerListeners(this.updateGroups.bind(this));
        });
    }

    public refresh(legacyParams: IFilterParams): boolean {
        const params = legacyParams as unknown as FilterDisplayParams;
        this.params = params;
        if (params.source === 'colDef') {
            this.updateParams();
        }
        return true;
    }

    private updateParams(): AgPromise<void> {
        this.validateParams();
        return this.updateGroups();
    }

    private validateParams(): void {
        const { colDef } = this.params;
        if (colDef.field) {
            _warn(234);
        }
        if (colDef.filterValueGetter) {
            _warn(235);
        }
        if (colDef.filterParams) {
            _warn(236);
        }
    }

    private addHandlerListeners(listener: () => void): void {
        const destroyFunctions = this.addManagedListeners(this.getHandler() as GroupFilterHandler, {
            sourceColumnsChanged: this.updateGroups.bind(this),
            destroyed: () => {
                destroyFunctions.forEach((func) => func());
                // resubscribe
                this.addHandlerListeners(listener);
            },
        });
    }

    private updateGroups(): AgPromise<void> {
        const { sourceColumns, selectedColumn } = this.updateGroupField();
        this.dispatchLocalEvent({
            type: 'columnsChanged',
        });
        return this.getUnderlyingFilters(sourceColumns, selectedColumn);
    }

    private updateGroupField(): { sourceColumns: AgColumn[] | null; selectedColumn?: AgColumn } {
        this.groupColumn = this.params.column as AgColumn;
        const handler = this.getHandler();
        if (!handler) {
            return { sourceColumns: null };
        }
        const { sourceColumns, hasMultipleColumns, selectedColumn } = handler;
        const eGroupField = this.eGroupField;
        _clearElement(eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        if (hasMultipleColumns && sourceColumns) {
            this.createGroupFieldSelectElement(sourceColumns, selectedColumn!);
            eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            eGroupField.appendChild(_createElement({ tag: 'div', cls: 'ag-filter-separator' }));
        }
        _setDisplayed(eGroupField, hasMultipleColumns);
        return { sourceColumns, selectedColumn };
    }

    private createGroupFieldSelectElement(sourceColumns: AgColumn[], selectedColumn: AgColumn): void {
        const eGroupFieldSelect = this.createManagedBean(new AgSelect());
        this.eGroupFieldSelect = eGroupFieldSelect;
        const localeTextFunc = this.getLocaleTextFunc();
        eGroupFieldSelect.setLabel(localeTextFunc('groupFilterSelect', 'Select field:'));
        eGroupFieldSelect.setLabelAlignment('top');
        eGroupFieldSelect.addOptions(
            sourceColumns.map((sourceColumn) => ({
                value: sourceColumn.getColId(),
                text: this.beans.colNames.getDisplayNameForColumn(sourceColumn, 'groupFilter', false) ?? undefined,
            }))
        );
        eGroupFieldSelect.setValue(selectedColumn.getColId());
        eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
        eGroupFieldSelect.addCss('ag-group-filter-field-select-wrapper');
        if (sourceColumns.length === 1) {
            eGroupFieldSelect.setDisabled(true);
        }
    }

    private getUnderlyingFilters(
        sourceColumns: AgColumn[] | null,
        selectedColumn: AgColumn | undefined
    ): AgPromise<void> {
        if (!sourceColumns) {
            this.filterColumnPairs = undefined;
            this.selectedFilter = undefined;
            return AgPromise.resolve();
        }
        const filterPromises: AgPromise<void>[] = [];
        const filterColumnPairs: FilterColumnPair[] = [];
        const colFilter = this.beans.colFilter!;
        sourceColumns.forEach((column) => {
            const filterPromise = colFilter.getOrCreateFilterUi(column);
            if (filterPromise) {
                filterPromises.push(
                    filterPromise.then((filter) => {
                        if (filter) {
                            filterColumnPairs.push({
                                filter,
                                column,
                            });
                        }
                        if (column.getColId() === selectedColumn!.getColId()) {
                            this.selectedFilter = filter ?? undefined;
                        }
                    })
                );
            }
        });
        return AgPromise.all(filterPromises).then(() => {
            this.filterColumnPairs = filterColumnPairs;
        });
    }

    private addUnderlyingFilterElement(selectedColumn: AgColumn | undefined): AgPromise<void> {
        _clearElement(this.eUnderlyingFilter);
        if (!selectedColumn) {
            return AgPromise.resolve();
        }
        const comp = this.createManagedBean(new FilterComp(selectedColumn, 'COLUMN_MENU'));
        this.filterComp = comp;
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
        this.filterComp?.afterGuiDetached();
        this.destroyBean(this.filterComp);
        const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
        const selectedColumn = selectedFilterColumnPair?.column;
        this.selectedFilter = selectedFilterColumnPair?.filter;
        this.getHandler().setSelectedColumn(selectedColumn);

        this.dispatchLocalEvent({
            type: 'columnsChanged',
        });
        this.addUnderlyingFilterElement(selectedColumn);
    }

    public isFilterActive(): boolean {
        return this.groupFilterSvc.isFilterActive(this.groupColumn);
    }

    public doesFilterPass(): boolean {
        return true;
    }

    public getModel(): null {
        return null;
    }

    public setModel(): void {
        // not supported - no model
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.afterGuiAttachedParams = params;
        this.addUnderlyingFilterElement(this.getHandler().selectedColumn);
    }

    public afterGuiDetached(): void {
        _clearElement(this.eUnderlyingFilter);
        this.selectedFilter?.afterGuiDetached?.();
    }

    public getSelectedColumn(): AgColumn | undefined {
        return this.getHandler().selectedColumn;
    }

    private getHandler(): GroupFilterHandler {
        return this.params.getHandler() as GroupFilterHandler;
    }

    private getFilterColumnPair(columnId: string | undefined): FilterColumnPair | undefined {
        if (!columnId) {
            return undefined;
        }
        return this.filterColumnPairs?.find(({ column }) => column.getColId() === columnId);
    }
}
