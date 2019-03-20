/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v20.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var FilterConditionType;
(function (FilterConditionType) {
    FilterConditionType[FilterConditionType["MAIN"] = 0] = "MAIN";
    FilterConditionType[FilterConditionType["CONDITION"] = 1] = "CONDITION";
})(FilterConditionType = exports.FilterConditionType || (exports.FilterConditionType = {}));
var DEFAULT_TRANSLATIONS = {
    loadingOoo: 'Loading...',
    empty: 'Choose One',
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
    clearFilter: 'Clear Filter',
    andCondition: 'AND',
    orCondition: 'OR'
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
var BaseFilter = /** @class */ (function (_super) {
    __extends(BaseFilter, _super);
    function BaseFilter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.customFilterOptions = {};
        return _this;
    }
    BaseFilter.prototype.init = function (params) {
        var _this = this;
        this.filterParams = params;
        this.defaultFilter = this.filterParams.defaultOption;
        // strip out incorrectly defined FilterOptionDefs
        if (params.filterOptions) {
            params.filterOptions.forEach(function (filterOption) {
                if (typeof filterOption === 'string') {
                    return;
                }
                if (!filterOption.displayKey) {
                    console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayKey'");
                    return;
                }
                if (!filterOption.displayName) {
                    console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayName'");
                    return;
                }
                if (!filterOption.test) {
                    console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'test'");
                    return;
                }
                _this.customFilterOptions[filterOption.displayKey] = filterOption;
            });
        }
        if (this.filterParams.filterOptions && !this.defaultFilter) {
            var firstFilterOption = this.filterParams.filterOptions[0];
            if (typeof firstFilterOption === 'string') {
                this.defaultFilter = firstFilterOption;
            }
            else if (firstFilterOption.displayKey) {
                this.defaultFilter = firstFilterOption.displayKey;
            }
            else {
                console.warn("ag-Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'");
            }
        }
        this.customInit();
        this.selectedFilter = this.defaultFilter;
        this.selectedFilterCondition = this.defaultFilter;
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
        this.initialiseFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
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
            if (!this.isFilterConditionActive(FilterConditionType.CONDITION)) {
                return this.serialize(FilterConditionType.MAIN);
            }
            else {
                return {
                    condition1: this.serialize(FilterConditionType.MAIN),
                    condition2: this.serialize(FilterConditionType.CONDITION),
                    operator: this.conditionValue
                };
            }
        }
        else {
            return null;
        }
    };
    BaseFilter.prototype.getNullableModel = function () {
        if (!this.isFilterConditionActive(FilterConditionType.CONDITION)) {
            return this.serialize(FilterConditionType.MAIN);
        }
        else {
            return {
                condition1: this.serialize(FilterConditionType.MAIN),
                condition2: this.serialize(FilterConditionType.CONDITION),
                operator: this.conditionValue
            };
        }
    };
    BaseFilter.prototype.setModel = function (model) {
        if (model) {
            if (!model.operator) {
                this.resetState();
                this.parse(model, FilterConditionType.MAIN);
            }
            else {
                var asCombinedFilter = model;
                this.parse((asCombinedFilter).condition1, FilterConditionType.MAIN);
                this.parse((asCombinedFilter).condition2, FilterConditionType.CONDITION);
                this.conditionValue = asCombinedFilter.operator;
            }
        }
        else {
            this.resetState();
        }
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
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
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
        return shouldFilter;
    };
    BaseFilter.prototype.onFilterChanged = function (applyNow) {
        if (applyNow === void 0) { applyNow = false; }
        this.doOnFilterChanged(applyNow);
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    };
    BaseFilter.prototype.redrawCondition = function () {
        var _this = this;
        var filterCondition = this.eFilterBodyWrapper.querySelector('.ag-filter-condition');
        if (!filterCondition && this.isFilterActive() && this.acceptsBooleanLogic()) {
            this.eConditionWrapper = utils_1._.loadTemplate(this.createConditionTemplate(FilterConditionType.CONDITION));
            this.eFilterBodyWrapper.appendChild(this.eConditionWrapper);
            this.wireQuerySelectors();
            var _a = this.refreshOperatorUi(), andButton = _a.andButton, orButton = _a.orButton;
            this.addDestroyableEventListener(andButton, 'change', function () {
                _this.conditionValue = 'AND';
                _this.onFilterChanged();
            });
            this.addDestroyableEventListener(orButton, 'change', function () {
                _this.conditionValue = 'OR';
                _this.onFilterChanged();
            });
            this.initialiseFilterBodyUi(FilterConditionType.CONDITION);
        }
        else if (filterCondition && !this.isFilterActive()) {
            // reset condition filter state
            this.conditionValue = 'AND';
            this.resetState(true);
            this.eFilterBodyWrapper.removeChild(this.eConditionWrapper);
            this.eConditionWrapper = null;
        }
        else {
            this.refreshFilterBodyUi(FilterConditionType.CONDITION);
            if (this.eConditionWrapper) {
                this.refreshOperatorUi();
            }
        }
    };
    BaseFilter.prototype.refreshOperatorUi = function () {
        var andButton = this.eConditionWrapper.querySelector('.and');
        var orButton = this.eConditionWrapper.querySelector('.or');
        this.conditionValue = this.conditionValue == null ? 'AND' : this.conditionValue;
        andButton.checked = this.conditionValue === 'AND';
        orButton.checked = this.conditionValue === 'OR';
        return { andButton: andButton, orButton: orButton };
    };
    BaseFilter.prototype.onFloatingFilterChanged = function (change) {
        //It has to be of the type FloatingFilterWithApplyChange if it gets here
        var casted = change;
        if (casted == null) {
            this.setModel(null);
        }
        else if (!this.isFilterConditionActive(FilterConditionType.CONDITION)) {
            this.setModel(casted ? casted.model : null);
        }
        else {
            var combinedFilter = {
                condition1: casted.model,
                condition2: this.serialize(FilterConditionType.CONDITION),
                operator: this.conditionValue
            };
            this.setModel(combinedFilter);
        }
        return this.doOnFilterChanged(casted ? casted.apply : false);
    };
    BaseFilter.prototype.generateFilterHeader = function (type) {
        return '';
    };
    BaseFilter.prototype.generateTemplate = function () {
        var translate = this.translate.bind(this);
        var mainConditionBody = this.createConditionBody(FilterConditionType.MAIN);
        var bodyWithBooleanLogic = !this.acceptsBooleanLogic() ?
            mainConditionBody :
            this.wrapCondition(mainConditionBody);
        return "<div>\n                    <div class='ag-filter-body-wrapper'>" + bodyWithBooleanLogic + "</div>\n                    <div class=\"ag-filter-apply-panel\" id=\"applyPanel\">\n                        <button type=\"button\" id=\"clearButton\">" + translate('clearFilter') + "</button>\n                        <button type=\"button\" id=\"applyButton\">" + translate('applyFilter') + "</button>\n                    </div>\n                </div>";
    };
    BaseFilter.prototype.acceptsBooleanLogic = function () {
        return false;
    };
    BaseFilter.prototype.wrapCondition = function (mainCondition) {
        if (!this.isFilterActive()) {
            return mainCondition;
        }
        return "" + mainCondition + this.createConditionTemplate(FilterConditionType.CONDITION);
    };
    BaseFilter.prototype.createConditionTemplate = function (type) {
        return "<div class=\"ag-filter-condition\">\n            <input id=\"andId\" type=\"radio\" class=\"and\" name=\"booleanLogic\" value=" + this.translate('AND') + "\n                   checked=\"checked\" /><label style=\"display: inline\" for=\"andId\">" + this.translate('andCondition') + "</label>\n            <input id=\"orId\" type=\"radio\" class=\"or\" name=\"booleanLogic\" value=\"OR\" /><label style=\"display: inline\"\n                   for=\"orId\">" + this.translate('orCondition') + "</label>\n            <div>" + this.createConditionBody(type) + "</div>\n        </div>";
    };
    BaseFilter.prototype.createConditionBody = function (type) {
        var body = this.bodyTemplate(type);
        return this.generateFilterHeader(type) + body;
    };
    BaseFilter.prototype.translate = function (toTranslate) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var defaultTranslation = DEFAULT_TRANSLATIONS[toTranslate];
        if (!defaultTranslation && this.customFilterOptions[toTranslate]) {
            defaultTranslation = this.customFilterOptions[toTranslate].displayName;
        }
        return translate(toTranslate, defaultTranslation);
    };
    BaseFilter.prototype.getDebounceMs = function (filterParams) {
        if (this.applyActive) {
            if (filterParams.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when applyButton = true');
            }
            return 0;
        }
        return filterParams.debounceMs != null ? filterParams.debounceMs : 500;
    };
    BaseFilter.prototype.doesFilterHaveHiddenInput = function (filterType) {
        var customFilterOption = this.customFilterOptions[filterType];
        return customFilterOption && customFilterOption.hideFilterInput;
    };
    BaseFilter.EMPTY = 'empty';
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
        componentAnnotations_1.QuerySelector('.ag-filter-body-wrapper'),
        __metadata("design:type", HTMLElement)
    ], BaseFilter.prototype, "eFilterBodyWrapper", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#applyButton'),
        __metadata("design:type", HTMLElement)
    ], BaseFilter.prototype, "eApplyButton", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#clearButton'),
        __metadata("design:type", HTMLElement)
    ], BaseFilter.prototype, "eClearButton", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], BaseFilter.prototype, "gridOptionsWrapper", void 0);
    return BaseFilter;
}(component_1.Component));
exports.BaseFilter = BaseFilter;
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
var ComparableBaseFilter = /** @class */ (function (_super) {
    __extends(ComparableBaseFilter, _super);
    function ComparableBaseFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComparableBaseFilter.prototype.doesFilterPass = function (params) {
        var mainFilterResult = this.individualFilterPasses(params, FilterConditionType.MAIN);
        if (this.eTypeConditionSelector == null) {
            return mainFilterResult;
        }
        var auxFilterResult = this.individualFilterPasses(params, FilterConditionType.CONDITION);
        return this.conditionValue === 'AND' ? mainFilterResult && auxFilterResult : mainFilterResult || auxFilterResult;
    };
    ComparableBaseFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.suppressAndOrCondition = params.suppressAndOrCondition;
    };
    ComparableBaseFilter.prototype.customInit = function () {
        if (!this.defaultFilter) {
            this.defaultFilter = this.getDefaultType();
        }
    };
    ComparableBaseFilter.prototype.acceptsBooleanLogic = function () {
        return this.suppressAndOrCondition !== true;
    };
    ComparableBaseFilter.prototype.generateFilterHeader = function (type) {
        var _this = this;
        var defaultFilterTypes = this.getApplicableFilterTypes();
        var restrictedFilterTypes = this.filterParams.filterOptions;
        var actualFilterTypes = restrictedFilterTypes ? restrictedFilterTypes : defaultFilterTypes;
        var optionsHtml = actualFilterTypes.map(function (filter) {
            var filterName = (typeof filter === 'string') ? filter : filter.displayKey;
            var localeFilterName = _this.translate(filterName);
            return "<option value=\"" + filterName + "\">" + localeFilterName + "</option>";
        });
        var readOnly = optionsHtml.length == 1 ? 'disabled' : '';
        var id = type == FilterConditionType.MAIN ? 'filterType' : 'filterConditionType';
        return optionsHtml.length <= 0 ?
            '' :
            "<div>\n                <select class=\"ag-filter-select\" id=\"" + id + "\" " + readOnly + ">\n                    " + optionsHtml.join('') + "\n                </select>\n            </div>";
    };
    ComparableBaseFilter.prototype.initialiseFilterBodyUi = function (type) {
        var _this = this;
        if (type === FilterConditionType.MAIN) {
            this.setFilterType(this.selectedFilter, type);
            this.addDestroyableEventListener(this.eTypeSelector, "change", function () { return _this.onFilterTypeChanged(type); });
        }
        else {
            this.setFilterType(this.selectedFilterCondition, type);
            this.addDestroyableEventListener(this.eTypeConditionSelector, "change", function () { return _this.onFilterTypeChanged(type); });
        }
    };
    ComparableBaseFilter.prototype.onFilterTypeChanged = function (type) {
        var prevSelectedFilter = this.selectedFilter;
        if (type === FilterConditionType.MAIN) {
            this.selectedFilter = this.eTypeSelector.value;
        }
        else {
            this.selectedFilterCondition = this.eTypeConditionSelector.value;
        }
        this.refreshFilterBodyUi(type);
        var prevSelectedFilterHadNoInput = this.doesFilterHaveHiddenInput(prevSelectedFilter);
        // only fire 'onFilterChanged' event if filter is active, as in it contains a filter value, or if the previously
        // selected filter didn't require a value, i.e. if custom filter has 'hideFilterInputField = true'
        if (this.isFilterActive() || prevSelectedFilterHadNoInput) {
            // reset when switching back to the empty filter to remove conditional filter
            if (this.selectedFilter === BaseFilter.EMPTY) {
                this.resetState();
            }
            this.onFilterChanged();
        }
    };
    ComparableBaseFilter.prototype.isFilterActive = function () {
        // the main selected filter is always active when there is no input field
        if (this.doesFilterHaveHiddenInput(this.selectedFilter)) {
            return true;
        }
        var rawFilterValues = this.filterValues(FilterConditionType.MAIN);
        if (rawFilterValues && this.selectedFilter === BaseFilter.IN_RANGE) {
            var filterValueArray = rawFilterValues;
            return filterValueArray[0] != null && filterValueArray[1] != null;
        }
        else {
            return rawFilterValues != null;
        }
    };
    ComparableBaseFilter.prototype.setFilterType = function (filterType, type) {
        if (type === FilterConditionType.MAIN) {
            this.selectedFilter = filterType;
            if (!this.eTypeSelector) {
                return;
            }
            this.eTypeSelector.value = filterType;
        }
        else {
            this.selectedFilterCondition = filterType;
            if (!this.eTypeConditionSelector) {
                return;
            }
            this.eTypeConditionSelector.value = filterType;
        }
    };
    ComparableBaseFilter.prototype.isFilterConditionActive = function (type) {
        return this.filterValues(type) != null;
    };
    __decorate([
        componentAnnotations_1.QuerySelector('#filterType'),
        __metadata("design:type", HTMLSelectElement)
    ], ComparableBaseFilter.prototype, "eTypeSelector", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterConditionType'),
        __metadata("design:type", HTMLSelectElement)
    ], ComparableBaseFilter.prototype, "eTypeConditionSelector", void 0);
    return ComparableBaseFilter;
}(BaseFilter));
exports.ComparableBaseFilter = ComparableBaseFilter;
/**
 * Comparable filter with scalar underlying values (ie numbers and dates. Strings are not scalar so have to extend
 * ComparableBaseFilter)
 */
var ScalarBaseFilter = /** @class */ (function (_super) {
    __extends(ScalarBaseFilter, _super);
    function ScalarBaseFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScalarBaseFilter.prototype.nullComparator = function (type) {
        var _this = this;
        return function (filterValue, gridValue) {
            if (gridValue == null) {
                var nullValue = _this.translateNull(type);
                if (_this.selectedFilter === BaseFilter.EMPTY) {
                    return 0;
                }
                if (_this.selectedFilter === BaseFilter.EQUALS) {
                    return nullValue ? 0 : 1;
                }
                if (_this.selectedFilter === BaseFilter.GREATER_THAN) {
                    return nullValue ? 1 : -1;
                }
                if (_this.selectedFilter === BaseFilter.GREATER_THAN_OR_EQUAL) {
                    return nullValue ? 1 : -1;
                }
                if (_this.selectedFilter === BaseFilter.LESS_THAN_OR_EQUAL) {
                    return nullValue ? -1 : 1;
                }
                if (_this.selectedFilter === BaseFilter.LESS_THAN) {
                    return nullValue ? -1 : 1;
                }
                if (_this.selectedFilter === BaseFilter.NOT_EQUAL) {
                    return nullValue ? 1 : 0;
                }
            }
            var actualComparator = _this.comparator();
            return actualComparator(filterValue, gridValue);
        };
    };
    ScalarBaseFilter.prototype.getDefaultType = function () {
        return BaseFilter.EQUALS;
    };
    ScalarBaseFilter.prototype.translateNull = function (type) {
        var reducedType = type.indexOf('greater') > -1 ? 'greaterThan' :
            type.indexOf('lessThan') > -1 ? 'lessThan' :
                'equals';
        if (this.filterParams.nullComparator && this.filterParams.nullComparator[reducedType]) {
            return this.filterParams.nullComparator[reducedType];
        }
        return ScalarBaseFilter.DEFAULT_NULL_COMPARATOR[reducedType];
    };
    ScalarBaseFilter.prototype.individualFilterPasses = function (params, type) {
        return this.doIndividualFilterPasses(params, type, type === FilterConditionType.MAIN ? this.selectedFilter : this.selectedFilterCondition);
    };
    ScalarBaseFilter.prototype.doIndividualFilterPasses = function (params, type, filter) {
        var cellValue = this.filterParams.valueGetter(params.node);
        var rawFilterValues = this.filterValues(type);
        var filterValue = Array.isArray(rawFilterValues) ? rawFilterValues[0] : rawFilterValues;
        var customFilterOption = this.customFilterOptions[filter];
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterValue != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterValue, cellValue);
            }
        }
        if (filterValue == null) {
            return type === FilterConditionType.MAIN ? true : this.conditionValue === 'AND';
        }
        var comparator = this.nullComparator(filter);
        var compareResult = comparator(filterValue, cellValue);
        if (filter === BaseFilter.EMPTY) {
            return false;
        }
        if (filter === BaseFilter.EQUALS) {
            return compareResult === 0;
        }
        if (filter === BaseFilter.GREATER_THAN) {
            return compareResult > 0;
        }
        if (filter === BaseFilter.GREATER_THAN_OR_EQUAL) {
            return compareResult >= 0;
        }
        if (filter === BaseFilter.LESS_THAN_OR_EQUAL) {
            return compareResult <= 0;
        }
        if (filter === BaseFilter.LESS_THAN) {
            return compareResult < 0;
        }
        if (filter === BaseFilter.NOT_EQUAL) {
            return compareResult != 0;
        }
        //From now on the type is a range and rawFilterValues must be an array!
        var compareToResult = comparator(rawFilterValues[1], cellValue);
        if (filter === BaseFilter.IN_RANGE) {
            if (!this.filterParams.inRangeInclusive) {
                return compareResult > 0 && compareToResult < 0;
            }
            else {
                return compareResult >= 0 && compareToResult <= 0;
            }
        }
        throw new Error('Unexpected type of filter: ' + filter);
    };
    ScalarBaseFilter.DEFAULT_NULL_COMPARATOR = {
        equals: false,
        lessThan: false,
        greaterThan: false
    };
    return ScalarBaseFilter;
}(ComparableBaseFilter));
exports.ScalarBaseFilter = ScalarBaseFilter;
