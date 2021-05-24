/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var context_1 = require("../../../context/context");
var dateCompWrapper_1 = require("./dateCompWrapper");
var simpleFilter_1 = require("../simpleFilter");
var scalarFilter_1 = require("../scalarFilter");
var date_1 = require("../../../utils/date");
var dom_1 = require("../../../utils/dom");
var DateFilter = /** @class */ (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter() {
        return _super.call(this, 'dateFilter') || this;
    }
    DateFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.dateCondition1FromComp.afterGuiAttached(params);
    };
    DateFilter.prototype.mapRangeFromModel = function (filterModel) {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (because Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
        //       a date from the UI, it will have timezone info in it. This is lost when creating
        //       the model. When we recreate the date again here, it's without a timezone.
        return {
            from: date_1.parseDateTimeFromString(filterModel.dateFrom),
            to: date_1.parseDateTimeFromString(filterModel.dateTo)
        };
    };
    DateFilter.prototype.setValueFromFloatingFilter = function (value) {
        this.dateCondition1FromComp.setDate(value == null ? null : date_1.parseDateTimeFromString(value));
        this.dateCondition1ToComp.setDate(null);
        this.dateCondition2FromComp.setDate(null);
        this.dateCondition2ToComp.setDate(null);
    };
    DateFilter.prototype.setConditionIntoUi = function (model, position) {
        var _a = model ?
            [date_1.parseDateTimeFromString(model.dateFrom), date_1.parseDateTimeFromString(model.dateTo)] :
            [null, null], dateFrom = _a[0], dateTo = _a[1];
        var _b = this.getFromToComponents(position), compFrom = _b[0], compTo = _b[1];
        compFrom.setDate(dateFrom);
        compTo.setDate(dateTo);
    };
    DateFilter.prototype.resetUiToDefaults = function (silent) {
        var _this = this;
        return _super.prototype.resetUiToDefaults.call(this, silent).then(function () {
            _this.dateCondition1FromComp.setDate(null);
            _this.dateCondition1ToComp.setDate(null);
            _this.dateCondition2FromComp.setDate(null);
            _this.dateCondition2ToComp.setDate(null);
        });
    };
    DateFilter.prototype.comparator = function () {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    };
    DateFilter.prototype.defaultComparator = function (filterDate, cellValue) {
        // The default comparator assumes that the cellValue is a date
        var cellAsDate = cellValue;
        if (cellValue == null || cellAsDate < filterDate) {
            return -1;
        }
        if (cellAsDate > filterDate) {
            return 1;
        }
        return 0;
    };
    DateFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.dateFilterParams = params;
        this.createDateComponents();
    };
    DateFilter.prototype.createDateComponents = function () {
        var _this = this;
        var createDateCompWrapper = function (element) {
            return new dateCompWrapper_1.DateCompWrapper(_this.getContext(), _this.userComponentFactory, {
                onDateChanged: function () { return _this.onUiChanged(); },
                filterParams: _this.dateFilterParams
            }, element);
        };
        this.dateCondition1FromComp = createDateCompWrapper(this.eCondition1PanelFrom);
        this.dateCondition1ToComp = createDateCompWrapper(this.eCondition1PanelTo);
        this.dateCondition2FromComp = createDateCompWrapper(this.eCondition2PanelFrom);
        this.dateCondition2ToComp = createDateCompWrapper(this.eCondition2PanelTo);
        this.addDestroyFunc(function () {
            _this.dateCondition1FromComp.destroy();
            _this.dateCondition1ToComp.destroy();
            _this.dateCondition2FromComp.destroy();
            _this.dateCondition2ToComp.destroy();
        });
    };
    DateFilter.prototype.getDefaultFilterOptions = function () {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    };
    DateFilter.prototype.createValueTemplate = function (position) {
        var pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        return /* html */ "\n            <div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\">\n                <div class=\"ag-filter-from ag-filter-date-from\" ref=\"eCondition" + pos + "PanelFrom\"></div>\n                <div class=\"ag-filter-to ag-filter-date-to\" ref=\"eCondition" + pos + "PanelTo\"></div>\n            </div>";
    };
    DateFilter.prototype.isConditionUiComplete = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        if (option === simpleFilter_1.SimpleFilter.EMPTY) {
            return false;
        }
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        var _a = this.getFromToComponents(position), compFrom = _a[0], compTo = _a[1];
        var minValidYear = this.dateFilterParams.minValidYear == null ? 1000 : this.dateFilterParams.minValidYear;
        var isValidDate = function (value) { return value != null && value.getUTCFullYear() > minValidYear; };
        return isValidDate(compFrom.getDate()) && (!this.showValueTo(option) || isValidDate(compTo.getDate()));
    };
    DateFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    };
    DateFilter.prototype.getFilterType = function () {
        return 'date';
    };
    DateFilter.prototype.createCondition = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var _a = this.getFromToComponents(position), compFrom = _a[0], compTo = _a[1];
        return {
            dateFrom: date_1.serialiseDate(compFrom.getDate()),
            dateTo: date_1.serialiseDate(compTo.getDate()),
            type: type,
            filterType: this.getFilterType()
        };
    };
    DateFilter.prototype.resetPlaceholder = function () {
        var globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        var placeholder = this.translate('dateFormatOoo');
        var ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');
        this.dateCondition1FromComp.setInputPlaceholder(placeholder);
        this.dateCondition1FromComp.setInputAriaLabel(ariaLabel);
        this.dateCondition1ToComp.setInputPlaceholder(placeholder);
        this.dateCondition1ToComp.setInputAriaLabel(ariaLabel);
        this.dateCondition2FromComp.setInputPlaceholder(placeholder);
        this.dateCondition2FromComp.setInputAriaLabel(ariaLabel);
        this.dateCondition2ToComp.setInputPlaceholder(placeholder);
        this.dateCondition2ToComp.setInputAriaLabel(ariaLabel);
    };
    DateFilter.prototype.updateUiVisibility = function () {
        _super.prototype.updateUiVisibility.call(this);
        this.resetPlaceholder();
        var condition1Type = this.getCondition1Type();
        dom_1.setDisplayed(this.eCondition1PanelFrom, this.showValueFrom(condition1Type));
        dom_1.setDisplayed(this.eCondition1PanelTo, this.showValueTo(condition1Type));
        var condition2Type = this.getCondition2Type();
        dom_1.setDisplayed(this.eCondition2PanelFrom, this.showValueFrom(condition2Type));
        dom_1.setDisplayed(this.eCondition2PanelTo, this.showValueTo(condition2Type));
    };
    DateFilter.prototype.getFromToComponents = function (position) {
        return position === simpleFilter_1.ConditionPosition.One ?
            [this.dateCondition1FromComp, this.dateCondition1ToComp] :
            [this.dateCondition2FromComp, this.dateCondition2ToComp];
    };
    DateFilter.DEFAULT_FILTER_OPTIONS = [
        scalarFilter_1.ScalarFilter.EQUALS,
        scalarFilter_1.ScalarFilter.GREATER_THAN,
        scalarFilter_1.ScalarFilter.LESS_THAN,
        scalarFilter_1.ScalarFilter.NOT_EQUAL,
        scalarFilter_1.ScalarFilter.IN_RANGE
    ];
    __decorate([
        componentAnnotations_1.RefSelector('eCondition1PanelFrom')
    ], DateFilter.prototype, "eCondition1PanelFrom", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCondition1PanelTo')
    ], DateFilter.prototype, "eCondition1PanelTo", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCondition2PanelFrom')
    ], DateFilter.prototype, "eCondition2PanelFrom", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCondition2PanelTo')
    ], DateFilter.prototype, "eCondition2PanelTo", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], DateFilter.prototype, "userComponentFactory", void 0);
    return DateFilter;
}(scalarFilter_1.ScalarFilter));
exports.DateFilter = DateFilter;

//# sourceMappingURL=dateFilter.js.map
