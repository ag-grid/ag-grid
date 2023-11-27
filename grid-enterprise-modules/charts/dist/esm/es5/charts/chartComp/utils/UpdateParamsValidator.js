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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var validateIfDefined = function (validationFn) {
    return function (value) {
        if (value === undefined)
            return true;
        return validationFn(value);
    };
};
var isString = function (value) { return typeof value === 'string'; };
var isBoolean = function (value) { return typeof value === 'boolean'; };
var isValidSeriesChartType = function (value) { return typeof value === 'object'; };
var createWarnMessage = function (property, expectedType) {
    return function (value) { return "AG Grid - unable to update chart as invalid params supplied:  `".concat(property, ": ").concat(value, "`, expected ").concat(expectedType, "."); };
};
var UpdateParamsValidator = /** @class */ (function () {
    function UpdateParamsValidator() {
    }
    UpdateParamsValidator.validateChartParams = function (params) {
        var paramsToValidate = params;
        switch (paramsToValidate.type) {
            case 'rangeChartUpdate':
                return UpdateParamsValidator.validateUpdateRangeChartParams(params);
            case 'pivotChartUpdate':
                return UpdateParamsValidator.validateUpdatePivotChartParams(params);
            case 'crossFilterChartUpdate':
                return UpdateParamsValidator.validateUpdateCrossFilterChartParams(params);
            default:
                console.warn("AG Grid - Invalid value supplied for 'type': ".concat(params.type, ". It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'."));
                return false;
        }
    };
    UpdateParamsValidator.validateUpdateRangeChartParams = function (params) {
        var validations = __spreadArray(__spreadArray(__spreadArray([], __read(UpdateParamsValidator.commonValidations), false), __read(UpdateParamsValidator.cellRangeValidations), false), [
            {
                property: 'seriesChartTypes',
                validationFn: function (value) { return value === undefined || (Array.isArray(value) && value.every(isValidSeriesChartType)); },
                warnMessage: createWarnMessage('seriesChartTypes', 'Array of SeriesChartType'),
            },
        ], false);
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc', 'seriesChartTypes'], 'UpdateRangeChartParams');
    };
    UpdateParamsValidator.validateUpdatePivotChartParams = function (params) {
        var validations = __spreadArray([], __read(UpdateParamsValidator.commonValidations), false);
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart'], 'UpdatePivotChartParams');
    };
    UpdateParamsValidator.validateUpdateCrossFilterChartParams = function (params) {
        var validations = __spreadArray(__spreadArray([], __read(UpdateParamsValidator.commonValidations), false), __read(UpdateParamsValidator.cellRangeValidations), false);
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc'], 'UpdateCrossFilterChartParams');
    };
    UpdateParamsValidator.validateProperties = function (params, validations, validPropertyNames, paramsType) {
        var e_1, _a;
        try {
            for (var validations_1 = __values(validations), validations_1_1 = validations_1.next(); !validations_1_1.done; validations_1_1 = validations_1.next()) {
                var validation = validations_1_1.value;
                var property = validation.property, validationFn = validation.validationFn, warnMessage = validation.warnMessage;
                if (property in params) {
                    var value = params[property];
                    if (!validationFn(value)) {
                        console.warn(warnMessage(value));
                        return false;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (validations_1_1 && !validations_1_1.done && (_a = validations_1.return)) _a.call(validations_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Check for unexpected properties
        for (var property in params) {
            if (!validPropertyNames.includes(property)) {
                console.warn("AG Grid - Unexpected property supplied. ".concat(paramsType, " does not contain: `").concat(property, "`."));
                return false;
            }
        }
        return true;
    };
    UpdateParamsValidator.validChartTypes = [
        'column',
        'groupedColumn',
        'stackedColumn',
        'normalizedColumn',
        'bar',
        'groupedBar',
        'stackedBar',
        'normalizedBar',
        'line',
        'scatter',
        'bubble',
        'pie',
        'doughnut',
        'area',
        'stackedArea',
        'normalizedArea',
        'histogram',
        'columnLineCombo',
        'areaColumnCombo',
        'customCombo'
    ];
    UpdateParamsValidator.validateChartType = validateIfDefined(function (chartType) {
        return UpdateParamsValidator.validChartTypes.includes(chartType);
    });
    UpdateParamsValidator.validateAgChartThemeOverrides = validateIfDefined(function (themeOverrides) {
        // ensure supplied AgChartThemeOverrides is an object - can be improved if necessary?
        return typeof themeOverrides === 'object';
    });
    UpdateParamsValidator.validateChartParamsCellRange = validateIfDefined(function (cellRange) {
        // ensure supplied ChartParamsCellRange is an object - can be improved if necessary?
        return typeof cellRange === 'object';
    });
    UpdateParamsValidator.validateAggFunc = validateIfDefined(function (aggFunc) {
        // ensure supplied aggFunc is a `string` or `function` - can be improved if necessary?
        return typeof aggFunc === 'string' || typeof aggFunc === 'function';
    });
    UpdateParamsValidator.commonValidations = [
        { property: 'chartId', validationFn: isString, warnMessage: createWarnMessage('chartId', 'string') },
        {
            property: 'chartType',
            validationFn: UpdateParamsValidator.validateChartType,
            warnMessage: createWarnMessage('chartType', UpdateParamsValidator.validChartTypes.join(', '))
        },
        {
            property: 'chartThemeName',
            validationFn: isString,
            warnMessage: createWarnMessage('chartThemeName', 'string')
        },
        {
            property: 'chartThemeOverrides',
            validationFn: UpdateParamsValidator.validateAgChartThemeOverrides,
            warnMessage: createWarnMessage('chartThemeOverrides', 'AgChartThemeOverrides')
        },
        { property: 'unlinkChart', validationFn: isBoolean, warnMessage: createWarnMessage('unlinkChart', 'boolean') },
    ];
    UpdateParamsValidator.cellRangeValidations = [
        {
            property: 'cellRange',
            validationFn: UpdateParamsValidator.validateChartParamsCellRange,
            warnMessage: createWarnMessage('cellRange', 'ChartParamsCellRange')
        },
        {
            property: 'suppressChartRanges',
            validationFn: isBoolean,
            warnMessage: createWarnMessage('suppressChartRanges', 'boolean')
        },
        {
            property: 'aggFunc',
            validationFn: UpdateParamsValidator.validateAggFunc,
            warnMessage: createWarnMessage('aggFunc', 'string or IAggFunc')
        },
    ];
    return UpdateParamsValidator;
}());
export { UpdateParamsValidator };
