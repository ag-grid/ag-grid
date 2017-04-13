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
    NumberFilter.prototype.bodyTemplate = function () {
        var translate = this.translate.bind(this);
        return "<div class=\"ag-filter-body\">\n            <div>\n                <input class=\"ag-filter-filter\" id=\"filterText\" type=\"text\" placeholder=\"" + translate('filterOoo') + "\"/>\n            </div>\n             <div class=\"ag-filter-number-to\" id=\"filterNumberToPanel\">\n                <input class=\"ag-filter-filter\" id=\"filterToText\" type=\"text\" placeholder=\"" + translate('filterOoo') + "\"/>\n            </div>\n        </div>";
    };
    NumberFilter.prototype.initialiseFilterBodyUi = function () {
        this.filterNumber = null;
        this.setFilterType(NumberFilter.EQUALS);
        this.eFilterTextField = this.getGui().querySelector("#filterText");
        this.addDestroyableEventListener(this.eFilterTextField, "input", this.onTextFieldsChanged.bind(this));
        this.addDestroyableEventListener(this.eFilterToTextField, "input", this.onTextFieldsChanged.bind(this));
    };
    NumberFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    NumberFilter.prototype.comparator = function () {
        return function (left, right) {
            if (left === right)
                return 0;
            if (left < right)
                return 1;
            if (left > right)
                return -1;
        };
    };
    NumberFilter.prototype.onTextFieldsChanged = function () {
        var newFilter = this.stringToFloat(this.eFilterTextField.value);
        var newFilterTo = this.stringToFloat(this.eFilterToTextField.value);
        if (this.filterNumber !== newFilter || this.filterNumberTo !== newFilterTo) {
            this.filterNumber = newFilter;
            this.filterNumberTo = newFilterTo;
            this.onFilterChanged();
        }
    };
    NumberFilter.prototype.filterValues = function () {
        return this.filter !== baseFilter_1.BaseFilter.IN_RANGE ?
            this.asNumber(this.filterNumber) :
            [this.asNumber(this.filterNumber), this.asNumber(this.filterNumberTo)];
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
    NumberFilter.prototype.setFilter = function (filter) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumber = filter;
        this.eFilterTextField.value = filter;
    };
    NumberFilter.prototype.setFilterTo = function (filter) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumberTo = filter;
        this.eFilterToTextField.value = filter;
    };
    NumberFilter.prototype.getFilter = function () {
        return this.filterNumber;
    };
    NumberFilter.prototype.serialize = function () {
        return {
            type: this.filter,
            filter: this.filterNumber,
            filterTo: this.filterNumberTo,
            filterType: 'number'
        };
    };
    NumberFilter.prototype.parse = function (model) {
        this.setFilterType(model.type);
        this.setFilter(model.filter);
        this.setFilterTo(model.filterTo);
    };
    NumberFilter.prototype.refreshFilterBodyUi = function () {
        var visible = this.filter === NumberFilter.IN_RANGE;
        utils_1.Utils.setVisible(this.eNumberToPanel, visible);
    };
    NumberFilter.prototype.resetState = function () {
        this.setFilterType(baseFilter_1.BaseFilter.EQUALS);
        this.setFilter(null);
        this.setFilterTo(null);
    };
    NumberFilter.prototype.setType = function (filterType) {
        this.setFilterType(filterType);
    };
    return NumberFilter;
}(baseFilter_1.ScalarBaseFilter));
NumberFilter.EQUALS = 'equals'; // 1;
NumberFilter.NOT_EQUAL = 'notEqual'; //2;
NumberFilter.LESS_THAN_OR_EQUAL = 'lessThanOrEqual'; //4;
NumberFilter.GREATER_THAN = 'greaterThan'; //5;
NumberFilter.GREATER_THAN_OR_EQUAL = 'greaterThan'; //6;
NumberFilter.IN_RANGE = 'inRange';
NumberFilter.LESS_THAN = 'lessThan'; //3;
__decorate([
    componentAnnotations_1.QuerySelector('#filterNumberToPanel'),
    __metadata("design:type", HTMLElement)
], NumberFilter.prototype, "eNumberToPanel", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#filterToText'),
    __metadata("design:type", HTMLInputElement)
], NumberFilter.prototype, "eFilterToTextField", void 0);
exports.NumberFilter = NumberFilter;
