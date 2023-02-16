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
exports.TextFloatingFilter = void 0;
var textFilter_1 = require("./textFilter");
var textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
var TextFloatingFilter = /** @class */ (function (_super) {
    __extends(TextFloatingFilter, _super);
    function TextFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.filterModelFormatter = new textFilter_1.TextFilterModelFormatter(this.localeService, this.optionsFactory);
    };
    TextFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return textFilter_1.TextFilter.DEFAULT_FILTER_OPTIONS;
    };
    TextFloatingFilter.prototype.getFilterModelFormatter = function () {
        return this.filterModelFormatter;
    };
    return TextFloatingFilter;
}(textInputFloatingFilter_1.TextInputFloatingFilter));
exports.TextFloatingFilter = TextFloatingFilter;
