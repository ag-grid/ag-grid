var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgPromise, AgSelect, Autowired, Events, PostConstruct, RefSelector, TabGuardComp, } from '@ag-grid-community/core';
export class GroupFilter extends TabGuardComp {
    constructor() {
        super(/* html */ `
            <div class="ag-group-filter">
                <div ref="eGroupField"></div>
                <div ref="eUnderlyingFilter"></div>
            </div>
        `);
    }
    postConstruct() {
        this.initialiseTabGuard({});
    }
    init(params) {
        this.params = params;
        this.validateParams();
        return this.updateGroups().then(() => {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
        });
    }
    validateParams() {
        const { colDef } = this.params;
        if (colDef.field) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "field". This property will be ignored.'), 'groupFilterFieldParam');
        }
        if (colDef.filterValueGetter) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'), 'groupFilterFilterValueGetterParam');
        }
        if (colDef.filterParams) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'), 'groupFilterFilterParams');
        }
    }
    updateGroups() {
        const sourceColumns = this.updateGroupField();
        return this.getUnderlyingFilters(sourceColumns);
    }
    getSourceColumns() {
        this.groupColumn = this.params.column;
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'), 'groupFilterTreeData');
            return [];
        }
        const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.groupColumn);
        if (!sourceColumns) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter only works on group columns. Please use a different filter.'), 'groupFilterNotGroupColumn');
            return [];
        }
        return sourceColumns;
    }
    updateGroupField() {
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
        }
        else {
            // keep the old selected column if it's still valid
            if (!this.selectedColumn || !sourceColumns.some(column => column.getId() === this.selectedColumn.getId())) {
                this.selectedColumn = sourceColumns[0];
            }
            this.createGroupFieldSelectElement(sourceColumns);
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(_.loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            _.setDisplayed(this.eGroupField, true);
        }
        return sourceColumns;
    }
    createGroupFieldSelectElement(sourceColumns) {
        this.eGroupFieldSelect = this.createManagedBean(new AgSelect());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eGroupFieldSelect.setLabel(localeTextFunc('groupFilterSelect', 'Select field:'));
        this.eGroupFieldSelect.setLabelAlignment('top');
        this.eGroupFieldSelect.addOptions(sourceColumns.map(sourceColumn => {
            var _a;
            return ({
                value: sourceColumn.getId(),
                text: (_a = this.columnModel.getDisplayNameForColumn(sourceColumn, 'groupFilter', false)) !== null && _a !== void 0 ? _a : undefined
            });
        }));
        this.eGroupFieldSelect.setValue(this.selectedColumn.getId());
        this.eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
        this.eGroupFieldSelect.addCssClass('ag-group-filter-field-select-wrapper');
        if (sourceColumns.length === 1) {
            this.eGroupFieldSelect.setDisabled(true);
        }
    }
    getUnderlyingFilters(sourceColumns) {
        if (!sourceColumns) {
            this.filterColumnPairs = undefined;
            this.selectedFilter = undefined;
            this.groupColumn.setFilterActive(false, 'columnRowGroupChanged');
            return AgPromise.resolve();
        }
        const filterPromises = [];
        const filterColumnPairs = [];
        sourceColumns.forEach(column => {
            const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
            if (filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) {
                filterPromises.push(filterWrapper.filterPromise.then(filter => {
                    if (filter) {
                        filterColumnPairs.push({
                            filter,
                            column
                        });
                    }
                    if (column.getId() === this.selectedColumn.getId()) {
                        this.selectedFilter = filter !== null && filter !== void 0 ? filter : undefined;
                    }
                    return filter;
                }));
            }
        });
        return AgPromise.all(filterPromises).then(() => {
            this.filterColumnPairs = filterColumnPairs;
            this.groupColumn.setFilterActive(this.isFilterActive(), 'columnRowGroupChanged');
        });
    }
    addUnderlyingFilterElement() {
        _.clearElement(this.eUnderlyingFilter);
        if (!this.selectedColumn) {
            return AgPromise.resolve();
        }
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.selectedColumn, 'COLUMN_MENU');
        if (!filterWrapper) {
            return AgPromise.resolve();
        }
        return filterWrapper.guiPromise.then(gui => {
            var _a;
            this.eUnderlyingFilter.appendChild(gui);
            (_a = filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(filter => {
                var _a, _b;
                (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiAttached) === null || _a === void 0 ? void 0 : _a.call(filter, this.afterGuiAttachedParams);
                if (!((_b = this.afterGuiAttachedParams) === null || _b === void 0 ? void 0 : _b.suppressFocus) && this.eGroupFieldSelect && !this.eGroupFieldSelect.isDisabled()) {
                    this.eGroupFieldSelect.getFocusableElement().focus();
                }
            });
        });
    }
    updateSelectedColumn(columnId) {
        var _a, _b;
        if (!columnId) {
            return;
        }
        (_b = (_a = this.selectedFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
        const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
        this.selectedColumn = selectedFilterColumnPair === null || selectedFilterColumnPair === void 0 ? void 0 : selectedFilterColumnPair.column;
        this.selectedFilter = selectedFilterColumnPair === null || selectedFilterColumnPair === void 0 ? void 0 : selectedFilterColumnPair.filter;
        this.dispatchEvent({
            type: GroupFilter.EVENT_SELECTED_COLUMN_CHANGED
        });
        this.addUnderlyingFilterElement();
    }
    isFilterActive() {
        var _a;
        return !!((_a = this.filterColumnPairs) === null || _a === void 0 ? void 0 : _a.some(({ filter }) => filter.isFilterActive()));
    }
    doesFilterPass() {
        return true;
    }
    getModel() {
        return null;
    }
    setModel() {
        return AgPromise.resolve();
    }
    afterGuiAttached(params) {
        this.afterGuiAttachedParams = params;
        this.addUnderlyingFilterElement();
    }
    afterGuiDetached() {
        var _a, _b;
        _.clearElement(this.eUnderlyingFilter);
        (_b = (_a = this.selectedFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    onColumnRowGroupChanged() {
        this.updateGroups().then(() => {
            this.dispatchEvent({
                type: GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED
            });
            this.eventService.dispatchEvent({
                type: 'filterAllowedUpdated'
            });
        });
    }
    getFilterColumnPair(columnId) {
        var _a;
        if (!columnId) {
            return undefined;
        }
        return (_a = this.filterColumnPairs) === null || _a === void 0 ? void 0 : _a.find(({ column }) => column.getId() === columnId);
    }
    getSelectedFilter() {
        return this.selectedFilter;
    }
    getSelectedColumn() {
        return this.selectedColumn;
    }
    isFilterAllowed() {
        return !!this.selectedColumn;
    }
    destroy() {
        super.destroy();
    }
}
GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
GroupFilter.EVENT_SELECTED_COLUMN_CHANGED = 'selectedColumnChanged';
__decorate([
    Autowired('filterManager')
], GroupFilter.prototype, "filterManager", void 0);
__decorate([
    Autowired('columnModel')
], GroupFilter.prototype, "columnModel", void 0);
__decorate([
    RefSelector('eGroupField')
], GroupFilter.prototype, "eGroupField", void 0);
__decorate([
    RefSelector('eUnderlyingFilter')
], GroupFilter.prototype, "eUnderlyingFilter", void 0);
__decorate([
    PostConstruct
], GroupFilter.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcm93R3JvdXBpbmcvZ3JvdXBGaWx0ZXIvZ3JvdXBGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFHVCxNQUFNLEVBS04sYUFBYSxFQUNiLFdBQVcsRUFDWCxZQUFZLEdBQ2YsTUFBTSx5QkFBeUIsQ0FBQztBQU9qQyxNQUFNLE9BQU8sV0FBWSxTQUFRLFlBQVk7SUFrQnpDO1FBQ0ksS0FBSyxDQUFDLFVBQVUsQ0FBQzs7Ozs7U0FLaEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdPLGFBQWE7UUFDakIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxJQUFJLENBQUMsTUFBcUI7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDakMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7UUFDNUgsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sY0FBYztRQUNsQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZCxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ3ZCLDZHQUE2RyxDQUNoSCxFQUFFLHVCQUF1QixDQUFDLENB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