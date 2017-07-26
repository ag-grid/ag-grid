/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
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
var context_1 = require("../context/context");
var dateFilter_1 = require("./dateFilter");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var utils_1 = require("../utils");
var componentProvider_1 = require("../componentProvider");
var component_1 = require("../widgets/component");
var constants_1 = require("../constants");
var InputTextFloatingFilterComp = (function (_super) {
    __extends(InputTextFloatingFilterComp, _super);
    function InputTextFloatingFilterComp() {
        var _this = _super.call(this, "<div><input  ref=\"eColumnFloatingFilter\" class=\"ag-floating-filter-input\"></div>") || this;
        _this.lastKnownModel = null;
        return _this;
    }
    InputTextFloatingFilterComp.prototype.init = function (params) {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        var debounceMs = params.debounceMs != null ? params.debounceMs : 500;
        var toDebounce = utils_1._.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'input', toDebounce);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keypress', toDebounce);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keydown', toDebounce);
        var columnDef = params.column.getDefinition();
        if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions.length === 1 && columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eColumnFloatingFilter.readOnly = true;
        }
    };
    InputTextFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        if (this.equalModels(this.lastKnownModel, parentModel))
            return;
        this.lastKnownModel = parentModel;
        var incomingTextValue = this.asFloatingFilterText(parentModel);
        if (incomingTextValue === this.eColumnFloatingFilter.value)
            return;
        this.eColumnFloatingFilter.value = incomingTextValue;
    };
    InputTextFloatingFilterComp.prototype.syncUpWithParentFilter = function (e) {
        var model = this.asParentModel();
        if (this.equalModels(this.lastKnownModel, model))
            return;
        var modelUpdated = null;
        if (utils_1._.isKeyPressed(e, constants_1.Constants.KEY_ENTER)) {
            modelUpdated = this.onFloatingFilterChanged({
                model: model,
                apply: true
            });
        }
        else {
            modelUpdated = this.onFloatingFilterChanged({
                model: model,
                apply: false
            });
        }
        if (modelUpdated) {
            this.lastKnownModel = model;
        }
    };
    InputTextFloatingFilterComp.prototype.equalModels = function (left, right) {
        if (utils_1._.referenceCompare(left, right))
            return true;
        if (!left || !right)
            return false;
        if (Array.isArray(left) || Array.isArray(right))
            return false;
        return (utils_1._.referenceCompare(left.type, right.type) &&
            utils_1._.referenceCompare(left.filter, right.filter) &&
            utils_1._.referenceCompare(left.filterTo, right.filterTo) &&
            utils_1._.referenceCompare(left.filterType, right.filterType));
    };
    __decorate([
        componentAnnotations_1.RefSelector('eColumnFloatingFilter'),
        __metadata("design:type", HTMLInputElement)
    ], InputTextFloatingFilterComp.prototype, "eColumnFloatingFilter", void 0);
    return InputTextFloatingFilterComp;
}(component_1.Component));
exports.InputTextFloatingFilterComp = InputTextFloatingFilterComp;
var TextFloatingFilterComp = (function (_super) {
    __extends(TextFloatingFilterComp, _super);
    function TextFloatingFilterComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextFloatingFilterComp.prototype.asFloatingFilterText = function (parentModel) {
        if (!parentModel)
            return '';
        return parentModel.filter;
    };
    TextFloatingFilterComp.prototype.asParentModel = function () {
        var currentParentModel = this.currentParentModel();
        return {
            type: currentParentModel.type,
            filter: this.eColumnFloatingFilter.value,
            filterType: 'text'
        };
    };
    return TextFloatingFilterComp;
}(InputTextFloatingFilterComp));
exports.TextFloatingFilterComp = TextFloatingFilterComp;
var DateFloatingFilterComp = (function (_super) {
    __extends(DateFloatingFilterComp, _super);
    function DateFloatingFilterComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastKnownModel = null;
        return _this;
    }
    DateFloatingFilterComp.prototype.init = function (params) {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        var debounceMs = params.debounceMs != null ? params.debounceMs : 500;
        var toDebounce = utils_1._.debounce(this.onDateChanged.bind(this), debounceMs);
        var dateComponentParams = {
            onDateChanged: toDebounce
        };
        this.dateComponent = this.componentProvider.newDateComponent(dateComponentParams);
        var body = utils_1._.loadTemplate("<div></div>");
        body.appendChild(this.dateComponent.getGui());
        this.setTemplateFromElement(body);
    };
    DateFloatingFilterComp.prototype.onDateChanged = function () {
        var parentModel = this.currentParentModel();
        var model = this.asParentModel();
        if (this.equalModels(parentModel, model))
            return;
        this.onFloatingFilterChanged({
            model: model,
            apply: true
        });
        this.lastKnownModel = model;
    };
    DateFloatingFilterComp.prototype.equalModels = function (left, right) {
        if (utils_1._.referenceCompare(left, right))
            return true;
        if (!left || !right)
            return false;
        if (Array.isArray(left) || Array.isArray(right))
            return false;
        return (utils_1._.referenceCompare(left.type, right.type) &&
            utils_1._.referenceCompare(left.dateFrom, right.dateFrom) &&
            utils_1._.referenceCompare(left.dateTo, right.dateTo) &&
            utils_1._.referenceCompare(left.filterType, right.filterType));
    };
    DateFloatingFilterComp.prototype.asParentModel = function () {
        var currentParentModel = this.currentParentModel();
        var filterValueDate = this.dateComponent.getDate();
        var filterValueText = utils_1._.serializeDateToYyyyMmDd(dateFilter_1.DateFilter.removeTimezone(filterValueDate), "-");
        return {
            type: currentParentModel.type,
            dateFrom: filterValueText,
            dateTo: currentParentModel ? currentParentModel.dateTo : null,
            filterType: 'date'
        };
    };
    DateFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.lastKnownModel = parentModel;
        if (!parentModel || !parentModel.dateFrom) {
            this.dateComponent.setDate(null);
            return;
        }
        this.dateComponent.setDate(utils_1._.parseYyyyMmDdToDate(parentModel.dateFrom, '-'));
    };
    __decorate([
        context_1.Autowired('componentProvider'),
        __metadata("design:type", componentProvider_1.ComponentProvider)
    ], DateFloatingFilterComp.prototype, "componentProvider", void 0);
    return DateFloatingFilterComp;
}(component_1.Component));
exports.DateFloatingFilterComp = DateFloatingFilterComp;
var NumberFloatingFilterComp = (function (_super) {
    __extends(NumberFloatingFilterComp, _super);
    function NumberFloatingFilterComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilterComp.prototype.asFloatingFilterText = function (parentModel) {
        var rawParentModel = this.currentParentModel();
        if (parentModel == null && rawParentModel == null)
            return '';
        if (parentModel == null && rawParentModel != null && rawParentModel.type !== 'inRange') {
            this.eColumnFloatingFilter.readOnly = false;
            return '';
        }
        if (rawParentModel != null && rawParentModel.type === 'inRange') {
            this.eColumnFloatingFilter.readOnly = true;
            var number_1 = this.asNumber(rawParentModel.filter);
            var numberTo = this.asNumber(rawParentModel.filterTo);
            return (number_1 ? number_1 + '' : '') +
                '-' +
                (numberTo ? numberTo + '' : '');
        }
        var number = this.asNumber(parentModel.filter);
        this.eColumnFloatingFilter.readOnly = false;
        return number != null ? number + '' : '';
    };
    NumberFloatingFilterComp.prototype.asParentModel = function () {
        var currentParentModel = this.currentParentModel();
        var filterValueNumber = this.asNumber(this.eColumnFloatingFilter.value);
        var filterValueText = this.eColumnFloatingFilter.value;
        var modelFilterValue = null;
        if (filterValueNumber == null && filterValueText === '') {
            modelFilterValue = null;
        }
        else if (filterValueNumber == null) {
            modelFilterValue = currentParentModel.filter;
        }
        else {
            modelFilterValue = filterValueNumber;
        }
        return {
            type: currentParentModel.type,
            filter: modelFilterValue,
            filterTo: !currentParentModel ? null : currentParentModel.filterTo,
            filterType: 'number'
        };
    };
    NumberFloatingFilterComp.prototype.asNumber = function (value) {
        if (value == null)
            return null;
        if (value === '')
            return null;
        var asNumber = Number(value);
        var invalidNumber = !utils_1._.isNumeric(asNumber);
        return invalidNumber ? null : asNumber;
    };
    return NumberFloatingFilterComp;
}(InputTextFloatingFilterComp));
exports.NumberFloatingFilterComp = NumberFloatingFilterComp;
var SetFloatingFilterComp = (function (_super) {
    __extends(SetFloatingFilterComp, _super);
    function SetFloatingFilterComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetFloatingFilterComp.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.eColumnFloatingFilter.readOnly = true;
    };
    SetFloatingFilterComp.prototype.asFloatingFilterText = function (parentModel) {
        if (!parentModel || parentModel.length === 0)
            return '';
        var arrayToDisplay = parentModel.length > 10 ? parentModel.slice(0, 10).concat(['...']) : parentModel;
        return "(" + parentModel.length + ") " + arrayToDisplay.join(",");
    };
    SetFloatingFilterComp.prototype.asParentModel = function () {
        if (this.eColumnFloatingFilter.value == null || this.eColumnFloatingFilter.value === '')
            return null;
        return this.eColumnFloatingFilter.value.split(",");
    };
    return SetFloatingFilterComp;
}(InputTextFloatingFilterComp));
exports.SetFloatingFilterComp = SetFloatingFilterComp;
var ReadModelAsStringFloatingFilterComp = (function (_super) {
    __extends(ReadModelAsStringFloatingFilterComp, _super);
    function ReadModelAsStringFloatingFilterComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReadModelAsStringFloatingFilterComp.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.eColumnFloatingFilter.readOnly = true;
    };
    ReadModelAsStringFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.eColumnFloatingFilter.value = this.asFloatingFilterText(this.currentParentModel());
    };
    ReadModelAsStringFloatingFilterComp.prototype.asFloatingFilterText = function (parentModel) {
        return parentModel;
    };
    ReadModelAsStringFloatingFilterComp.prototype.asParentModel = function () {
        return null;
    };
    return ReadModelAsStringFloatingFilterComp;
}(InputTextFloatingFilterComp));
exports.ReadModelAsStringFloatingFilterComp = ReadModelAsStringFloatingFilterComp;
