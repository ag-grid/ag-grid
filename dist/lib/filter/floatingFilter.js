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
        return _super.call(this, "<div><input  ref=\"eColumnFloatingFilter\" class=\"ag-floating-filter-input\"></div>") || this;
    }
    InputTextFloatingFilterComp.prototype.init = function (params) {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'input', this.syncUpWithParentFilter.bind(this));
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keypress', this.checkApply.bind(this));
    };
    InputTextFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.eColumnFloatingFilter.value = this.asFloatingFilterText(parentModel);
    };
    InputTextFloatingFilterComp.prototype.syncUpWithParentFilter = function () {
        this.onFloatingFilterChanged({
            model: this.asParentModel(),
            apply: false
        });
    };
    InputTextFloatingFilterComp.prototype.checkApply = function (e) {
        if (utils_1._.isKeyPressed(e, constants_1.Constants.KEY_ENTER)) {
            this.onFloatingFilterChanged({
                model: this.asParentModel(),
                apply: true
            });
        }
    };
    return InputTextFloatingFilterComp;
}(component_1.Component));
__decorate([
    componentAnnotations_1.RefSelector('eColumnFloatingFilter'),
    __metadata("design:type", HTMLInputElement)
], InputTextFloatingFilterComp.prototype, "eColumnFloatingFilter", void 0);
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
            type: !currentParentModel ? 'contains' : currentParentModel.type,
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
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFloatingFilterComp.prototype.init = function (params) {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        var dateComponentParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };
        this.dateComponent = this.componentProvider.newDateComponent(dateComponentParams);
        var body = utils_1._.loadTemplate("<div></div>");
        body.appendChild(this.dateComponent.getGui());
        this.setTemplateFromElement(body);
    };
    DateFloatingFilterComp.prototype.onDateChanged = function () {
        var parentModel = this.currentParentModel();
        var rawDate = this.dateComponent.getDate();
        if (!rawDate || typeof rawDate.getMonth !== 'function') {
            this.onFloatingFilterChanged(null);
            return;
        }
        var date = utils_1._.serializeDateToYyyyMmDd(dateFilter_1.DateFilter.removeTimezone(rawDate), "-");
        var type = 'equals';
        var dateTo = null;
        if (parentModel) {
            type = parentModel.type;
            dateTo = parentModel.dateTo;
        }
        this.onFloatingFilterChanged({
            model: {
                type: type,
                dateFrom: date,
                dateTo: dateTo,
                filterType: 'date'
            },
            apply: true
        });
    };
    DateFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        if (!parentModel || !parentModel.dateFrom) {
            this.dateComponent.setDate(null);
            return;
        }
        this.dateComponent.setDate(utils_1._.parseYyyyMmDdToDate(parentModel.dateFrom, '-'));
    };
    return DateFloatingFilterComp;
}(component_1.Component));
__decorate([
    context_1.Autowired('componentProvider'),
    __metadata("design:type", componentProvider_1.ComponentProvider)
], DateFloatingFilterComp.prototype, "componentProvider", void 0);
exports.DateFloatingFilterComp = DateFloatingFilterComp;
var NumberFloatingFilterComp = (function (_super) {
    __extends(NumberFloatingFilterComp, _super);
    function NumberFloatingFilterComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilterComp.prototype.asFloatingFilterText = function (parentModel) {
        var rawParentModel = this.currentParentModel();
        if (!parentModel && !rawParentModel)
            return '';
        if (!parentModel && rawParentModel && rawParentModel.type !== 'inRange') {
            this.eColumnFloatingFilter.readOnly = false;
            return '';
        }
        if (rawParentModel && rawParentModel.type === 'inRange') {
            this.eColumnFloatingFilter.readOnly = true;
            var number_1 = this.asNumber(rawParentModel.filter);
            var numberTo = this.asNumber(rawParentModel.filterTo);
            return (number_1 ? number_1 + '' : '') +
                '-' +
                (numberTo ? numberTo + '' : '');
        }
        var number = this.asNumber(parentModel.filter);
        this.eColumnFloatingFilter.readOnly = false;
        return number ? number + '' : '';
    };
    NumberFloatingFilterComp.prototype.asParentModel = function () {
        var currentParentModel = this.currentParentModel();
        var filterValueNumber = this.asNumber(this.eColumnFloatingFilter.value);
        var filterValueText = this.eColumnFloatingFilter.value;
        var modelFilterValue = null;
        if (!filterValueNumber && filterValueText === '') {
            modelFilterValue = null;
        }
        else if (!filterValueNumber) {
            modelFilterValue = currentParentModel.filter;
        }
        else {
            modelFilterValue = filterValueNumber;
        }
        return {
            type: !currentParentModel ? 'equals' : currentParentModel.type,
            filter: modelFilterValue,
            filterTo: !currentParentModel ? null : currentParentModel.filterTo,
            filterType: 'number'
        };
    };
    NumberFloatingFilterComp.prototype.asNumber = function (value) {
        var invalidNumber = !value || (!utils_1._.isNumeric(Number(value)));
        return invalidNumber ? null : Number(value);
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
        if (!parentModel)
            return '';
        var arrayToDisplay = parentModel.length > 10 ? parentModel.slice(0, 10).concat(['...']) : parentModel;
        return "(" + parentModel.length + ") " + arrayToDisplay.join(",");
    };
    SetFloatingFilterComp.prototype.asParentModel = function () {
        return this.eColumnFloatingFilter.value ?
            this.eColumnFloatingFilter.value.split(",") :
            [];
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
