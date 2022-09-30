/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RefSelector } from '../../../widgets/componentAnnotations';
import { Autowired } from '../../../context/context';
import { DateCompWrapper } from './dateCompWrapper';
import { ConditionPosition } from '../simpleFilter';
import { ScalarFilter } from '../scalarFilter';
import { serialiseDate, parseDateTimeFromString } from '../../../utils/date';
var DEFAULT_MIN_YEAR = 1000;
var DEFAULT_MAX_YEAR = Infinity;
var DateFilter = /** @class */ (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter() {
        var _this = _super.call(this, 'dateFilter') || this;
        _this.minValidYear = DEFAULT_MIN_YEAR;
        _this.maxValidYear = DEFAULT_MAX_YEAR;
        return _this;
    }
    DateFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.dateCondition1FromComp.afterGuiAttached(params);
    };
    DateFilter.prototype.mapValuesFromModel = function (filterModel) {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (because Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
        //       a date from the UI, it will have timezone info in it. This is lost when creating
        //       the model. When we recreate the date again here, it's without a timezone.
        var _a = filterModel || {}, dateFrom = _a.dateFrom, dateTo = _a.dateTo, type = _a.type;
        return [
            dateFrom && parseDateTimeFromString(dateFrom) || null,
            dateTo && parseDateTimeFromString(dateTo) || null,
        ].slice(0, this.getNumberOfInputs(type));
    };
    DateFilter.prototype.comparator = function () {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    };
    DateFilter.prototype.defaultComparator = function (filterDate, cellValue) {
        // The default comparator assumes that the cellValue is a date
        var cellAsDate = cellValue;
        if (cellValue == null || cellAsDate < filterDate) {
            return -1;
        }
        if (cellAsDate > filterDate) {
            return 1;
        }
        return 0;
    };
    DateFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.dateFilterParams = params;
        var yearParser = function (param, fallback) {
            if (params[param] != null) {
                if (!isNaN(params[param])) {
                    return params[param] == null ? fallback : Number(params[param]);
                }
                else {
                    console.warn("AG Grid: DateFilter " + param + " is not a number");
                }
            }
            return fallback;
        };
        this.minValidYear = yearParser('minValidYear', DEFAULT_MIN_YEAR);
        this.maxValidYear = yearParser('maxValidYear', DEFAULT_MAX_YEAR);
        if (this.minValidYear > this.maxValidYear) {
            console.warn("AG Grid: DateFilter minValidYear should be <= maxValidYear");
        }
        this.createDateComponents();
    };
    DateFilter.prototype.createDateComponents = function () {
        var _this = this;
        var createDateCompWrapper = function (element) {
            return new DateCompWrapper(_this.getContext(), _this.userComponentFactory, {
                onDateChanged: function () { return _this.onUiChanged(); },
                filterParams: _this.dateFilterParams
            }, element);
        };
        this.dateCondition1FromComp = createDateCompWrapper(this.eCondition1PanelFrom);
        this.dateCondition1ToComp = createDateCompWrapper(this.eCondition1PanelTo);
        this.dateCondition2FromComp = createDateCompWrapper(this.eCondition2PanelFrom);
        this.dateCondition2ToComp = createDateCompWrapper(this.eCondition2PanelTo);
        this.addDestroyFunc(function () {
            _this.forEachInput(function (element) { return element.destroy(); });
        });
    };
    DateFilter.prototype.setElementValue = function (element, value, silent) {
        element.setDate(value);
    };
    DateFilter.prototype.setElementDisplayed = function (element, displayed) {
        element.setDisplayed(displayed);
    };
    DateFilter.prototype.setElementDisabled = function (element, disabled) {
        element.setDisabled(disabled);
    };
    DateFilter.prototype.getDefaultFilterOptions = function () {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    };
    DateFilter.prototype.createValueTemplate = function (position) {
        var pos = position === ConditionPosition.One ? '1' : '2';
        return /* html */ "\n            <div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\">\n                <div class=\"ag-filter-from ag-filter-date-from\" ref=\"eCondition" + pos + "PanelFrom\"></div>\n                <div class=\"ag-filter-to ag-filter-date-to\" ref=\"eCondition" + pos + "PanelTo\"></div>\n            </div>";
    };
    DateFilter.prototype.isConditionUiComplete = function (position) {
        var _this = this;
        if (!_super.prototype.isConditionUiComplete.call(this, position)) {
            return false;
        }
        var isValidDate = function (value) { return value != null
            && value.getUTCFullYear() >= _this.minValidYear
            && value.getUTCFullYear() <= _this.maxValidYear; };
        var valid = true;
        this.forEachInput(function (element, index, elPosition, numberOfInputs) {
            if (elPosition !== position || !valid || index >= numberOfInputs) {
                return;
            }
            valid = valid && isValidDate(element.getDate());
        });
        return valid;
    };
    DateFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    };
    DateFilter.prototype.getFilterType = function () {
        return 'date';
    };
    DateFilter.prototype.createCondition = function (position) {
        var type = this.getConditionTypes()[position];
        var model = {};
        var values = this.getValues(position);
        if (values.length > 0) {
            model.dateFrom = serialiseDate(values[0]);
        }
        if (values.length > 1) {
            model.dateTo = serialiseDate(values[1]);
        }
        return __assign({ dateFrom: null, dateTo: null, filterType: this.getFilterType(), type: type }, model);
    };
    DateFilter.prototype.resetPlaceholder = function () {
        var globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        var placeholder = this.translate('dateFormatOoo');
        var ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');
        this.forEachInput(function (element) {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    };
    DateFilter.prototype.getInputs = function () {
        return [
            [this.dateCondition1FromComp, this.dateCondition1ToComp],
            [this.dateCondition2FromComp, this.dateCondition2ToComp],
        ];
    };
    DateFilter.prototype.getValues = function (position) {
        var result = [];
        this.forEachInput(function (element, index, elPosition, numberOfInputs) {
            if (position === elPosition && index < numberOfInputs) {
                result.push(element.getDate());
            }
        });
        return result;
    };
    DateFilter.DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.LESS_THAN,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.IN_RANGE,
        ScalarFilter.BLANK,
        ScalarFilter.NOT_BLANK,
    ];
    __decorate([
        RefSelector('eCondition1PanelFrom')
    ], DateFilter.prototype, "eCondition1PanelFrom", void 0);
    __decorate([
        RefSelector('eCondition1PanelTo')
    ], DateFilter.prototype, "eCondition1PanelTo", void 0);
    __decorate([
        RefSelector('eCondition2PanelFrom')
    ], DateFilter.prototype, "eCondition2PanelFrom", void 0);
    __decorate([
        RefSelector('eCondition2PanelTo')
    ], DateFilter.prototype, "eCondition2PanelTo", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], DateFilter.prototype, "userComponentFactory", void 0);
    return DateFilter;
}(ScalarFilter));
export { DateFilter };
