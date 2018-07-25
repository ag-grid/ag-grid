/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var utils_1 = require("../utils");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var baseFilter_1 = require("./baseFilter");
var NumberFilter = (function (_super) {
    __extends(NumberFilter, _super);
    function NumberFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFilter.prototype.modelFromFloatingFilter = function (from) {
        return {
            type: this.filter,
            filter: Number(from),
            filterTo: this.filterNumberTo,
            filterType: 'number'
        };
    };
    NumberFilter.prototype.getApplicableFilterTypes = function () {
        return [baseFilter_1.BaseFilter.EQUALS, baseFilter_1.BaseFilter.NOT_EQUAL, baseFilter_1.BaseFilter.LESS_THAN, baseFilter_1.BaseFilter.LESS_THAN_OR_EQUAL,
            baseFilter_1.BaseFilter.GREATER_THAN, baseFilter_1.BaseFilter.GREATER_THAN_OR_EQUAL, baseFilter_1.BaseFilter.IN_RANGE];
    };
    NumberFilter.prototype.bodyTemplate = function (type) {
        var translate = this.translate.bind(this);
        var fieldId = type == baseFilter_1.FilterConditionType.MAIN ? "filterText" : "filterConditionText";
        var filterNumberToPanelId = type == baseFilter_1.FilterConditionType.MAIN ? "filterNumberToPanel" : "filterNumberToPanelCondition";
        var fieldToId = type == baseFilter_1.FilterConditionType.MAIN ? "filterToText" : "filterToConditionText";
        return "<div class=\"ag-filter-body\">\n            <div>\n                <input class=\"ag-filter-filter\" id=\"" + fieldId + "\" type=\"text\" placeholder=\"" + translate('filterOoo') + "\"/>\n            </div>\n             <div class=\"ag-filter-number-to\" id=\"" + filterNumberToPanelId + "\">\n                <input class=\"ag-filter-filter\" id=\"" + fieldToId + "\" type=\"text\" placeholder=\"" + translate('filterOoo') + "\"/>\n            </div>\n        </div>";
    };
    NumberFilter.prototype.initialiseFilterBodyUi = function (type) {
        _super.prototype.initialiseFilterBodyUi.call(this, type);
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.eFilterTextField = this.queryForHtmlInputElement("#filterText");
            this.addFilterChangedEventListeners(type, this.eFilterTextField, this.eFilterToTextField);
        }
        else {
            this.eFilterTextConditionField = this.queryForHtmlInputElement("#filterConditionText");
            this.addFilterChangedEventListeners(type, this.eFilterTextConditionField, this.eFilterToConditionText);
            this.setFilter(this.filterNumberCondition, baseFilter_1.FilterConditionType.CONDITION);
            this.setFilterTo(this.filterNumberConditionTo, baseFilter_1.FilterConditionType.CONDITION);
            this.setFilterType(this.filterCondition, baseFilter_1.FilterConditionType.CONDITION);
        }
    };
    NumberFilter.prototype.addFilterChangedEventListeners = function (type, filterElement, filterToElement) {
        var _this = this;
        var debounceMs = this.getDebounceMs(this.filterParams);
        var toDebounce = utils_1.Utils.debounce(function () { return _this.onTextFieldsChanged(type, filterElement, filterToElement); }, debounceMs);
        this.addDestroyableEventListener(filterElement, "input", toDebounce);
        this.addDestroyableEventListener(filterToElement, "input", toDebounce);
    };
    NumberFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    NumberFilter.prototype.comparator = function () {
        return function (left, right) {
            if (left === right) {
                return 0;
            }
            if (left < right) {
                return 1;
            }
            if (left > right) {
                return -1;
            }
        };
    };
    NumberFilter.prototype.onTextFieldsChanged = function (type, filterElement, filterToElement) {
        var newFilter = this.stringToFloat(filterElement.value);
        var newFilterTo = this.stringToFloat(filterToElement.value);
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            if (this.filterNumber !== newFilter || this.filterNumberTo !== newFilterTo) {
                this.filterNumber = newFilter;
                this.filterNumberTo = newFilterTo;
                this.onFilterChanged();
            }
        }
        else {
            if (this.filterNumberCondition !== newFilter || this.filterNumberConditionTo !== newFilterTo) {
                this.filterNumberCondition = newFilter;
                this.filterNumberConditionTo = newFilterTo;
                this.onFilterChanged();
            }
        }
    };
    NumberFilter.prototype.filterValues = function (type) {
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            return this.filter !== baseFilter_1.BaseFilter.IN_RANGE ?
                this.asNumber(this.filterNumber) :
                [this.asNumber(this.filterNumber), this.asNumber(this.filterNumberTo)];
        }
        return this.filterCondition !== baseFilter_1.BaseFilter.IN_RANGE ?
            this.asNumber(this.filterNumberCondition) :
            [this.asNumber(this.filterNumberCondition), this.asNumber(this.filterNumberConditionTo)];
    };
    NumberFilter.prototype.asNumber = function (value) {
        return utils_1.Utils.isNumeric(value) ? value : null;
    };
    NumberFilter.prototype.stringToFloat = function (value) {
        var filterText = utils_1.Utils.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilter;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        }
        else {
            newFilter = null;
        }
        return newFilter;
    };
    NumberFilter.prototype.setFilter = function (filter, type) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.filterNumber = filter;
            if (!this.eFilterTextField)
                return;
            this.eFilterTextField.value = filter;
        }
        else {
            this.filterNumberCondition = filter;
            if (!this.eFilterTextConditionField)
                return;
            this.eFilterTextConditionField.value = filter;
        }
    };
    NumberFilter.prototype.setFilterTo = function (filter, type) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.filterNumberTo = filter;
            if (!this.eFilterToTextField)
                return;
            this.eFilterToTextField.value = filter;
        }
        else {
            this.filterNumberConditionTo = filter;
            if (!this.eFilterToConditionText)
                return;
            this.eFilterToConditionText.value = filter;
        }
    };
    NumberFilter.prototype.getFilter = function (type) {
        return type === baseFilter_1.FilterConditionType.MAIN ? this.filterNumber : this.filterNumberCondition;
    };
    NumberFilter.prototype.serialize = function (type) {
        var filter = type === baseFilter_1.FilterConditionType.MAIN ? this.filter : this.filterCondition;
        var filterNumber = type === baseFilter_1.FilterConditionType.MAIN ? this.filterNumber : this.filterNumberCondition;
        var filterNumberTo = type === baseFilter_1.FilterConditionType.MAIN ? this.filterNumberTo : this.filterNumberConditionTo;
        return {
            type: filter ? filter : this.defaultFilter,
            filter: filterNumber,
            filterTo: filterNumberTo,
            filterType: 'number'
        };
    };
    NumberFilter.prototype.parse = function (model, type) {
        this.setFilterType(model.type, type);
        this.setFilter(model.filter, type);
        this.setFilterTo(model.filterTo, type);
    };
    NumberFilter.prototype.refreshFilterBodyUi = function (type) {
        var filterType = type === baseFilter_1.FilterConditionType.MAIN ? this.filter : this.filterCondition;
        var panel = type === baseFilter_1.FilterConditionType.MAIN ? this.eNumberToPanel : this.eNumberToConditionPanel;
        if (!panel)
            return;
        var visible = filterType === NumberFilter.IN_RANGE;
        utils_1.Utils.setVisible(panel, visible);
    };
    NumberFilter.prototype.resetState = function () {
        this.setFilterType(this.defaultFilter, baseFilter_1.FilterConditionType.MAIN);
        this.setFilter(null, baseFilter_1.FilterConditionType.MAIN);
        this.setFilterTo(null, baseFilter_1.FilterConditionType.MAIN);
        this.setFilterType(this.defaultFilter, baseFilter_1.FilterConditionType.CONDITION);
        this.setFilter(null, baseFilter_1.FilterConditionType.CONDITION);
        this.setFilterTo(null, baseFilter_1.FilterConditionType.CONDITION);
    };
    NumberFilter.prototype.setType = function (filterType, type) {
        this.setFilterType(filterType, type);
    };
    NumberFilter.LESS_THAN = 'lessThan'; //3;
    __decorate([
        componentAnnotations_1.QuerySelector('#filterNumberToPanel'),
        __metadata("design:type", HTMLElement)
    ], NumberFilter.prototype, "eNumberToPanel", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterNumberToPanelCondition'),
        __metadata("design:type", HTMLElement)
    ], NumberFilter.prototype, "eNumberToConditionPanel", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterToText'),
        __metadata("design:type", HTMLInputElement)
    ], NumberFilter.prototype, "eFilterToTextField", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterToConditionText'),
        __metadata("design:type", HTMLInputElement)
    ], NumberFilter.prototype, "eFilterToConditionText", void 0);
    return NumberFilter;
}(baseFilter_1.ScalarBaseFilter));
exports.NumberFilter = NumberFilter;
