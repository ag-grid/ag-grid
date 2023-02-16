/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFloatingFilter = void 0;
var numberFilter_1 = require("./numberFilter");
var textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
var NumberFloatingFilter = /** @class */ (function (_super) {
    __extends(NumberFloatingFilter, _super);
    function NumberFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.filterModelFormatter = new numberFilter_1.NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    };
    NumberFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return numberFilter_1.NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFloatingFilter.prototype.getFilterModelFormatter = function () {
        return this.filterModelFormatter;
    };
    return NumberFloatingFilter;
}(textInputFloatingFilter_1.TextInputFloatingFilter));
exports.NumberFloatingFilter = NumberFloatingFilter;
