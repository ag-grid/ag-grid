"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageSizeSelectorComp = void 0;
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var main_1 = require("../../main");
var dom_1 = require("../../utils/dom");
var function_1 = require("../../utils/function");
var PageSizeSelectorComp = /** @class */ (function (_super) {
    __extends(PageSizeSelectorComp, _super);
    function PageSizeSelectorComp() {
        var _this = _super.call(this, /* html */ "<span class=\"ag-paging-page-size\"></span>") || this;
        _this.hasEmptyOption = false;
        _this.handlePageSizeItemSelected = function () {
            if (!_this.selectPageSizeComp) {
                return;
            }
            var newValue = _this.selectPageSizeComp.getValue();
            if (!newValue) {
                return;
            }
            var paginationPageSize = Number(newValue);
            if (isNaN(paginationPageSize) ||
                paginationPageSize < 1 ||
                paginationPageSize === _this.paginationProxy.getPageSize()) {
                return;
            }
            _this.paginationProxy.setPageSize(paginationPageSize, 'pageSizeSelector');
            if (_this.hasEmptyOption) {
                // Toggle the selector to force a refresh of the options and hide the empty option,
                // as it's no longer needed.
                _this.toggleSelectDisplay(true);
            }
            _this.selectPageSizeComp.getFocusableElement().focus();
        };
        return _this;
    }
    PageSizeSelectorComp.prototype.init = function () {
        var _this = this;
        this.addManagedPropertyListener('paginationPageSizeSelector', function () {
            _this.onPageSizeSelectorValuesChange();
        });
        this.addManagedListener(this.eventService, main_1.Events.EVENT_PAGINATION_CHANGED, function (event) { return _this.handlePaginationChanged(event); });
    };
    PageSizeSelectorComp.prototype.handlePaginationChanged = function (paginationChangedEvent) {
        if (!this.selectPageSizeComp || !(paginationChangedEvent === null || paginationChangedEvent === void 0 ? void 0 : paginationChangedEvent.newPageSize)) {
            return;
        }
        var paginationPageSize = this.paginationProxy.getPageSize();
        if (this.getPageSizeSelectorValues().includes(paginationPageSize)) {
            this.selectPageSizeComp.setValue(paginationPageSize.toString());
        }
        else {
            if (this.hasEmptyOption) {
                this.selectPageSizeComp.setValue('');
            }
            else {
                this.toggleSelectDisplay(true);
            }
        }
    };
    PageSizeSelectorComp.prototype.toggleSelectDisplay = function (show) {
        if (this.selectPageSizeComp) {
            this.reset();
        }
        if (!show) {
            return;
        }
        this.reloadPageSizesSelector();
        if (!this.selectPageSizeComp) {
            return;
        }
        this.appendChild(this.selectPageSizeComp);
    };
    PageSizeSelectorComp.prototype.reset = function () {
        (0, dom_1.clearElement)(this.getGui());
        if (!this.selectPageSizeComp) {
            return;
        }
        this.destroyBean(this.selectPageSizeComp);
        this.selectPageSizeComp = undefined;
    };
    PageSizeSelectorComp.prototype.onPageSizeSelectorValuesChange = function () {
        if (!this.selectPageSizeComp) {
            return;
        }
        if (this.shouldShowPageSizeSelector()) {
            this.reloadPageSizesSelector();
        }
    };
    PageSizeSelectorComp.prototype.shouldShowPageSizeSelector = function () {
        return (this.gridOptionsService.get('pagination') &&
            !this.gridOptionsService.get('suppressPaginationPanel') &&
            !this.gridOptionsService.get('paginationAutoPageSize') &&
            this.gridOptionsService.get('paginationPageSizeSelector') !== false);
    };
    PageSizeSelectorComp.prototype.reloadPageSizesSelector = function () {
        var _this = this;
        var pageSizeOptions = this.getPageSizeSelectorValues();
        var paginationPageSizeOption = this.paginationProxy.getPageSize();
        var shouldAddAndSelectEmptyOption = !paginationPageSizeOption || !pageSizeOptions.includes(paginationPageSizeOption);
        if (shouldAddAndSelectEmptyOption) {
            // When the paginationPageSize option is set to a value that is
            // not in the list of page size options.
            pageSizeOptions.unshift('');
            (0, function_1.warnOnce)("The paginationPageSize grid option is set to a value that is not in the list of page size options.\n                Please make sure that the paginationPageSize grid option is set to one of the values in the \n                paginationPageSizeSelector array, or set the paginationPageSizeSelector to false to hide the page size selector.");
        }
        if (this.selectPageSizeComp) {
            this.destroyBean(this.selectPageSizeComp);
            this.selectPageSizeComp = undefined;
        }
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var localisedLabel = localeTextFunc('pageSizeSelectorLabel', 'Page Size:');
        var options = pageSizeOptions.map(function (value) { return ({
            value: String(value),
            text: String(value)
        }); });
        var localisedAriaLabel = localeTextFunc('ariaPageSizeSelectorLabel', 'Page Size');
        this.selectPageSizeComp = this.createManagedBean(new main_1.AgSelect())
            .addOptions(options)
            .setValue(String(shouldAddAndSelectEmptyOption ? '' : paginationPageSizeOption))
            .setAriaLabel(localisedAriaLabel)
            .setLabel(localisedLabel)
            .onValueChange(function () { return _this.handlePageSizeItemSelected(); });
        this.hasEmptyOption = shouldAddAndSelectEmptyOption;
    };
    PageSizeSelectorComp.prototype.getPageSizeSelectorValues = function () {
        var defaultValues = [20, 50, 100];
        var paginationPageSizeSelectorValues = this.gridOptionsService.get('paginationPageSizeSelector');
        if (!Array.isArray(paginationPageSizeSelectorValues) ||
            !this.validateValues(paginationPageSizeSelectorValues)) {
            return defaultValues;
        }
        return __spreadArray([], __read(paginationPageSizeSelectorValues), false).sort(function (a, b) { return a - b; });
    };
    PageSizeSelectorComp.prototype.validateValues = function (values) {
        if (!values.length) {
            (0, function_1.warnOnce)("The paginationPageSizeSelector grid option is an empty array. This is most likely a mistake.\n                If you want to hide the page size selector, please set the paginationPageSizeSelector to false.");
            return false;
        }
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            var isNumber = typeof value === 'number';
            var isPositive = value > 0;
            if (!isNumber) {
                (0, function_1.warnOnce)("The paginationPageSizeSelector grid option contains a non-numeric value.\n                    Please make sure that all values in the paginationPageSizeSelector array are numbers.");
                return false;
            }
            if (!isPositive) {
                (0, function_1.warnOnce)("The paginationPageSizeSelector grid option contains a negative number or zero.\n                    Please make sure that all values in the paginationPageSizeSelector array are positive.");
                return false;
            }
        }
        return true;
    };
    PageSizeSelectorComp.prototype.destroy = function () {
        this.toggleSelectDisplay(false);
        _super.prototype.destroy.call(this);
    };
    __decorate([
        (0, context_1.Autowired)('localeService')
    ], PageSizeSelectorComp.prototype, "localeService", void 0);
    __decorate([
        (0, context_1.Autowired)('gridOptionsService')
    ], PageSizeSelectorComp.prototype, "gridOptionsService", void 0);
    __decorate([
        (0, context_1.Autowired)('paginationProxy')
    ], PageSizeSelectorComp.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.PostConstruct
    ], PageSizeSelectorComp.prototype, "init", null);
    return PageSizeSelectorComp;
}(component_1.Component));
exports.PageSizeSelectorComp = PageSizeSelectorComp;
