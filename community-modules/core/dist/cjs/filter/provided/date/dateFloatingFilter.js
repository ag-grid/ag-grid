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
var dateFilter_1 = require("./dateFilter");
var context_1 = require("../../../context/context");
var utils_1 = require("../../../utils");
var dateCompWrapper_1 = require("./dateCompWrapper");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var simpleFilter_1 = require("../simpleFilter");
var simpleFloatingFilter_1 = require("../../floating/provided/simpleFloatingFilter");
var providedFilter_1 = require("../providedFilter");
var DateFloatingFilter = /** @class */ (function (_super) {
    __extends(DateFloatingFilter, _super);
    function DateFloatingFilter() {
        return _super.call(this, "<div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eReadOnlyText\"></ag-input-text-field>\n                <div ref=\"eDateWrapper\" style=\"display: flex; overflow: hidden;\"></div>\n            </div>") || this;
    }
    DateFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return dateFilter_1.DateFilter.DEFAULT_FILTER_OPTIONS;
    };
    DateFloatingFilter.prototype.conditionToString = function (condition) {
        var isRange = condition.type == simpleFilter_1.SimpleFilter.IN_RANGE;
        if (isRange) {
            return condition.dateFrom + "-" + condition.dateTo;
        }
        // cater for when the type doesn't need a value
        if (condition.dateFrom != null) {
            return "" + condition.dateFrom;
        }
        return "" + condition.type;
    };
    DateFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.params = params;
        this.createDateComponent();
        this.eReadOnlyText.setDisabled(true);
    };
    DateFloatingFilter.prototype.setEditable = function (editable) {
        utils_1._.setDisplayed(this.eDateWrapper, editable);
        utils_1._.setDisplayed(this.eReadOnlyText.getGui(), !editable);
    };
    DateFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        // we don't want to update the floating filter if the floating filter caused the change.
        // as if it caused the change, the ui is already in sycn. if we didn't do this, the UI
        // would behave strange as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) {
            return;
        }
        _super.prototype.setLastTypeFromModel.call(this, model);
        var allowEditing = this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);
        if (allowEditing) {
            if (model) {
                var dateModel = model;
                this.dateComp.setDate(utils_1._.getDateFromString(dateModel.dateFrom));
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
        var filterValueText = utils_1._.serializeDateToYyyyMmDd(filterValueDate, "-") + " " + utils_1._.getTimeFromDate(filterValueDate);
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                var simpleFilter = filterInstance;
                simpleFilter.onFloatingFilterChanged(_this.getLastType(), filterValueText);
            }
        });
    };
    DateFloatingFilter.prototype.createDateComponent = function () {
        var _this = this;
        var debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        var toDebounce = utils_1._.debounce(this.onDateChanged.bind(this), debounceMs);
        var dateComponentParams = {
            onDateChanged: toDebounce,
            filterParams: this.params.column.getColDef().filterParams
        };
        this.dateComp = new dateCompWrapper_1.DateCompWrapper(this.userComponentFactory, dateComponentParams, this.eDateWrapper);
        this.addDestroyFunc(function () {
            _this.dateComp.destroy();
        });
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

//# sourceMappingURL=dateFloatingFilter.js.map
