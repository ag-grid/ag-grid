/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
exports.DateFloatingFilter = void 0;
var dateFilter_1 = require("./dateFilter");
var context_1 = require("../../../context/context");
var dateCompWrapper_1 = require("./dateCompWrapper");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var simpleFilter_1 = require("../simpleFilter");
var simpleFloatingFilter_1 = require("../../floating/provided/simpleFloatingFilter");
var providedFilter_1 = require("../providedFilter");
var dom_1 = require("../../../utils/dom");
var date_1 = require("../../../utils/date");
var function_1 = require("../../../utils/function");
var DateFloatingFilter = /** @class */ (function (_super) {
    __extends(DateFloatingFilter, _super);
    function DateFloatingFilter() {
        return _super.call(this, /* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eReadOnlyText\"></ag-input-text-field>\n                <div ref=\"eDateWrapper\" style=\"display: flex;\"></div>\n            </div>") || this;
    }
    DateFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return dateFilter_1.DateFilter.DEFAULT_FILTER_OPTIONS;
    };
    DateFloatingFilter.prototype.conditionToString = function (condition, options) {
        var type = condition.type;
        var numberOfInputs = (options || {}).numberOfInputs;
        var isRange = type == simpleFilter_1.SimpleFilter.IN_RANGE || numberOfInputs === 2;
        var dateFrom = date_1.parseDateTimeFromString(condition.dateFrom);
        var dateTo = date_1.parseDateTimeFromString(condition.dateTo);
        var format = this.filterParams.inRangeFloatingFilterDateFormat;
        if (isRange) {
            var formattedFrom = dateFrom !== null ? date_1.dateToFormattedString(dateFrom, format) : 'null';
            var formattedTo = dateTo !== null ? date_1.dateToFormattedString(dateTo, format) : 'null';
            return formattedFrom + "-" + formattedTo;
        }
        if (dateFrom != null) {
            return date_1.dateToFormattedString(dateFrom, format);
        }
        // cater for when the type doesn't need a value
        return "" + type;
    };
    DateFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.params = params;
        this.filterParams = params.filterParams;
        this.createDateComponent();
        var translate = this.localeService.getLocaleTextFunc();
        this.eReadOnlyText
            .setDisabled(true)
            .setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    };
    DateFloatingFilter.prototype.setEditable = function (editable) {
        dom_1.setDisplayed(this.eDateWrapper, editable);
        dom_1.setDisplayed(this.eReadOnlyText.getGui(), !editable);
    };
    DateFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing.
        // This is similar for data changes, which don't affect provided date floating filters
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            return;
        }
        _super.prototype.setLastTypeFromModel.call(this, model);
        var allowEditing = !this.isReadOnly() &&
            this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);
        if (allowEditing) {
            if (model) {
                var dateModel = model;
                this.dateComp.setDate(date_1.parseDateTimeFromString(dateModel.dateFrom));
            }
            else {
                this.dateComp.setDate(null);
            }
            this.eReadOnlyText.setValue('');
        }
        else {
            this.eReadOnlyText.setValue(this.getTextFromModel(model));
            this.dateComp.setDate(null);
        }
    };
    DateFloatingFilter.prototype.onDateChanged = function () {
        var _this = this;
        var filterValueDate = this.dateComp.getDate();
        var filterValueText = date_1.serialiseDate(filterValueDate);
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                var date = date_1.parseDateTimeFromString(filterValueText);
                filterInstance.onFloatingFilterChanged(_this.getLastType() || null, date);
            }
        });
    };
    DateFloatingFilter.prototype.createDateComponent = function () {
        var _this = this;
        var debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        var dateComponentParams = {
            onDateChanged: function_1.debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams
        };
        this.dateComp = new dateCompWrapper_1.DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eDateWrapper);
        this.addDestroyFunc(function () { return _this.dateComp.destroy(); });
    };
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], DateFloatingFilter.prototype, "userComponentFactory", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eReadOnlyText')
    ], DateFloatingFilter.prototype, "eReadOnlyText", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eDateWrapper')
    ], DateFloatingFilter.prototype, "eDateWrapper", void 0);
    return DateFloatingFilter;
}(simpleFloatingFilter_1.SimpleFloatingFilter));
exports.DateFloatingFilter = DateFloatingFilter;
