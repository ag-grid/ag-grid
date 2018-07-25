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
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var utils_1 = require("../utils");
var baseFilter_1 = require("./baseFilter");
var context_1 = require("../context/context");
var componentRecipes_1 = require("../components/framework/componentRecipes");
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
    DateFilter.prototype.bodyTemplate = function (type) {
        var fromPanelId = type == baseFilter_1.FilterConditionType.MAIN ? "filterDateFromPanel" : "filterDateFromConditionPanel";
        var toPanelId = type == baseFilter_1.FilterConditionType.MAIN ? "filterDateToPanel" : "filterDateToConditionPanel";
        return "<div class=\"ag-filter-body\">\n                    <div class=\"ag-filter-date-from\" id=\"" + fromPanelId + "\">\n                    </div>\n                    <div class=\"ag-filter-date-to\" id=\"" + toPanelId + "\">\n                    </div>\n                </div>";
    };
    DateFilter.prototype.initialiseFilterBodyUi = function (type) {
        _super.prototype.initialiseFilterBodyUi.call(this, type);
        this.createComponents(type);
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.setDateFrom_date(this.dateFrom, baseFilter_1.FilterConditionType.MAIN);
            this.setDateTo_date(this.dateTo, baseFilter_1.FilterConditionType.MAIN);
            this.setFilterType(this.filterCondition, baseFilter_1.FilterConditionType.MAIN);
        }
        else {
            this.setDateFrom_date(this.dateFromCondition, baseFilter_1.FilterConditionType.CONDITION);
            this.setDateTo_date(this.dateToCondition, baseFilter_1.FilterConditionType.CONDITION);
            this.setFilterType(this.filterCondition, baseFilter_1.FilterConditionType.CONDITION);
        }
    };
    DateFilter.prototype.createComponents = function (type) {
        var _this = this;
        var dateComponentParams = {
            onDateChanged: function () { _this.onDateChanged(type); },
            filterParams: this.filterParams
        };
        this.componentRecipes.newDateComponent(dateComponentParams).then(function (dateToComponent) {
            if (type === baseFilter_1.FilterConditionType.MAIN) {
                _this.dateToComponent = dateToComponent;
            }
            else {
                _this.dateToConditionComponent = dateToComponent;
            }
            var dateToElement = dateToComponent.getGui();
            if (type === baseFilter_1.FilterConditionType.MAIN) {
                _this.eDateToPanel.appendChild(dateToElement);
                if (_this.dateToComponent.afterGuiAttached) {
                    _this.dateToComponent.afterGuiAttached();
                }
            }
            else {
                _this.eDateToConditionPanel.appendChild(dateToElement);
                if (_this.dateToConditionComponent.afterGuiAttached) {
                    _this.dateToConditionComponent.afterGuiAttached();
                }
            }
        });
        this.componentRecipes.newDateComponent(dateComponentParams).then(function (dateComponent) {
            if (type === baseFilter_1.FilterConditionType.MAIN) {
                _this.dateFromComponent = dateComponent;
            }
            else {
                _this.dateFromConditionComponent = dateComponent;
            }
            var dateFromElement = dateComponent.getGui();
            if (type === baseFilter_1.FilterConditionType.MAIN) {
                _this.eDateFromPanel.appendChild(dateFromElement);
                if (_this.dateFromComponent.afterGuiAttached) {
                    _this.dateFromComponent.afterGuiAttached();
                }
            }
            else {
                _this.eDateFromConditionPanel.appendChild(dateFromElement);
                if (_this.dateFromConditionComponent.afterGuiAttached) {
                    _this.dateFromConditionComponent.afterGuiAttached();
                }
            }
        });
    };
    DateFilter.prototype.onDateChanged = function (type) {
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.dateFrom = DateFilter.removeTimezone(this.dateFromComponent.getDate());
            this.dateTo = DateFilter.removeTimezone(this.dateToComponent.getDate());
        }
        else {
            this.dateFromCondition = DateFilter.removeTimezone(this.dateFromComponent.getDate());
            this.dateToCondition = DateFilter.removeTimezone(this.dateToComponent.getDate());
        }
        this.onFilterChanged();
    };
    DateFilter.prototype.refreshFilterBodyUi = function (type) {
        var panel;
        var filterTypeValue;
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            panel = this.eDateToPanel;
            filterTypeValue = this.filter;
        }
        else {
            panel = this.eDateToConditionPanel;
            filterTypeValue = this.filterCondition;
        }
        if (!panel)
            return;
        var visible = filterTypeValue === baseFilter_1.BaseFilter.IN_RANGE;
        utils_1.Utils.setVisible(panel, visible);
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
        return cellValue != null ? 0 : -1;
    };
    DateFilter.prototype.serialize = function (type) {
        var dateToComponent = type === baseFilter_1.FilterConditionType.MAIN ? this.dateToComponent : this.dateToConditionComponent;
        var dateFromComponent = type === baseFilter_1.FilterConditionType.MAIN ? this.dateFromComponent : this.dateFromConditionComponent;
        var filterType = type === baseFilter_1.FilterConditionType.MAIN ? this.filter : this.filterCondition;
        return {
            dateTo: utils_1.Utils.serializeDateToYyyyMmDd(dateToComponent.getDate(), "-"),
            dateFrom: utils_1.Utils.serializeDateToYyyyMmDd(dateFromComponent.getDate(), "-"),
            type: filterType ? filterType : this.defaultFilter,
            filterType: 'date'
        };
    };
    DateFilter.prototype.filterValues = function (type) {
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            if (!this.dateFromComponent)
                return null;
            return this.filter !== baseFilter_1.BaseFilter.IN_RANGE ?
                this.dateFromComponent.getDate() :
                [this.dateFromComponent.getDate(), this.dateToComponent.getDate()];
        }
        if (!this.dateFromConditionComponent)
            return null;
        return this.filterCondition !== baseFilter_1.BaseFilter.IN_RANGE ?
            this.dateFromConditionComponent.getDate() :
            [this.dateFromConditionComponent.getDate(), this.dateToConditionComponent.getDate()];
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
    DateFilter.prototype.setDateFrom = function (date, type) {
        var parsedDate = utils_1.Utils.parseYyyyMmDdToDate(date, "-");
        this.setDateFrom_date(parsedDate, type);
    };
    DateFilter.prototype.setDateFrom_date = function (parsedDate, type) {
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.dateFrom = parsedDate;
            if (!this.dateFromComponent)
                return;
            this.dateFromComponent.setDate(this.dateFrom);
        }
        else {
            this.dateFromCondition = parsedDate;
            if (!this.dateFromConditionComponent)
                return;
            this.dateFromConditionComponent.setDate(this.dateFromCondition);
        }
    };
    DateFilter.prototype.setDateTo = function (date, type) {
        var parsedDate = utils_1.Utils.parseYyyyMmDdToDate(date, "-");
        this.setDateTo_date(parsedDate, type);
    };
    DateFilter.prototype.setDateTo_date = function (parsedDate, type) {
        if (type === baseFilter_1.FilterConditionType.MAIN) {
            this.dateTo = parsedDate;
            if (!this.dateToComponent)
                return;
            this.dateToComponent.setDate(this.dateTo);
        }
        else {
            this.dateToCondition = parsedDate;
            if (!this.dateToConditionComponent)
                return;
            this.dateToConditionComponent.setDate(this.dateToCondition);
        }
    };
    DateFilter.prototype.resetState = function () {
        this.setDateFrom(null, baseFilter_1.FilterConditionType.MAIN);
        this.setDateTo(null, baseFilter_1.FilterConditionType.MAIN);
        this.setFilterType(this.defaultFilter, baseFilter_1.FilterConditionType.MAIN);
        this.setDateFrom(null, baseFilter_1.FilterConditionType.CONDITION);
        this.setDateTo(null, baseFilter_1.FilterConditionType.CONDITION);
        this.setFilterType(this.defaultFilter, baseFilter_1.FilterConditionType.MAIN);
    };
    DateFilter.prototype.parse = function (model, type) {
        this.setDateFrom(model.dateFrom, type);
        this.setDateTo(model.dateTo, type);
        this.setFilterType(model.type, type);
    };
    DateFilter.prototype.setType = function (filterType, type) {
        this.setFilterType(filterType, type);
    };
    DateFilter.removeTimezone = function (from) {
        if (!from) {
            return null;
        }
        return new Date(from.getFullYear(), from.getMonth(), from.getDate());
    };
    __decorate([
        context_1.Autowired('componentRecipes'),
        __metadata("design:type", componentRecipes_1.ComponentRecipes)
    ], DateFilter.prototype, "componentRecipes", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterDateFromPanel'),
        __metadata("design:type", HTMLElement)
    ], DateFilter.prototype, "eDateFromPanel", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterDateFromConditionPanel'),
        __metadata("design:type", HTMLElement)
    ], DateFilter.prototype, "eDateFromConditionPanel", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterDateToPanel'),
        __metadata("design:type", HTMLElement)
    ], DateFilter.prototype, "eDateToPanel", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('#filterDateToConditionPanel'),
        __metadata("design:type", HTMLElement)
    ], DateFilter.prototype, "eDateToConditionPanel", void 0);
    return DateFilter;
}(baseFilter_1.ScalarBaseFilter));
exports.DateFilter = DateFilter;
var DefaultDateComponent = (function (_super) {
    __extends(DefaultDateComponent, _super);
    function DefaultDateComponent() {
        return _super.call(this, "<input class=\"ag-filter-filter\" type=\"text\" placeholder=\"yyyy-mm-dd\">") || this;
    }
    DefaultDateComponent.prototype.init = function (params) {
        this.eDateInput = this.getGui();
        if (utils_1.Utils.isBrowserChrome() || params.filterParams.browserDatePicker) {
            if (utils_1.Utils.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            }
            else {
                this.eDateInput.type = 'date';
            }
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
