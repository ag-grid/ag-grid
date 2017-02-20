/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.1.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var componentProvider_1 = require("../componentProvider");
var DateFilter = (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.filter = 'equals';
        return _this;
    }
    DateFilter.prototype.init = function (params) {
        this.filterParams = params;
        this.applyActive = params.apply === true;
        this.newRowsActionKeep = params.newRowsAction === 'keep';
        this.setTemplate(this.generateTemplate());
        if (this.applyActive) {
            this.addDestroyableEventListener(this.eApplyButton, "click", this.filterParams.filterChangedCallback);
        }
        else {
            this.getGui().removeChild(this.eApplyPanel);
        }
        var dateComponentParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };
        this.dateToComponent = this.componentProvider.newDateComponent(dateComponentParams);
        this.dateFromComponent = this.componentProvider.newDateComponent(dateComponentParams);
        this.addInDateComponents();
        this.setVisibilityOnDateToPanel();
        this.instantiate(this.context);
        this.addDestroyableEventListener(this.eTypeSelector, "change", this.onFilterTypeChanged.bind(this));
    };
    DateFilter.prototype.generateTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div>\n                    <div>\n                        <select class=\"ag-filter-select\" id=\"filterType\">\n                            <option value=\"" + DateFilter.EQUALS + "\">" + translate('equals', 'Equals') + "</option>\n                            <option value=\"" + DateFilter.NOT_EQUAL + "\">" + translate('notEqual', 'Not equal') + "</option>\n                            <option value=\"" + DateFilter.LESS_THAN + "\">" + translate('lessThan', 'Less than') + "</option>\n                            <option value=\"" + DateFilter.GREATER_THAN + "\">" + translate('greaterThan', 'Greater than') + "</option>\n                            <option value=\"" + DateFilter.IN_RANGE + "\">" + translate('inRange', 'In range') + "</option>\n                        </select>\n                    </div>\n                    <div class=\"ag-filter-date-from\" id=\"filterDateFromPanel\">\n                    </div>\n                    <div class=\"ag-filter-date-to\" id=\"filterDateToPanel\">\n                    </div>\n                    <div class=\"ag-filter-apply-panel\" id=\"applyPanel\">\n                        <button type=\"button\" id=\"applyButton\">" + translate('applyFilter', 'Apply Filter') + "</button>\n                    </div>\n                </div>";
    };
    DateFilter.prototype.onNewRowsLoaded = function () {
        if (!this.newRowsActionKeep) {
            this.setFilterType(DateFilter.EQUALS);
            this.setDateFrom(null);
            this.setDateTo(null);
        }
    };
    DateFilter.prototype.onDateChanged = function () {
        this.dateFrom = this.removeTimezone(this.dateFromComponent.getDate());
        this.dateTo = this.removeTimezone(this.dateToComponent.getDate());
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    };
    DateFilter.prototype.onFilterTypeChanged = function () {
        this.filter = this.eTypeSelector.value;
        this.setVisibilityOnDateToPanel();
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    };
    DateFilter.prototype.setVisibilityOnDateToPanel = function () {
        var visible = this.filter === DateFilter.IN_RANGE;
        utils_1.Utils.setVisible(this.eDateToPanel, visible);
    };
    DateFilter.prototype.addInDateComponents = function () {
        this.eDateFromPanel.appendChild(this.dateFromComponent.getGui());
        this.eDateToPanel.appendChild(this.dateToComponent.getGui());
        if (this.dateFromComponent.afterGuiAttached) {
            this.dateFromComponent.afterGuiAttached();
        }
        if (this.dateToComponent.afterGuiAttached) {
            this.dateToComponent.afterGuiAttached();
        }
    };
    DateFilter.prototype.isFilterActive = function () {
        if (this.filter === DateFilter.IN_RANGE) {
            return this.dateFrom != null && this.dateTo != null;
        }
        else {
            return this.dateFrom != null;
        }
    };
    DateFilter.prototype.doesFilterPass = function (params) {
        var value = this.filterParams.valueGetter(params.node);
        var comparator = null;
        if (this.filterParams.comparator) {
            comparator = this.filterParams.comparator;
        }
        else {
            comparator = this.defaultComparator.bind(this);
        }
        var compareDateFromResult = comparator(this.dateFrom, value);
        if (this.filter === DateFilter.EQUALS) {
            return compareDateFromResult === 0;
        }
        if (this.filter === DateFilter.GREATER_THAN) {
            return compareDateFromResult > 0;
        }
        if (this.filter === DateFilter.LESS_THAN) {
            return compareDateFromResult < 0;
        }
        if (this.filter === DateFilter.NOT_EQUAL) {
            return compareDateFromResult != 0;
        }
        //From now on the type is a range
        var compareDateToResult = comparator(this.dateTo, value);
        if (this.filter === DateFilter.IN_RANGE) {
            return compareDateFromResult > 0 && compareDateToResult < 0;
        }
        throw new Error('Unexpected type of date filter!: ' + this.filter);
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
    DateFilter.prototype.getModel = function () {
        if (this.isFilterActive()) {
            return {
                dateTo: utils_1.Utils.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-"),
                dateFrom: utils_1.Utils.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-"),
                type: this.filter
            };
        }
        else {
            return null;
        }
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
    DateFilter.prototype.setFilterType = function (filterType) {
        this.filter = filterType;
        this.eTypeSelector.value = filterType;
    };
    DateFilter.prototype.setModel = function (model) {
        if (model) {
            this.setDateFrom(model.dateFrom);
            this.setDateTo(model.dateTo);
            this.setFilterType(model.type);
        }
        else {
            this.setDateFrom(null);
            this.setDateTo(null);
            this.setFilterType("equals");
        }
        this.setVisibilityOnDateToPanel();
    };
    DateFilter.prototype.removeTimezone = function (from) {
        if (!from)
            return null;
        return new Date(from.getFullYear(), from.getMonth(), from.getDate());
    };
    return DateFilter;
}(component_1.Component));
DateFilter.EQUALS = 'equals';
DateFilter.NOT_EQUAL = 'notEqual';
DateFilter.LESS_THAN = 'lessThan';
DateFilter.GREATER_THAN = 'greaterThan';
DateFilter.IN_RANGE = 'inRange';
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], DateFilter.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('componentProvider'),
    __metadata("design:type", componentProvider_1.ComponentProvider)
], DateFilter.prototype, "componentProvider", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], DateFilter.prototype, "context", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#filterDateFromPanel'),
    __metadata("design:type", HTMLElement)
], DateFilter.prototype, "eDateFromPanel", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#filterDateToPanel'),
    __metadata("design:type", HTMLElement)
], DateFilter.prototype, "eDateToPanel", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#applyPanel'),
    __metadata("design:type", HTMLElement)
], DateFilter.prototype, "eApplyPanel", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#applyButton'),
    __metadata("design:type", HTMLElement)
], DateFilter.prototype, "eApplyButton", void 0);
__decorate([
    componentAnnotations_1.QuerySelector('#filterType'),
    __metadata("design:type", HTMLSelectElement)
], DateFilter.prototype, "eTypeSelector", void 0);
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
