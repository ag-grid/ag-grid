/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var simpleFilter_1 = require("./simpleFilter");
var ScalarFilter = /** @class */ (function (_super) {
    __extends(ScalarFilter, _super);
    function ScalarFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScalarFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.scalarFilterParams = params;
        this.checkDeprecatedParams();
    };
    ScalarFilter.prototype.checkDeprecatedParams = function () {
        if (this.scalarFilterParams.nullComparator) {
            console.warn('AG Grid: Since v21.0, the property filterParams.nullComparator is deprecated. ' +
                'Please use filterParams.includeBlanksInEquals, filterParams.includeBlanksInLessThan and ' +
                'filterParams.includeBlanksInGreaterThan instead.');
            this.scalarFilterParams.includeBlanksInEquals = this.scalarFilterParams.nullComparator.equals;
            this.scalarFilterParams.includeBlanksInLessThan = this.scalarFilterParams.nullComparator.lessThan;
            this.scalarFilterParams.includeBlanksInGreaterThan = this.scalarFilterParams.nullComparator.greaterThan;
        }
    };
    ScalarFilter.prototype.individualConditionPasses = function (params, filterModel) {
        var cellValue = this.scalarFilterParams.valueGetter(params.node);
        var range = this.mapRangeFromModel(filterModel);
        var filterValue = range.from;
        var filterValueTo = range.to;
        var filterType = filterModel.type;
        var customFilterOption = this.optionsFactory.getCustomOption(filterType);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterValue != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterValue, cellValue);
            }
        }
        if (cellValue == null) {
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
            }
            return false;
        }
        var comparator = this.comparator();
        var compareResult = comparator(filterValue, cellValue);
        switch (filterType) {
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
                var compareToResult = comparator(filterValueTo, cellValue);
                return this.scalarFilterParams.inRangeInclusive ?
                    compareResult >= 0 && compareToResult <= 0 :
                    compareResult > 0 && compareToResult < 0;
            }
            default:
                console.warn('AG Grid: Unexpected type of filter "' + filterType + '", it looks like the filter was configured with incorrect Filter Options');
                return true;
        }
    };
    return ScalarFilter;
}(simpleFilter_1.SimpleFilter));
exports.ScalarFilter = ScalarFilter;

//# sourceMappingURL=scalarFilter.js.map
