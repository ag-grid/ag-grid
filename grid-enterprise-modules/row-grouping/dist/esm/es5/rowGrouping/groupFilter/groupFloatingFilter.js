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
import { _, AgInputTextField, AgPromise, Autowired, Column, Component, RefSelector, } from '@ag-grid-community/core';
import { GroupFilter } from './groupFilter';
var GroupFloatingFilterComp = /** @class */ (function (_super) {
    __extends(GroupFloatingFilterComp, _super);
    function GroupFloatingFilterComp() {
        return _super.call(this, /* html */ "\n            <div ref=\"eFloatingFilter\" class=\"ag-group-floating-filter ag-floating-filter-input\" role=\"presentation\"></div>\n        ") || this;
    }
    GroupFloatingFilterComp.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        // we only support showing the underlying floating filter for multiple group columns
        var canShowUnderlyingFloatingFilter = this.gridOptionsService.get('groupDisplayType') === 'multipleColumns';
        return new AgPromise(function (resolve) {
            _this.params.parentFilterInstance(function (parentFilterInstance) {
                _this.parentFilterInstance = parentFilterInstance;
                if (canShowUnderlyingFloatingFilter) {
                    _this.setupUnderlyingFloatingFilterElement().then(function () { return resolve(); });
                }
                else {
                    _this.setupReadOnlyFloatingFilterElement();
                    resolve();
                }
            });
        }).then(function () {
            _this.addManagedListener(_this.parentFilterInstance, GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, function () { return _this.onSelectedColumnChanged(); });
            _this.addManagedListener(_this.parentFilterInstance, GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.onColumnRowGroupChanged(); });
        });
        ;
    };
    GroupFloatingFilterComp.prototype.setupReadOnlyFloatingFilterElement = function () {
        var _this = this;
        if (!this.eFloatingFilterText) {
            this.eFloatingFilterText = this.createManagedBean(new AgInputTextField());
            var displayName = this.columnModel.getDisplayNameForColumn(this.params.column, 'header', true);
            var translate = this.localeService.getLocaleTextFunc();
            this.eFloatingFilterText
                .setDisabled(true)
                .setInputAriaLabel(displayName + " " + translate('ariaFilterInput', 'Filter Input'))
                .addGuiEventListener('click', function () { return _this.params.showParentFilter(); });
        }
        this.updateDisplayedValue();
        this.eFloatingFilter.appendChild(this.eFloatingFilterText.getGui());
    };
    GroupFloatingFilterComp.prototype.setupUnderlyingFloatingFilterElement = function () {
        var _this = this;
        this.showingUnderlyingFloatingFilter = false;
        this.underlyingFloatingFilter = undefined;
        _.clearElement(this.eFloatingFilter);
        var column = this.parentFilterInstance.getSelectedColumn();
        // we can only show the underlying filter if there is one instance (e.g. the underlying column is not visible)
        if (column && !column.isVisible()) {
            var compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
            if (compDetails) {
                if (!this.columnVisibleChangedListener) {
                    this.columnVisibleChangedListener = this.addManagedListener(column, Column.EVENT_VISIBLE_CHANGED, this.onColumnVisibleChanged.bind(this));
                }
                return compDetails.newAgStackInstance().then(function (floatingFilter) {
                    var _a, _b;
                    _this.underlyingFloatingFilter = floatingFilter;
                    (_a = _this.underlyingFloatingFilter) === null || _a === void 0 ? void 0 : _a.onParentModelChanged((_b = _this.parentFilterInstance.getSelectedFilter()) === null || _b === void 0 ? void 0 : _b.getModel());
                    _this.appendChild(floatingFilter.getGui());
                    _this.showingUnderlyingFloatingFilter = true;
                });
            }
        }
        // fallback to the read-only version
        this.setupReadOnlyFloatingFilterElement();
        return AgPromise.resolve();
    };
    GroupFloatingFilterComp.prototype.onColumnVisibleChanged = function () {
        this.setupUnderlyingFloatingFilterElement();
    };
    GroupFloatingFilterComp.prototype.onParentModelChanged = function (_model, event) {
        var _a, _b;
        if (this.showingUnderlyingFloatingFilter) {
            (_a = this.underlyingFloatingFilter) === null || _a === void 0 ? void 0 : _a.onParentModelChanged((_b = this.parentFilterInstance.getSelectedFilter()) === null || _b === void 0 ? void 0 : _b.getModel(), event);
        }
        else {
            this.updateDisplayedValue();
        }
    };
    GroupFloatingFilterComp.prototype.updateDisplayedValue = function () {
        if (!this.parentFilterInstance || !this.eFloatingFilterText) {
            return;
        }
        var selectedFilter = this.parentFilterInstance.getSelectedFilter();
        if (!selectedFilter) {
            this.eFloatingFilterText.setValue('');
            this.eFloatingFilterText.setDisplayed(false);
            return;
        }
        this.eFloatingFilterText.setDisplayed(true);
        if (selectedFilter.getModelAsString) {
            var filterModel = selectedFilter.getModel();
            this.eFloatingFilterText.setValue(filterModel == null ? '' : selectedFilter.getModelAsString(filterModel));
        }
        else {
            this.eFloatingFilterText.setValue('');
        }
    };
    GroupFloatingFilterComp.prototype.onSelectedColumnChanged = function () {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    };
    GroupFloatingFilterComp.prototype.onColumnRowGroupChanged = function () {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    };
    GroupFloatingFilterComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('columnModel')
    ], GroupFloatingFilterComp.prototype, "columnModel", void 0);
    __decorate([
        Autowired('filterManager')
    ], GroupFloatingFilterComp.prototype, "filterManager", void 0);
    __decorate([
        RefSelector('eFloatingFilter')
    ], GroupFloatingFilterComp.prototype, "eFloatingFilter", void 0);
    return GroupFloatingFilterComp;
}(Component));
export { GroupFloatingFilterComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBGbG9hdGluZ0ZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9ncm91cEZpbHRlci9ncm91cEZsb2F0aW5nRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsZ0JBQWdCLEVBQ2hCLFNBQVMsRUFDVCxTQUFTLEVBRVQsTUFBTSxFQUNOLFNBQVMsRUFLVCxXQUFXLEdBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVDO0lBQTZDLDJDQUFTO0lBYWxEO2VBQ0ksa0JBQU0sVUFBVSxDQUFDLCtJQUVoQixDQUFDO0lBQ04sQ0FBQztJQUVNLHNDQUFJLEdBQVgsVUFBWSxNQUEwQztRQUF0RCxpQkFxQkM7UUFwQkcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsb0ZBQW9GO1FBQ3BGLElBQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLGlCQUFpQixDQUFDO1FBRTlHLE9BQU8sSUFBSSxTQUFTLENBQU8sVUFBQSxPQUFPO1lBQzlCLEtBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBQSxvQkFBb0I7Z0JBQ2pELEtBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztnQkFFakQsSUFBSSwrQkFBK0IsRUFBRTtvQkFDakMsS0FBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQU0sT0FBQSxPQUFPLEVBQUUsRUFBVCxDQUFTLENBQUMsQ0FBQztpQkFDckU7cUJBQU07b0JBQ0gsS0FBSSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7b0JBQzFDLE9BQU8sRUFBRSxDQUFDO2lCQUNiO1lBQ0wsQ0FBQyxDQUFDLENBQUM7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