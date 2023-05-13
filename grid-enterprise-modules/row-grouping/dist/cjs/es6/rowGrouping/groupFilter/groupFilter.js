"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupFilter = void 0;
const core_1 = require("@ag-grid-community/core");
class GroupFilter extends core_1.TabGuardComp {
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
            this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
        });
    }
    validateParams() {
        const { colDef } = this.params;
        if (colDef.field) {
            core_1._.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "field". This property will be ignored.'), 'groupFilterFieldParam');
        }
        if (colDef.filterValueGetter) {
            core_1._.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'), 'groupFilterFilterValueGetterParam');
        }
        if (colDef.filterParams) {
            core_1._.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'), 'groupFilterFilterParams');
        }
    }
    updateGroups() {
        const sourceColumns = this.updateGroupField();
        return this.getUnderlyingFilters(sourceColumns);
    }
    getSourceColumns() {
        this.groupColumn = this.params.column;
        if (this.gridOptionsService.is('treeData')) {
            core_1._.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'), 'groupFilterTreeData');
            return [];
        }
        const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.groupColumn);
        if (!sourceColumns) {
            core_1._.doOnce(() => console.warn('AG Grid: Group Column Filter only works on group columns. Please use a different filter.'), 'groupFilterNotGroupColumn');
            return [];
        }
        return sourceColumns;
    }
    updateGroupField() {
        core_1._.clearElement(this.eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        const allSourceColumns = this.getSourceColumns();
        const sourceColumns = allSourceColumns.filter(sourceColumn => sourceColumn.isFilterAllowed());
        if (!sourceColumns.length) {
            this.selectedColumn = undefined;
            core_1._.setDisplayed(this.eGroupField, false);
            return null;
        }
        if (allSourceColumns.length === 1) {
            // we only want to hide the group field element if there's only one group column.
            // If there's one group column that has a filter, but multiple columns in total,
            // we should still show the select so the user knows which column it's for.
            this.selectedColumn = sourceColumns[0];
            core_1._.setDisplayed(this.eGroupField, false);
        }
        else {
            // keep the old selected column if it's still valid
            if (!this.selectedColumn || !sourceColumns.some(column => column.getId() === this.selectedColumn.getId())) {
                this.selectedColumn = sourceColumns[0];
            }
            this.createGroupFieldSelectElement(sourceColumns);
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(core_1._.loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            core_1._.setDisplayed(this.eGroupField, true);
        }
        return sourceColumns;
    }
    createGroupFieldSelectElement(sourceColumns) {
        this.eGroupFieldSelect = this.createManagedBean(new core_1.AgSelect());
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
            return core_1.AgPromise.resolve();
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
        return core_1.AgPromise.all(filterPromises).then(() => {
            this.filterColumnPairs = filterColumnPairs;
            this.groupColumn.setFilterActive(this.isFilterActive(), 'columnRowGroupChanged');
        });
    }
    addUnderlyingFilterElement() {
        core_1._.clearElement(this.eUnderlyingFilter);
        if (!this.selectedColumn) {
            return core_1.AgPromise.resolve();
        }
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.selectedColumn, 'COLUMN_MENU');
        if (!filterWrapper) {
            return core_1.AgPromise.resolve();
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
        return core_1.AgPromise.resolve();
    }
    afterGuiAttached(params) {
        this.afterGuiAttachedParams = params;
        this.addUnderlyingFilterElement();
    }
    afterGuiDetached() {
        var _a, _b;
        core_1._.clearElement(this.eUnderlyingFilter);
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
    core_1.Autowired('filterManager')
], GroupFilter.prototype, "filterManager", void 0);
__decorate([
    core_1.Autowired('columnModel')
], GroupFilter.prototype, "columnModel", void 0);
__decorate([
    core_1.RefSelector('eGroupField')
], GroupFilter.prototype, "eGroupField", void 0);
__decorate([
    core_1.RefSelector('eUnderlyingFilter')
], GroupFilter.prototype, "eUnderlyingFilter", void 0);
__decorate([
    core_1.PostConstruct
], GroupFilter.prototype, "postConstruct", null);
exports.GroupFilter = GroupFilter;
