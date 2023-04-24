var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgPromise, AgSelect, Autowired, Events, PostConstruct, RefSelector, TabGuardComp, } from '@ag-grid-community/core';
var GroupFilter = /** @class */ (function (_super) {
    __extends(GroupFilter, _super);
    function GroupFilter() {
        return _super.call(this, /* html */ "\n            <div class=\"ag-group-filter\">\n                <div ref=\"eGroupField\"></div>\n                <div ref=\"eUnderlyingFilter\"></div>\n            </div>\n        ") || this;
    }
    GroupFilter.prototype.postConstruct = function () {
        this.initialiseTabGuard({});
    };
    GroupFilter.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        this.validateParams();
        return this.updateGroups().then(function () {
            _this.addManagedListener(_this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.onColumnRowGroupChanged(); });
        });
    };
    GroupFilter.prototype.validateParams = function () {
        var colDef = this.params.colDef;
        if (colDef.field) {
            _.doOnce(function () { return console.warn('AG Grid: Group Column Filter does not work with the colDef property "field". This property will be ignored.'); }, 'groupFilterFieldParam');
        }
        if (colDef.filterValueGetter) {
            _.doOnce(function () { return console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'); }, 'groupFilterFilterValueGetterParam');
        }
        if (colDef.filterParams) {
            _.doOnce(function () { return console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'); }, 'groupFilterFilterParams');
        }
    };
    GroupFilter.prototype.updateGroups = function () {
        var sourceColumns = this.updateGroupField();
        return this.getUnderlyingFilters(sourceColumns);
    };
    GroupFilter.prototype.getSourceColumns = function () {
        this.groupColumn = this.params.column;
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(function () { return console.warn('AG Grid: Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'); }, 'groupFilterTreeData');
            return [];
        }
        var sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.groupColumn);
        if (!sourceColumns) {
            _.doOnce(function () { return console.warn('AG Grid: Group Column Filter only works on group columns. Please use a different filter.'); }, 'groupFilterNotGroupColumn');
            return [];
        }
        return sourceColumns;
    };
    GroupFilter.prototype.updateGroupField = function () {
        var _this = this;
        _.clearElement(this.eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        var allSourceColumns = this.getSourceColumns();
        var sourceColumns = allSourceColumns.filter(function (sourceColumn) { return sourceColumn.isFilterAllowed(); });
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
            if (!this.selectedColumn || !sourceColumns.some(function (column) { return column.getId() === _this.selectedColumn.getId(); })) {
                this.selectedColumn = sourceColumns[0];
            }
            this.createGroupFieldSelectElement(sourceColumns);
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(_.loadTemplate(/* html */ "<div class=\"ag-filter-separator\"></div>"));
            _.setDisplayed(this.eGroupField, true);
        }
        return sourceColumns;
    };
    GroupFilter.prototype.createGroupFieldSelectElement = function (sourceColumns) {
        var _this = this;
        this.eGroupFieldSelect = this.createManagedBean(new AgSelect());
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eGroupFieldSelect.setLabel(localeTextFunc('groupFilterSelect', 'Select field:'));
        this.eGroupFieldSelect.setLabelAlignment('top');
        this.eGroupFieldSelect.addOptions(sourceColumns.map(function (sourceColumn) {
            var _a;
            return ({
                value: sourceColumn.getId(),
                text: (_a = _this.columnModel.getDisplayNameForColumn(sourceColumn, 'groupFilter', false)) !== null && _a !== void 0 ? _a : undefined
            });
        }));
        this.eGroupFieldSelect.setValue(this.selectedColumn.getId());
        this.eGroupFieldSelect.onValueChange(function (newValue) { return _this.updateSelectedColumn(newValue); });
        this.eGroupFieldSelect.addCssClass('ag-group-filter-field-select-wrapper');
        if (sourceColumns.length === 1) {
            this.eGroupFieldSelect.setDisabled(true);
        }
    };
    GroupFilter.prototype.getUnderlyingFilters = function (sourceColumns) {
        var _this = this;
        if (!sourceColumns) {
            this.filterColumnPairs = undefined;
            this.selectedFilter = undefined;
            this.groupColumn.setFilterActive(false, 'columnRowGroupChanged');
            return AgPromise.resolve();
        }
        var filterPromises = [];
        var filterColumnPairs = [];
        sourceColumns.forEach(function (column) {
            var filterWrapper = _this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
            if (filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) {
                filterPromises.push(filterWrapper.filterPromise.then(function (filter) {
                    if (filter) {
                        filterColumnPairs.push({
                            filter: filter,
                            column: column
                        });
                    }
                    if (column.getId() === _this.selectedColumn.getId()) {
                        _this.selectedFilter = filter !== null && filter !== void 0 ? filter : undefined;
                    }
                    return filter;
                }));
            }
        });
        return AgPromise.all(filterPromises).then(function () {
            _this.filterColumnPairs = filterColumnPairs;
            _this.groupColumn.setFilterActive(_this.isFilterActive(), 'columnRowGroupChanged');
        });
    };
    GroupFilter.prototype.addUnderlyingFilterElement = function () {
        var _this = this;
        _.clearElement(this.eUnderlyingFilter);
        if (!this.selectedColumn) {
            return AgPromise.resolve();
        }
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.selectedColumn, 'COLUMN_MENU');
        if (!filterWrapper) {
            return AgPromise.resolve();
        }
        return filterWrapper.guiPromise.then(function (gui) {
            var _a;
            _this.eUnderlyingFilter.appendChild(gui);
            (_a = filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(function (filter) {
                var _a, _b;
                (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiAttached) === null || _a === void 0 ? void 0 : _a.call(filter, _this.afterGuiAttachedParams);
                if (!((_b = _this.afterGuiAttachedParams) === null || _b === void 0 ? void 0 : _b.suppressFocus) && _this.eGroupFieldSelect && !_this.eGroupFieldSelect.isDisabled()) {
                    _this.eGroupFieldSelect.getFocusableElement().focus();
                }
            });
        });
    };
    GroupFilter.prototype.updateSelectedColumn = function (columnId) {
        var _a, _b;
        if (!columnId) {
            return;
        }
        (_b = (_a = this.selectedFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
        var selectedFilterColumnPair = this.getFilterColumnPair(columnId);
        this.selectedColumn = selectedFilterColumnPair === null || selectedFilterColumnPair === void 0 ? void 0 : selectedFilterColumnPair.column;
        this.selectedFilter = selectedFilterColumnPair === null || selectedFilterColumnPair === void 0 ? void 0 : selectedFilterColumnPair.filter;
        this.dispatchEvent({
            type: GroupFilter.EVENT_SELECTED_COLUMN_CHANGED
        });
        this.addUnderlyingFilterElement();
    };
    GroupFilter.prototype.isFilterActive = function () {
        var _a;
        return !!((_a = this.filterColumnPairs) === null || _a === void 0 ? void 0 : _a.some(function (_a) {
            var filter = _a.filter;
            return filter.isFilterActive();
        }));
    };
    GroupFilter.prototype.doesFilterPass = function () {
        return true;
    };
    GroupFilter.prototype.getModel = function () {
        return null;
    };
    GroupFilter.prototype.setModel = function () {
        return AgPromise.resolve();
    };
    GroupFilter.prototype.afterGuiAttached = function (params) {
        this.afterGuiAttachedParams = params;
        this.addUnderlyingFilterElement();
    };
    GroupFilter.prototype.afterGuiDetached = function () {
        var _a, _b;
        _.clearElement(this.eUnderlyingFilter);
        (_b = (_a = this.selectedFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    GroupFilter.prototype.onColumnRowGroupChanged = function () {
        var _this = this;
        this.updateGroups().then(function () {
            _this.dispatchEvent({
                type: GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED
            });
            _this.eventService.dispatchEvent({
                type: 'filterAllowedUpdated'
            });
        });
    };
    GroupFilter.prototype.getFilterColumnPair = function (columnId) {
        var _a;
        if (!columnId) {
            return undefined;
        }
        return (_a = this.filterColumnPairs) === null || _a === void 0 ? void 0 : _a.find(function (_a) {
            var column = _a.column;
            return column.getId() === columnId;
        });
    };
    GroupFilter.prototype.getSelectedFilter = function () {
        return this.selectedFilter;
    };
    GroupFilter.prototype.getSelectedColumn = function () {
        return this.selectedColumn;
    };
    GroupFilter.prototype.isFilterAllowed = function () {
        return !!this.selectedColumn;
    };
    GroupFilter.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
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
    return GroupFilter;
}(TabGuardComp));
export { GroupFilter };
