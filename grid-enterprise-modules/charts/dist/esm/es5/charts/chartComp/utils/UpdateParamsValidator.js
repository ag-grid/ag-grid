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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
    return function (value) { return "AG Grid - unable to update chart as invalid params supplied:  `" + property + ": " + value + "`, expected " + expectedType + "."; };
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
                console.warn("AG Grid - Invalid value supplied for 'type': " + params.type + ". It must be either 'rangeChartUpdate', 'pivotChartUpdate', or 'crossFilterChartUpdate'.");
                return false;
        }
    };
    UpdateParamsValidator.validateUpdateRangeChartParams = function (params) {
        var validations = __spreadArray(__spreadArray(__spreadArray([], __read(UpdateParamsValidator.commonValidations)), __read(UpdateParamsValidator.cellRangeValidations)), [
            {
                property: 'seriesChartTypes',
                validationFn: function (value) { return value === undefined || (Array.isArray(value) && value.every(isValidSeriesChartType)); },
                warnMessage: createWarnMessage('seriesChartTypes', 'Array of SeriesChartType'),
            },
        ]);
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart', 'cellRange', 'suppressChartRanges', 'aggFunc', 'seriesChartTypes'], 'UpdateRangeChartParams');
    };
    UpdateParamsValidator.validateUpdatePivotChartParams = function (params) {
        var validations = __spreadArray([], __read(UpdateParamsValidator.commonValidations));
        return UpdateParamsValidator.validateProperties(params, validations, ['type', 'chartId', 'chartType', 'chartThemeName', 'chartThemeOverrides', 'unlinkChart'], 'UpdatePivotChartParams');
    };
    UpdateParamsValidator.validateUpdateCrossFilterChartParams = function (params) {
        var validations = __spreadArray(__spreadArray([], __read(UpdateParamsValidator.commonValidations)), __read(UpdateParamsValidator.cellRangeValidations));
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
                console.warn("AG Grid - Unexpected property supplied. " + paramsType + " does not contain: `" + property + "`.");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUGFyYW1zVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvdXRpbHMvVXBkYXRlUGFyYW1zVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBTSxpQkFBaUIsR0FBRyxVQUFJLFlBQW1DO0lBQzdELE9BQU8sVUFBQyxLQUFvQjtRQUN4QixJQUFJLEtBQUssS0FBSyxTQUFTO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDckMsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsSUFBTSxRQUFRLEdBQUcsVUFBQyxLQUFVLElBQWMsT0FBQSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQXpCLENBQXlCLENBQUM7QUFDcEUsSUFBTSxTQUFTLEdBQUcsVUFBQyxLQUFVLElBQWMsT0FBQSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQTFCLENBQTBCLENBQUM7QUFDdEUsSUFBTSxzQkFBc0IsR0FBRyxVQUFDLEtBQVUsSUFBYyxPQUFBLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBekIsQ0FBeUIsQ0FBQztBQUNsRixJQUFNLGlCQUFpQixHQUFHLFVBQUMsUUFBZ0IsRUFBRSxZQUFvQjtJQUM3RCxPQUFBLFVBQUMsS0FBVSxJQUFLLE9BQUEsb0VBQW1FLFFBQVEsVUFBSyxLQUFLLG9CQUFnQixZQUFZLE1BQUcsRUFBcEgsQ0FBb0g7QUFBcEksQ0FBb0ksQ0FBQztBQVF6STtJQUFBO0lBcUpBLENBQUM7SUFwRWlCLHlDQUFtQixHQUFqQyxVQUFrQyxNQUF5QjtRQUN2RCxJQUFJLGdCQUFnQixHQUFHLE1BQTJCLENBQUM7UUFDbkQsUUFBUSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7WUFDM0IsS0FBSyxrQkFBa0I7Z0JBQ25CLE9BQU8s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