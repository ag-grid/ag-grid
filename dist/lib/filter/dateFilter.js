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
var utils_1 = require("../utils");
var baseFilter_1 = require("./baseFilter");
var context_1 = require("../context/context");
var componentProvider_1 = require("../componentProvider");
var DateFilter = (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFilter.prototype.modelFromFloatingFilter = function (from) {
        return {
            dateFrom: from,
            dateTo: this.getDateTo(),
            type: this.filter,
            filterType: 'date'
        };
    };
    DateFilter.prototype.getApplicableFilterTypes = function () {
        return [baseFilter_1.BaseFilter.EQUALS, baseFilter_1.BaseFilter.GREATER_THAN, baseFilter_1.BaseFilter.LESS_THAN, baseFilter_1.BaseFilter.NOT_EQUAL, baseFilter_1.BaseFilter.IN_RANGE];
    };
    DateFilter.prototype.bodyTemplate = function () {
        return "<div class=\"ag-filter-body\">\n                    <div class=\"ag-filter-date-from\" id=\"filterDateFromPanel\">\n                    </div>\n                    <div class=\"ag-filter-date-to\" id=\"filterDateToPanel\">\n                    </div>\n                </div>";
    };
    DateFilter.prototype.initialiseFilterBodyUi = function () {
        var dateComponentParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };
        this.dateToComponent = this.componentProvider.newDateComponent(dateComponentParams);
        this.dateFromComponent = this.componentProvider.newDateComponent(dateComponentParams);
        this.eDateFromPanel.appendChild(this.dateFromComponent.getGui());
        this.eDateToPanel.appendChild(this.dateToComponent.getGui());
        if (this.dateFromComponent.afterGuiAttached) {
            this.dateFromComponent.afterGuiAttached();
        }
        if (this.dateToComponent.afterGuiAttached) {
            this.dateToComponent.afterGuiAttached();
        }
    };
    DateFilter.prototype.onDateChanged = function () {
        this.dateFrom = DateFilter.removeTimezone(this.dateFromComponent.getDate());
        this.dateTo = DateFilter.removeTimezone(this.dateToComponent.getDate());
        this.onFilterChanged();
    };
    DateFilter.prototype.refreshFilterBodyUi = function () {
        var visible = this.filter === baseFilter_1.BaseFilter.IN_RANGE;
        utils_1.Utils.setVisible(this.eDateToPanel, visible);
    };
    DateFilter.prototype.comparator = function () {
        return this.filterParams.comparator ? this.filterParams.comparator : this.defaultComparator.bind(this);
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
        return 0;
    };
    DateFilter.prototype.serialize = function () {
        return {
            dateTo: utils_1.Utils.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-"),
            dateFrom: utils_1.Utils.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-"),
            type: this.filter,
            filterType: 'date'
        };
    };
    DateFilter.prototype.filterValues = function () {
        return this.filter !== baseFilter_1.BaseFilter.IN_RANGE ?
            this.dateFromComponent.getDate() :
            [this.dateFromComponent.getDate(), this.dateToComponent.getDate()];
    };
    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    DateFilter.prototype.getDateFrom = function () {
        return utils_1.Utils.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-");
    };
    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    DateFilter.prototype.getDateTo = function () {
        return utils_1.Utils.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-");
    };
    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    DateFilter.prototype.getFilterType = function () {
        return this.filter;
    };
    DateFilter.prototype.setDateFrom = function (date) {
        this.dateFrom = utils_1.Utils.parseYyyyMmDdToDate(date, "-");
        this.dateFromComponent.setDate(this.dateFrom);
    };
    DateFilter.prototype.setDateTo = function (date) {
        this.dateTo = utils_1.Utils.parseYyyyMmDdToDate(date, "-");
        this.dateToComponent.setDate(this.dateTo);
    };
    DateFilter.prototype.resetState = function () {
        this.setDateFrom(null);
        this.setDateTo(null);
        this.setFilterType("equals");
    };
    DateFilter.prototype.parse = function (model) {
        this.setDateFrom(model.dateFrom);
        this.setDateTo(model.dateTo);
        this.setFilterType(model.type);
    };
    DateFilter.prototype.setType = function (filterType) {
        this.setFilterType(filterType);
    };
    DateFilter.removeTimezone = function (from) {
        if (!from)
            return null;
        return new Date(from.getFullYear(), from.getMonth(), from.getDate());
    };
    return DateFilter;
}(baseFilter_1.ScalarBaseFilter));
__decorate([
    context_1.Autowired('componentProvider'),
    __metadata("design:type", componentProvider_1.ComponentProvider)
], DateFilter.prototype, "componentProvider", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#filterDateFromPanel'),
    __metadata("design:type", HTMLElement)
], DateFilter.prototype, "eDateFromPanel", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#filterDateToPanel'),
    __metadata("design:type", HTMLElement)
], DateFilter.prototype, "eDateToPanel", void 0);
exports.DateFilter = DateFilter;
var DefaultDateComponent = (function (_super) {
    __extends(DefaultDateComponent, _super);
    function DefaultDateComponent() {
        return _super.call(this, "<input class=\"ag-filter-filter\" type=\"text\" placeholder=\"yyyy-mm-dd\">") || this;
    }
    DefaultDateComponent.prototype.init = function (params) {
        this.eDateInput = this.getGui();
        if (utils_1.Utils.isBrowserChrome()) {
            this.eDateInput.type = 'date';
        }
        this.listener = params.onDateChanged;
        this.addGuiEventListener('input', this.listener);
    };
    DefaultDateComponent.prototype.getDate = function () {
        return utils_1.Utils.parseYyyyMmDdToDate(this.eDateInput.value, "-");
    };
    DefaultDateComponent.prototype.setDate = function (date) {
        this.eDateInput.value = utils_1.Utils.serializeDateToYyyyMmDd(date, "-");
    };
    return DefaultDateComponent;
}(component_1.Component));
exports.DefaultDateComponent = DefaultDateComponent;
