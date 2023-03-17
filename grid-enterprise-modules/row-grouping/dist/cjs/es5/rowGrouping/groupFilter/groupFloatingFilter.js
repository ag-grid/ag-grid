"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupFloatingFilterComp = void 0;
var core_1 = require("@ag-grid-community/core");
var groupFilter_1 = require("./groupFilter");
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
        return new core_1.AgPromise(function (resolve) {
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
            _this.addManagedListener(_this.parentFilterInstance, groupFilter_1.GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, function () { return _this.onSelectedColumnChanged(); });
            _this.addManagedListener(_this.parentFilterInstance, groupFilter_1.GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.onColumnRowGroupChanged(); });
        });
        ;
    };
    GroupFloatingFilterComp.prototype.setupReadOnlyFloatingFilterElement = function () {
        var _this = this;
        if (!this.eFloatingFilterText) {
            this.eFloatingFilterText = this.createManagedBean(new core_1.AgInputTextField());
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
        core_1._.clearElement(this.eFloatingFilter);
        var column = this.parentFilterInstance.getSelectedColumn();
        // we can only show the underlying filter if there is one instance (e.g. the underlying column is not visible)
        if (column && !column.isVisible()) {
            var compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
            if (compDetails) {
                if (!this.columnVisibleChangedListener) {
                    this.columnVisibleChangedListener = this.addManagedListener(column, core_1.Column.EVENT_VISIBLE_CHANGED, this.onColumnVisibleChanged.bind(this));
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
        return core_1.AgPromise.resolve();
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
        core_1.Autowired('columnModel')
    ], GroupFloatingFilterComp.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('filterManager')
    ], GroupFloatingFilterComp.prototype, "filterManager", void 0);
    __decorate([
        core_1.RefSelector('eFloatingFilter')
    ], GroupFloatingFilterComp.prototype, "eFloatingFilter", void 0);
    return GroupFloatingFilterComp;
}(core_1.Component));
exports.GroupFloatingFilterComp = GroupFloatingFilterComp;
