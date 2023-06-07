var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcm93R3JvdXBpbmcvZ3JvdXBGaWx0ZXIvZ3JvdXBGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFHVCxNQUFNLEVBS04sYUFBYSxFQUNiLFdBQVcsRUFDWCxZQUFZLEdBQ2YsTUFBTSx5QkFBeUIsQ0FBQztBQU9qQztJQUFpQywrQkFBWTtJQWtCekM7ZUFDSSxrQkFBTSxVQUFVLENBQUMscUxBS2hCLENBQUM7SUFDTixDQUFDO0lBR08sbUNBQWEsR0FBckI7UUFDSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLDBCQUFJLEdBQVgsVUFBWSxNQUFxQjtRQUFqQyxpQkFNQztRQUxHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDNUIsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDhCQUE4QixFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsdUJBQXVCLEVBQUUsRUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1FBQzVILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLG9DQUFjLEdBQXRCO1FBQ1ksSUFBQSxNQUFNLEdBQUssSUFBSSxDQUFDLE1BQU0sT0FBaEIsQ0FBaUI7UUFDL0IsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FDdkIsNkdBQTZHLENBQ2hILEVBRmMsQ0FFZCxF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