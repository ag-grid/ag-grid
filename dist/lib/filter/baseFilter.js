/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var DEFAULT_TRANSLATIONS = {
    equals: 'Equals',
    notEqual: 'Not equal',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    inRange: 'In range',
    lessThanOrEqual: 'Less than or equals',
    greaterThanOrEqual: 'Greater than or equals',
    filterOoo: 'Filter...',
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    searchOoo: 'Search...',
    selectAll: 'Select All',
    applyFilter: 'Apply Filter',
    clearFilter: 'Clear Filter'
};
/**
 * T(ype) The type of this filter. ie in DateFilter T=Date
 * P(arams) The params that this filter can take
 * M(model getModel/setModel) The object that this filter serializes to
 * F Floating filter params
 *
 * Contains common logic to ALL filters.. Translation, apply and clear button
 * get/setModel context wiring....
 */
var BaseFilter = (function (_super) {
    __extends(BaseFilter, _super);
    function BaseFilter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.filter = 'equals';
        return _this;
    }
    BaseFilter.prototype.init = function (params) {
        this.filterParams = params;
        this.clearActive = params.clearButton === true;
        //Allowing for old param property apply, even though is not advertised through the interface
        this.applyActive = ((params.applyButton === true) || (params.apply === true));
        this.newRowsActionKeep = params.newRowsAction === 'keep';
        this.setTemplate(this.generateTemplate());
        utils_1._.setVisible(this.eApplyButton, this.applyActive);
        if (this.applyActive) {
            this.addDestroyableEventListener(this.eApplyButton, "click", this.filterParams.filterChangedCallback);
        }
        utils_1._.setVisible(this.eClearButton, this.clearActive);
        if (this.clearActive) {
            this.addDestroyableEventListener(this.eClearButton, "click", this.onClearButton.bind(this));
        }
        var anyButtonVisible = this.applyActive || this.clearActive;
        utils_1._.setVisible(this.eButtonsPanel, anyButtonVisible);
        this.instantiate(this.context);
        this.initialiseFilterBodyUi();
        this.refreshFilterBodyUi();
    };
    BaseFilter.prototype.onClearButton = function () {
        this.setModel(null);
        this.onFilterChanged();
    };
    BaseFilter.prototype.floatingFilter = function (from) {
        if (from !== '') {
            var model = this.modelFromFloatingFilter(from);
            this.setModel(model);
        }
        else {
            this.resetState();
        }
        this.onFilterChanged();
    };
    BaseFilter.prototype.onNewRowsLoaded = function () {
        if (!this.newRowsActionKeep) {
            this.resetState();
        }
    };
    BaseFilter.prototype.getModel = function () {
        if (this.isFilterActive()) {
            return this.serialize();
        }
        else {
            return null;
        }
    };
    BaseFilter.prototype.getNullableModel = function () {
        return this.serialize();
    };
    BaseFilter.prototype.setModel = function (model) {
        if (model) {
            this.parse(model);
        }
        else {
            this.resetState();
        }
        this.refreshFilterBodyUi();
    };
    BaseFilter.prototype.doOnFilterChanged = function (applyNow) {
        if (applyNow === void 0) { applyNow = false; }
        this.filterParams.filterModifiedCallback();
        var requiresApplyAndIsApplying = this.applyActive && applyNow;
        var notRequiresApply = !this.applyActive;
        var shouldFilter = notRequiresApply || requiresApplyAndIsApplying;
        if (shouldFilter) {
            this.filterParams.filterChangedCallback();
        }
        this.refreshFilterBodyUi();
    };
    BaseFilter.prototype.onFilterChanged = function () {
        this.doOnFilterChanged();
    };
    BaseFilter.prototype.onFloatingFilterChanged = function (change) {
        //It has to be of the type FloatingFilterWithApplyChange if it gets here
        var casted = change;
        this.setModel(casted.model);
        this.doOnFilterChanged(casted.apply);
    };
    BaseFilter.prototype.generateFilterHeader = function () {
        return '';
    };
    BaseFilter.prototype.generateTemplate = function () {
        var translate = this.translate.bind(this);
        var body = this.bodyTemplate();
        return "<div>\n                    " + this.generateFilterHeader() + "\n                    " + body + "\n                    <div class=\"ag-filter-apply-panel\" id=\"applyPanel\">\n                        <button type=\"button\" id=\"clearButton\">" + translate('clearFilter') + "</button>\n                        <button type=\"button\" id=\"applyButton\">" + translate('applyFilter') + "</button>\n                    </div>\n                </div>";
    };
    BaseFilter.prototype.translate = function (toTranslate) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(toTranslate, DEFAULT_TRANSLATIONS[toTranslate]);
    };
    return BaseFilter;
}(component_1.Component));
BaseFilter.EQUALS = 'equals';
BaseFilter.NOT_EQUAL = 'notEqual';
BaseFilter.LESS_THAN = 'lessThan';
BaseFilter.LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
BaseFilter.GREATER_THAN = 'greaterThan';
BaseFilter.GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
BaseFilter.IN_RANGE = 'inRange';
BaseFilter.CONTAINS = 'contains'; //1;
BaseFilter.NOT_CONTAINS = 'notContains'; //1;
BaseFilter.STARTS_WITH = 'startsWith'; //4;
BaseFilter.ENDS_WITH = 'endsWith'; //5;
__decorate([
    componentAnnotations_1.QuerySelector('#applyPanel'),
    __metadata("design:type", HTMLElement)
], BaseFilter.prototype, "eButtonsPanel", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#applyButton'),
    __metadata("design:type", HTMLElement)
], BaseFilter.prototype, "eApplyButton", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#clearButton'),
    __metadata("design:type", HTMLElement)
], BaseFilter.prototype, "eClearButton", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], BaseFilter.prototype, "context", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], BaseFilter.prototype, "gridOptionsWrapper", void 0);
exports.BaseFilter = BaseFilter;
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
var ComparableBaseFilter = (function (_super) {
    __extends(ComparableBaseFilter, _super);
    function ComparableBaseFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComparableBaseFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.addDestroyableEventListener(this.eTypeSelector, "change", this.onFilterTypeChanged.bind(this));
    };
    ComparableBaseFilter.prototype.generateFilterHeader = function () {
        var _this = this;
        var optionsHtml = this.getApplicableFilterTypes().map(function (filterType) {
            var localeFilterName = _this.translate(filterType);
            return "<option value=\"" + filterType + "\">" + localeFilterName + "</option>";
        });
        return optionsHtml.length <= 0 ?
            '' :
            "<div>\n                <select class=\"ag-filter-select\" id=\"filterType\">\n                    " + optionsHtml.join('') + "\n                </select>\n            </div>";
    };
    ComparableBaseFilter.prototype.onFilterTypeChanged = function () {
        this.filter = this.eTypeSelector.value;
        this.refreshFilterBodyUi();
        this.onFilterChanged();
    };
    ComparableBaseFilter.prototype.isFilterActive = function () {
        var rawFilterValues = this.filterValues();
        if (this.filter === BaseFilter.IN_RANGE) {
            var filterValueArray = rawFilterValues;
            return filterValueArray[0] != null && filterValueArray[1] != null;
        }
        else {
            return rawFilterValues != null;
        }
    };
    ComparableBaseFilter.prototype.setFilterType = function (filterType) {
        this.filter = filterType;
        this.eTypeSelector.value = filterType;
    };
    return ComparableBaseFilter;
}(BaseFilter));
__decorate([
    componentAnnotations_1.QuerySelector('#filterType'),
    __metadata("design:type", HTMLSelectElement)
], ComparableBaseFilter.prototype, "eTypeSelector", void 0);
exports.ComparableBaseFilter = ComparableBaseFilter;
/**
 * Comparable filter with scalar underlying values (ie numbers and dates. Strings are not scalar so have to extend
 * ComparableBaseFilter)
 */
var ScalarBaseFilter = (function (_super) {
    __extends(ScalarBaseFilter, _super);
    function ScalarBaseFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScalarBaseFilter.prototype.doesFilterPass = function (params) {
        var value = this.filterParams.valueGetter(params.node);
        var comparator = this.comparator();
        var rawFilterValues = this.filterValues();
        var from = Array.isArray(rawFilterValues) ? rawFilterValues[0] : rawFilterValues;
        if (!from)
            return true;
        var compareResult = comparator(from, value);
        if (this.filter === BaseFilter.EQUALS) {
            return compareResult === 0;
        }
        if (this.filter === BaseFilter.GREATER_THAN) {
            return compareResult > 0;
        }
        if (this.filter === BaseFilter.GREATER_THAN_OR_EQUAL) {
            return compareResult >= 0;
        }
        if (this.filter === BaseFilter.LESS_THAN_OR_EQUAL) {
            return compareResult <= 0;
        }
        if (this.filter === BaseFilter.LESS_THAN) {
            return compareResult < 0;
        }
        if (this.filter === BaseFilter.NOT_EQUAL) {
            return compareResult != 0;
        }
        //From now on the type is a range and rawFilterValues must be an array!
        var compareToResult = comparator(rawFilterValues[1], value);
        if (this.filter === BaseFilter.IN_RANGE) {
            if (!this.filterParams.inRangeInclusive) {
                return compareResult > 0 && compareToResult < 0;
            }
            else {
                return compareResult >= 0 && compareToResult <= 0;
            }
        }
        throw new Error('Unexpected type of date filter!: ' + this.filter);
    };
    return ScalarBaseFilter;
}(ComparableBaseFilter));
exports.ScalarBaseFilter = ScalarBaseFilter;
