/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var ScalerFilter = /** @class */ (function (_super) {
    __extends(ScalerFilter, _super);
    function ScalerFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScalerFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.scalarFilterParams = params;
        this.checkDeprecatedParams();
    };
    ScalerFilter.prototype.checkDeprecatedParams = function () {
        if (this.scalarFilterParams.nullComparator) {
            console.warn('ag-Grid: Since v21.0, the property filterParams.nullComparator is deprecated. ' +
                'Please use filterParams.includeBlanksInEquals, filterParams.includeBlanksInLessThan and ' +
                'filterParams.includeBlanksInGreaterThan instead.');
            this.scalarFilterParams.includeBlanksInEquals = this.scalarFilterParams.nullComparator.equals;
            this.scalarFilterParams.includeBlanksInLessThan = this.scalarFilterParams.nullComparator.lessThan;
            this.scalarFilterParams.includeBlanksInGreaterThan = this.scalarFilterParams.nullComparator.greaterThan;
        }
    };
    ScalerFilter.prototype.nullComparator = function (selectedOption, filterValue, gridValue) {
        if (gridValue == null) {
            var nullValue = this.canNullsPassFilter(selectedOption);
            if (selectedOption === ScalerFilter.EMPTY) {
                return 0;
            }
            if (selectedOption === ScalerFilter.EQUALS) {
                return nullValue ? 0 : 1;
            }
            if (selectedOption === ScalerFilter.GREATER_THAN) {
                return nullValue ? 1 : -1;
            }
            if (selectedOption === ScalerFilter.GREATER_THAN_OR_EQUAL) {
                return nullValue ? 1 : -1;
            }
            if (selectedOption === ScalerFilter.LESS_THAN_OR_EQUAL) {
                return nullValue ? -1 : 1;
            }
            if (selectedOption === ScalerFilter.LESS_THAN) {
                return nullValue ? -1 : 1;
            }
            if (selectedOption === ScalerFilter.NOT_EQUAL) {
                return nullValue ? 1 : 0;
            }
        }
        var actualComparator = this.comparator();
        return actualComparator(filterValue, gridValue);
    };
    ScalerFilter.prototype.canNullsPassFilter = function (type) {
        switch (type) {
            case simpleFilter_1.SimpleFilter.GREATER_THAN:
            case simpleFilter_1.SimpleFilter.GREATER_THAN_OR_EQUAL:
                return this.scalarFilterParams.includeBlanksInGreaterThan;
            case simpleFilter_1.SimpleFilter.LESS_THAN:
            case simpleFilter_1.SimpleFilter.LESS_THAN_OR_EQUAL:
                return this.scalarFilterParams.includeBlanksInLessThan;
            case simpleFilter_1.SimpleFilter.EQUALS:
                return this.scalarFilterParams.includeBlanksInEquals;
        }
    };
    ScalerFilter.prototype.individualConditionPasses = function (params, filterModel) {
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
        // why this? looks like logic that should be in parent class????
        // if (filterValue == null) {
        //     return type === FilterConditionType.MAIN ? true : this.conditionValue === 'AND';
        // }
        var compareResult = this.nullComparator(filterType, filterValue, cellValue);
        if (filterType === ScalerFilter.EQUALS) {
            return compareResult === 0;
        }
        if (filterType === ScalerFilter.GREATER_THAN) {
            return compareResult > 0;
        }
        if (filterType === ScalerFilter.GREATER_THAN_OR_EQUAL) {
            return compareResult >= 0;
        }
        if (filterType === ScalerFilter.LESS_THAN_OR_EQUAL) {
            return compareResult <= 0;
        }
        if (filterType === ScalerFilter.LESS_THAN) {
            return compareResult < 0;
        }
        if (filterType === ScalerFilter.NOT_EQUAL) {
            return compareResult != 0;
        }
        // From now on the type is a range and rawFilterValues must be an array!
        var compareToResult = this.nullComparator(filterType, filterValueTo, cellValue);
        if (filterType === ScalerFilter.IN_RANGE) {
            if (!this.scalarFilterParams.inRangeInclusive) {
                return compareResult > 0 && compareToResult < 0;
            }
            else {
                return compareResult >= 0 && compareToResult <= 0;
            }
        }
        throw new Error('Unexpected type of filter: ' + filterType);
    };
    ScalerFilter.DEFAULT_NULL_COMPARATOR = {
        equals: false,
        lessThan: false,
        greaterThan: false
    };
    return ScalerFilter;
}(simpleFilter_1.SimpleFilter));
exports.ScalerFilter = ScalerFilter;
