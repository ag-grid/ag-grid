/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
exports.ScalarFilter = void 0;
var simpleFilter_1 = require("./simpleFilter");
var ScalarFilter = /** @class */ (function (_super) {
    __extends(ScalarFilter, _super);
    function ScalarFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScalarFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.scalarFilterParams = params;
    };
    ScalarFilter.prototype.evaluateNullValue = function (filterType) {
        switch (filterType) {
            case ScalarFilter.EQUALS:
            case ScalarFilter.NOT_EQUAL:
                if (this.scalarFilterParams.includeBlanksInEquals) {
                    return true;
                }
                break;
            case ScalarFilter.GREATER_THAN:
            case ScalarFilter.GREATER_THAN_OR_EQUAL:
                if (this.scalarFilterParams.includeBlanksInGreaterThan) {
                    return true;
                }
                break;
            case ScalarFilter.LESS_THAN:
            case ScalarFilter.LESS_THAN_OR_EQUAL:
                if (this.scalarFilterParams.includeBlanksInLessThan) {
                    return true;
                }
                break;
            case ScalarFilter.IN_RANGE:
                if (this.scalarFilterParams.includeBlanksInRange) {
                    return true;
                }
                break;
            case ScalarFilter.BLANK:
                return true;
            case ScalarFilter.NOT_BLANK:
                return false;
        }
        return false;
    };
    ScalarFilter.prototype.evaluateNonNullValue = function (values, cellValue, filterModel) {
        var comparator = this.comparator();
        var compareResult = values[0] != null ? comparator(values[0], cellValue) : 0;
        switch (filterModel.type) {
            case ScalarFilter.EQUALS:
                return compareResult === 0;
            case ScalarFilter.NOT_EQUAL:
                return compareResult !== 0;
            case ScalarFilter.GREATER_THAN:
                return compareResult > 0;
            case ScalarFilter.GREATER_THAN_OR_EQUAL:
                return compareResult >= 0;
            case ScalarFilter.LESS_THAN:
                return compareResult < 0;
            case ScalarFilter.LESS_THAN_OR_EQUAL:
                return compareResult <= 0;
            case ScalarFilter.IN_RANGE: {
                var compareToResult = comparator(values[1], cellValue);
                return this.scalarFilterParams.inRangeInclusive ?
                    compareResult >= 0 && compareToResult <= 0 :
                    compareResult > 0 && compareToResult < 0;
            }
            case ScalarFilter.BLANK:
                return this.isBlank(cellValue);
            case ScalarFilter.NOT_BLANK:
                return !this.isBlank(cellValue);
            default:
                console.warn('AG Grid: Unexpected type of filter "' + filterModel.type + '", it looks like the filter was configured with incorrect Filter Options');
                return true;
        }
    };
    return ScalarFilter;
}(simpleFilter_1.SimpleFilter));
exports.ScalarFilter = ScalarFilter;
