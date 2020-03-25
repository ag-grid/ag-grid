/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
var utils_1 = require("../../../utils");
var dateCompWrapper_1 = require("./dateCompWrapper");
var simpleFilter_1 = require("../simpleFilter");
var scalerFilter_1 = require("../scalerFilter");
var DateFilter = /** @class */ (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFilter.prototype.mapRangeFromModel = function (filterModel) {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (cos Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - ie when user picks
        //       a date form the UI, it will have timezone info in it. This is lost when creating
        //       the model. Then when we recreate the date again here, it's without timezone.
        var from = utils_1._.getDateFromString(filterModel.dateFrom);
        var to = utils_1._.getDateFromString(filterModel.dateTo);
        return {
            from: from,
            to: to
        };
    };
    DateFilter.prototype.setValueFromFloatingFilter = function (value) {
        if (value != null) {
            var dateFrom = utils_1._.getDateFromString(value);
            this.dateCompFrom1.setDate(dateFrom);
        }
        else {
            this.dateCompFrom1.setDate(null);
        }
        this.dateCompTo1.setDate(null);
        this.dateCompFrom2.setDate(null);
        this.dateCompTo2.setDate(null);
    };
    DateFilter.prototype.setConditionIntoUi = function (model, position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var dateFromString = model ? model.dateFrom : null;
        var dateToString = model ? model.dateTo : null;
        var dateFrom = utils_1._.getDateFromString(dateFromString);
        var dateTo = utils_1._.getDateFromString(dateToString);
        var compFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;
        var compTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;
        compFrom.setDate(dateFrom);
        compTo.setDate(dateTo);
    };
    DateFilter.prototype.resetUiToDefaults = function (silent) {
        _super.prototype.resetUiToDefaults.call(this, silent);
        this.dateCompTo1.setDate(null);
        this.dateCompTo2.setDate(null);
        this.dateCompFrom1.setDate(null);
        this.dateCompFrom2.setDate(null);
    };
    DateFilter.prototype.comparator = function () {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    };
    DateFilter.prototype.defaultComparator = function (filterDate, cellValue) {
        //The default comparator assumes that the cellValue is a date
        var cellAsDate = cellValue;
        if (cellAsDate < filterDate) {
            return -1;
        }
        if (cellAsDate > filterDate) {
            return 1;
        }
        return cellValue != null ? 0 : -1;
    };
    DateFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.dateFilterParams = params;
        this.createDateComponents();
    };
    DateFilter.prototype.createDateComponents = function () {
        var _this = this;
        // params to pass to all four date comps
        var dateComponentParams = {
            onDateChanged: function () { return _this.onUiChanged(); },
            filterParams: this.dateFilterParams
        };
        this.dateCompFrom1 = new dateCompWrapper_1.DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelFrom1);
        this.dateCompFrom2 = new dateCompWrapper_1.DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelFrom2);
        this.dateCompTo1 = new dateCompWrapper_1.DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelTo1);
        this.dateCompTo2 = new dateCompWrapper_1.DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelTo2);
        this.addDestroyFunc(function () {
            _this.dateCompFrom1.destroy();
            _this.dateCompFrom2.destroy();
            _this.dateCompTo1.destroy();
            _this.dateCompTo2.destroy();
        });
    };
    DateFilter.prototype.getDefaultFilterOptions = function () {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    };
    DateFilter.prototype.createValueTemplate = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var pos = positionOne ? '1' : '2';
        return "<div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\">\n                    <div class=\"ag-filter-from ag-filter-date-from\" ref=\"ePanelFrom" + pos + "\">\n                    </div>\n                    <div class=\"ag-filter-to ag-filter-date-to\" ref=\"ePanelTo" + pos + "\"\">\n                    </div>\n                </div>";
    };
    DateFilter.prototype.isConditionUiComplete = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var compFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;
        var compTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;
        var valueFrom = compFrom.getDate();
        var valueTo = compTo.getDate();
        if (option === simpleFilter_1.SimpleFilter.EMPTY) {
            return false;
        }
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        if (option === simpleFilter_1.SimpleFilter.IN_RANGE) {
            return valueFrom != null && valueTo != null;
        }
        return valueFrom != null;
    };
    DateFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    };
    // needed for creating filter model
    DateFilter.prototype.getFilterType = function () {
        return DateFilter.FILTER_TYPE;
    };
    DateFilter.prototype.createCondition = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var dateCompFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;
        var dateCompTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;
        var dateFrom = dateCompFrom.getDate();
        var dateTo = dateCompTo.getDate();
        return {
            dateFrom: utils_1._.serializeDateToYyyyMmDd(dateFrom, "-") + " " + utils_1._.getTimeFromDate(dateFrom),
            dateTo: utils_1._.serializeDateToYyyyMmDd(dateTo, "-") + " " + utils_1._.getTimeFromDate(dateTo),
            type: type,
            filterType: DateFilter.FILTER_TYPE
        };
    };
    DateFilter.prototype.resetPlaceholder = function () {
        var translate = this.translate.bind(this);
        var isRange1 = this.getCondition1Type() === scalerFilter_1.ScalerFilter.IN_RANGE;
        var isRange2 = this.getCondition2Type() === scalerFilter_1.ScalerFilter.IN_RANGE;
        this.dateCompFrom1.setInputPlaceholder(translate(isRange1 ? 'rangeStart' : 'filterOoo'));
        this.dateCompTo1.setInputPlaceholder(translate(isRange1 ? 'rangeEnd' : 'filterOoo'));
        this.dateCompFrom2.setInputPlaceholder(translate(isRange2 ? 'rangeStart' : 'filterOoo'));
        this.dateCompTo2.setInputPlaceholder(translate(isRange2 ? 'rangeEnd' : 'filterOoo'));
    };
    DateFilter.prototype.updateUiVisibility = function () {
        _super.prototype.updateUiVisibility.call(this);
        this.resetPlaceholder();
        var showFrom1 = this.showValueFrom(this.getCondition1Type());
        utils_1._.setDisplayed(this.ePanelFrom1, showFrom1);
        var showTo1 = this.showValueTo(this.getCondition1Type());
        utils_1._.setDisplayed(this.ePanelTo1, showTo1);
        var showFrom2 = this.showValueFrom(this.getCondition2Type());
        utils_1._.setDisplayed(this.ePanelFrom2, showFrom2);
        var showTo2 = this.showValueTo(this.getCondition2Type());
        utils_1._.setDisplayed(this.ePanelTo2, showTo2);
    };
    DateFilter.FILTER_TYPE = 'date';
    DateFilter.DEFAULT_FILTER_OPTIONS = [
        scalerFilter_1.ScalerFilter.EQUALS,
        scalerFilter_1.ScalerFilter.GREATER_THAN,
        scalerFilter_1.ScalerFilter.LESS_THAN,
        scalerFilter_1.ScalerFilter.NOT_EQUAL,
        scalerFilter_1.ScalerFilter.IN_RANGE
    ];
    __decorate([
        componentAnnotations_1.RefSelector('ePanelFrom1')
    ], DateFilter.prototype, "ePanelFrom1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('ePanelFrom2')
    ], DateFilter.prototype, "ePanelFrom2", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('ePanelTo1')
    ], DateFilter.prototype, "ePanelTo1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('ePanelTo2')
    ], DateFilter.prototype, "ePanelTo2", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], DateFilter.prototype, "userComponentFactory", void 0);
    return DateFilter;
}(scalerFilter_1.ScalerFilter));
exports.DateFilter = DateFilter;

//# sourceMappingURL=dateFilter.js.map
