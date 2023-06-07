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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
// @ts-ignore
import { getSeriesType } from './chartComp/utils/seriesTypeMapper';
// @ts-ignore
import { ALL_AXIS_TYPES, getLegacyAxisType } from './chartComp/utils/axisTypeMapper';
// @ts-ignore
import { VERSION } from '../version';
var DEBUG = false;
export function upgradeChartModel(model) {
    var originalVersion = model.version;
    if (model.version == null) {
        // Try to guess the version so we can apply the right subset of migrations.
        model.version = heuristicVersionDetection(model);
    }
    model = migrateIfBefore('23.0.0', model, migrateV23);
    model = migrateIfBefore('24.0.0', model, migrateV24);
    model = migrateIfBefore('25.1.0', model, migrateV25_1);
    model = migrateIfBefore('26.0.0', model, migrateV26);
    model = migrateIfBefore('26.1.0', model, migrateV26_1);
    // Switch from iChartOptions to iAgChartOptions....
    model = migrateIfBefore('26.2.0', model, migrateV26_2);
    model = migrateIfBefore('28.0.0', model, migrateV28);
    model = migrateIfBefore('28.2.0', model, migrateV28_2);
    model = migrateIfBefore('29.0.0', model, migrateV29);
    model = migrateIfBefore('29.1.0', model, migrateV29_1);
    model = migrateIfBefore('29.2.0', model, migrateV29_2);
    model = migrateIfBefore('30.0.0', model, migrateV30);
    model = cleanup(model);
    // Bump version to latest.
    model = migrateIfBefore(VERSION, model, function (m) { return m; });
    if (DEBUG && originalVersion !== model.version) {
        console.log('AG Grid: ChartModel migration complete', { model: model });
    }
    return model;
}
function migrateV23(model) {
    // https://github.com/ag-grid/ag-grid/commit/76c6744ff2b732d298d1ade73c122188854b5bac
    model = jsonRename('chartOptions.legend.item.marker.type', 'shape', model);
    model = jsonRename('chartOptions.seriesDefaults.marker.type', 'shape', model);
    // https://github.com/ag-grid/ag-grid/commit/7bdf2cfd666acda758a818733a9f9cb35ac1d7a7
    model = jsonRename('chartOptions.legend.padding', 'spacing', model);
    return model;
}
function migrateV24(model) {
    var _a;
    // https://github.com/ag-grid/ag-grid/commit/f4e854e3dc459400fa00e6da2873cb8e9cfff6fe#
    model = jsonDelete('chartOptions.seriesDefaults.marker.minSize', model);
    var _b = model, chartType = _b.chartType, chartPalette = _b.chartPalette, // Migrate.
    _c = _b.chartOptions, xAxis = _c.xAxis, yAxis = _c.yAxis, chartOptions = __rest(_c, ["xAxis", "yAxis"]), chartModel = __rest(_b, ["chartType", "chartPalette", "chartOptions"]);
    var axesTypes = getLegacyAxisType(chartType);
    var axes = axesTypes === null || axesTypes === void 0 ? void 0 : axesTypes.map(function (type, i) { return (__assign({ type: type }, (i === 0 ? xAxis : yAxis))); });
    return __assign({ chartType: chartType, chartThemeName: (_a = LEGACY_PALETTES[chartPalette]) !== null && _a !== void 0 ? _a : 'ag-default', chartOptions: __assign(__assign({}, chartOptions), { axes: axes, xAxis: xAxis, yAxis: yAxis }) }, chartModel);
}
function migrateV25_1(model) {
    // https://github.com/ag-grid/ag-grid/commit/61943f9fecbfb5ac1b9a1fd93788f9fdd8687181
    model = jsonRename('chartOptions.seriesDefaults.label.minRequiredAngle', 'minAngle', model);
    return model;
}
function migrateV26(model) {
    // https://github.com/ag-grid/ag-grid/commit/df2445d88e64cb4e831d6163104a0fa60ccde3b5
    var highlightOptUpdate = function (_a) {
        var dimOpacity = _a.dimOpacity, opts = __rest(_a, ["dimOpacity"]);
        return (__assign(__assign({}, opts), (dimOpacity != null ? { series: { dimOpacity: dimOpacity } } : {})));
    };
    model = jsonMutate('chartOptions.seriesDefaults.highlightStyle', model, highlightOptUpdate);
    // https://github.com/ag-grid/ag-grid/commit/f4e854e3dc459400fa00e6da2873cb8e9cfff6fe#
    model = jsonDelete('chart', model);
    model = jsonDelete('chartOptions.seriesDefaults.tooltipClass', model);
    model = jsonDelete('chartOptions.seriesDefaults.tooltipTracking', model);
    // Cleanup label.rotation === 0, which was treated as 'use the default' on reload prior to 26.
    model = jsonDeleteDefault('chartOptions.axes[].label.rotation', 0, model);
    model = jsonDeleteDefault('chartOptions.axes[].label.rotation', 335, model);
    return model;
}
function migrateV26_1(model) {
    // https://github.com/ag-grid/ag-grid/commit/df2445d88e64cb4e831d6163104a0fa60ccde3b5
    var highlightOptUpdate = function (_a) {
        var item = _a.item, series = _a.series, opts = __rest(_a, ["item", "series"]);
        return (__assign({ item: __assign(__assign({}, opts), item) }, (series ? { series: series } : {})));
    };
    model = jsonMutate('chartOptions.seriesDefaults.highlightStyle', model, highlightOptUpdate);
    model = jsonMutate('chartOptions.series[].highlightStyle', model, highlightOptUpdate);
    return model;
}
function migrateV26_2(model) {
    // https://github.com/ag-grid/ag-grid/commit/8b2e223cb1a687cb6c1d70b9f75f52fa29d00341
    model = jsonMove('chartOptions.seriesDefaults.fill.opacity', 'chartOptions.seriesDefaults.fillOpacity', model);
    model = jsonMove('chartOptions.seriesDefaults.stroke.opacity', 'chartOptions.seriesDefaults.strokeOpacity', model);
    model = jsonMove('chartOptions.seriesDefaults.stroke.width', 'chartOptions.seriesDefaults.strokeWidth', model);
    model = jsonDelete('chartOptions.seriesDefaults.fill', model);
    model = jsonDelete('chartOptions.seriesDefaults.stroke', model);
    model = jsonDelete('chartOptions.seriesDefaults.callout.colors', model);
    model = jsonDelete('chartOptions.xAxis', model);
    model = jsonDelete('chartOptions.yAxis', model);
    var _a = model, chartType = _a.chartType, _b = _a.chartOptions, axes = _b.axes, series = _b.series, seriesDefaults = _b.seriesDefaults, otherChartOptions = __rest(_b, ["axes", "series", "seriesDefaults"]), otherModelProps = __rest(_a, ["chartType", "chartOptions"]);
    // At 26.2.0 combination charts weren't supported, so we can safely assume a single series type.
    // We can't rely on the `series.type` field as it was incorrect (in v25.0.0 line chart has an
    // `area` series).
    var seriesTypes = [getSeriesType(chartType)];
    var chartTypeMixin = {};
    if (!seriesTypes.includes('pie')) {
        var minimalAxis_1 = { top: {}, bottom: {}, left: {}, right: {} };
        var updatedAxes_1 = axes
            .map(function (_a) {
            var _b;
            var type = _a.type, axisProps = __rest(_a, ["type"]);
            return (_b = {},
                _b[type] = __assign(__assign({}, minimalAxis_1), axisProps),
                _b);
        })
            .reduce(merge, {});
        ALL_AXIS_TYPES.filter(function (v) { return updatedAxes_1[v] == null; }).forEach(function (v) {
            updatedAxes_1[v] = __assign({}, minimalAxis_1);
        });
        chartTypeMixin.axes = updatedAxes_1;
    }
    var updatedChartOptions = seriesTypes
        .map(function (t) {
        var _a;
        return (_a = {},
            _a[t] = __assign(__assign(__assign({}, chartTypeMixin), { series: seriesDefaults }), otherChartOptions),
            _a);
    })
        .reduce(merge, {});
    model = __assign(__assign({}, otherModelProps), { chartType: chartType, chartOptions: updatedChartOptions });
    return model;
}
function migrateV28(model) {
    model = jsonDelete('chartOptions.*.title.padding', model);
    model = jsonDelete('chartOptions.*.subtitle.padding', model);
    model = jsonDelete('chartOptions.*.axes.*.title.padding', model);
    model = jsonBackfill('chartOptions.*.axes.*.title.enabled', false, model);
    return model;
}
function migrateV28_2(model) {
    model = jsonRename('chartOptions.pie.series.callout', 'calloutLine', model);
    model = jsonRename('chartOptions.pie.series.label', 'calloutLabel', model);
    model = jsonRename('chartOptions.pie.series.labelKey', 'sectorLabelKey', model);
    model = jsonRename('chartOptions.pie.series.labelName', 'sectorLabelName', model);
    // series.yKeys => yKey ?
    // series.yNames => yName ?
    return model;
}
function migrateV29(model) {
    model = jsonMoveIfMissing('chartOptions.scatter.series.fill', 'chartOptions.scatter.series.marker.fill', model);
    model = jsonMoveIfMissing('chartOptions.scatter.series.fillOpacity', 'chartOptions.scatter.series.marker.fillOpacity', model);
    model = jsonMoveIfMissing('chartOptions.scatter.series.stroke', 'chartOptions.scatter.series.marker.stroke', model);
    model = jsonMoveIfMissing('chartOptions.scatter.series.strokeOpacity', 'chartOptions.scatter.series.marker.strokeOpacity', model);
    model = jsonMoveIfMissing('chartOptions.scatter.series.strokeWidth', 'chartOptions.scatter.series.marker.strokeWidth', model);
    model = jsonMove('chartOptions.scatter.series.paired', 'chartOptions.scatter.paired', model);
    return model;
}
function migrateV29_1(model) {
    model = jsonDelete('chartOptions.axes[].tick.count', model);
    return model;
}
function migrateV29_2(model) {
    // https://github.com/ag-grid/ag-grid/commit/ce11956492e42e845932edb4e05d7b0b21db5c61
    var tooltipOptUpdate = function (_a) {
        var _b, _c, _d, _e;
        var tracking = _a.tracking, opts = __rest(_a, ["tracking"]);
        var output = __assign({}, opts);
        if (tracking === false) {
            (_b = output.position) !== null && _b !== void 0 ? _b : (output.position = { type: 'pointer' });
            (_c = output.range) !== null && _c !== void 0 ? _c : (output.range = 'nearest');
        }
        else if (tracking === true) {
            (_d = output.position) !== null && _d !== void 0 ? _d : (output.position = { type: 'node' });
            (_e = output.range) !== null && _e !== void 0 ? _e : (output.range = 'nearest');
        }
        return output;
    };
    model = jsonMutate('chartOptions.*.tooltip', model, tooltipOptUpdate);
    return model;
}
function migrateV30(model) {
    // Repeated from migrateV28_2() as they were applied retrospectively for the v30 release.
    model = jsonRename('chartOptions.pie.series.labelKey', 'sectorLabelKey', model);
    model = jsonRename('chartOptions.pie.series.labelName', 'sectorLabelName', model);
    // Late-applied migrations for deprecations in the 29.x.y range.
    model = migrateV29_1(model);
    model = migrateV29_2(model);
    // Actual v30 changes.
    model = jsonDelete('chartOptions.*.series.flipXY', model);
    model = jsonAdd('chartOptions.common.legend.enabled', true, model);
    model = jsonBackfill('chartOptions.common.legend.position', 'right', model);
    return model;
}
function cleanup(model) {
    // Remove fixed width/height - this has never been supported via UI configuration.
    model = jsonDelete('chartOptions.*.width', model);
    model = jsonDelete('chartOptions.*.height', model);
    model = jsonBackfill('chartOptions.*.axes.category.label.autoRotate', true, model);
    return model;
}
export function heuristicVersionDetection(model) {
    var _a, _b;
    var modelAny = model;
    if (model.version != null) {
        return model.version;
    }
    var hasKey = function (obj) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        return Object.keys(obj || {}).some(function (k) { return keys.includes(k); });
    };
    var chartOptions = modelAny.chartOptions;
    var seriesOptions = hasKey(chartOptions, 'seriesDefaults')
        ? chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions.seriesDefaults
        : chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions[Object.keys(chartOptions)[0]];
    var hints = {
        '27.0.0': hasKey(modelAny, 'seriesChartTypes'),
        '26.2.0': !hasKey(chartOptions, 'seriesDefaults'),
        '26.1.0': hasKey(seriesOptions === null || seriesOptions === void 0 ? void 0 : seriesOptions.highlightStyle, 'item'),
        '26.0.0': hasKey(seriesOptions === null || seriesOptions === void 0 ? void 0 : seriesOptions.highlightStyle, 'series'),
        // '26.0.0': modelAny.chart === undefined,
        '25.1.0': hasKey(seriesOptions === null || seriesOptions === void 0 ? void 0 : seriesOptions.label, 'minAngle'),
        '25.0.0': hasKey(modelAny, 'modelType', 'aggFunc', 'unlinkChart', 'suppressChartRanges') ||
            hasKey(seriesOptions, 'lineDash', 'lineDashOffset'),
        '24.0.0': hasKey(modelAny, 'chartThemeName', 'chart') || hasKey(chartOptions, 'series'),
        '23.2.0': hasKey(chartOptions, 'navigator'),
        '23.0.0': hasKey((_b = (_a = chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions.legend) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.marker, 'shape'),
        '22.1.0': hasKey(modelAny, 'chartPalette', 'chartType'),
    };
    // Default to 27.1.0, the last version before we added `version`.
    var defaultVersion = '27.1.0';
    var matchingHints = Object.entries(hints).filter(function (_a) {
        var _b = __read(_a, 2), _ = _b[0], match = _b[1];
        return match;
    });
    if (DEBUG)
        console.log('AG Grid: ChartModel migration', { heuristicVersionCandidates: matchingHints });
    var _c = __read(matchingHints[0], 1), _d = _c[0], heuristicVersion = _d === void 0 ? defaultVersion : _d;
    if (DEBUG)
        console.log('AG Grid: ChartModel migration', { heuristicVersion: heuristicVersion });
    return heuristicVersion;
}
function migrateIfBefore(maxVersion, model, migration) {
    if (versionNumber(maxVersion) > versionNumber(model.version)) {
        if (DEBUG)
            console.log('AG Grid: ChartModel migration', { migratingTo: maxVersion });
        var result = migration(model);
        result.version = maxVersion;
        if (DEBUG)
            console.log('AG Grid: ChartModel migration', { migratedTo: maxVersion, result: result });
        return result;
    }
    return model;
}
function versionParts(version) {
    var split = typeof version === 'string' ? version.split('.').map(function (v) { return Number(v); }) : [];
    if (split.length !== 3 || split.some(function (v) { return isNaN(v); })) {
        throw new Error('AG Grid - Illegal version string: ' + version);
    }
    return {
        major: split[0],
        minor: split[1],
        patch: split[2],
    };
}
function versionNumber(version) {
    var _a = versionParts(version), major = _a.major, minor = _a.minor, patch = _a.patch;
    // Return a number of the form MMmmPP.
    return major * 10000 + minor * 100 + patch;
}
function jsonDeleteDefault(path, defaultValue, json) {
    return jsonMutateProperty(path, true, json, function (parent, prop) {
        if (parent[prop] === defaultValue) {
            delete parent[prop];
        }
    });
}
function jsonBackfill(path, defaultValue, json) {
    return jsonMutateProperty(path, false, json, function (parent, prop) {
        if (parent[prop] == null) {
            parent[prop] = defaultValue;
        }
    });
}
function jsonAdd(path, value, json) {
    var _a;
    if (typeof path === 'string') {
        path = path.split('.');
    }
    var nextPath = path[0];
    if (path.length > 1) {
        json[nextPath] = jsonAdd(path.slice(1), value, (_a = json[nextPath]) !== null && _a !== void 0 ? _a : {});
    }
    var hasProperty = Object.keys(json).includes(nextPath);
    if (!hasProperty) {
        json[nextPath] = value;
    }
    return json;
}
function jsonMove(from, to, json) {
    var valueToMove = undefined;
    var valueFound = false;
    json = jsonMutateProperty(from, true, json, function (parent, prop) {
        valueFound = true;
        valueToMove = parent[prop];
        delete parent[prop];
    });
    if (!valueFound) {
        return json;
    }
    return jsonMutateProperty(to, false, json, function (parent, prop) {
        parent[prop] = valueToMove;
    });
}
function jsonMoveIfMissing(from, to, json) {
    var valueToMove = undefined;
    var valueFound = false;
    json = jsonMutateProperty(from, true, json, function (parent, prop) {
        valueFound = true;
        valueToMove = parent[prop];
        delete parent[prop];
    });
    if (!valueFound) {
        return json;
    }
    return jsonMutateProperty(to, false, json, function (parent, prop) {
        if (parent[prop] === undefined) {
            parent[prop] = valueToMove;
        }
    });
}
function jsonRename(path, renameTo, json) {
    return jsonMutateProperty(path, true, json, function (parent, prop) {
        parent[renameTo] = parent[prop];
        delete parent[prop];
    });
}
function jsonDelete(path, json) {
    return jsonMutateProperty(path, true, json, function (parent, prop) { return delete parent[prop]; });
}
function jsonMutateProperty(path, skipMissing, json, mutator) {
    var pathElements = path instanceof Array ? path : path.split('.');
    var parentPathElements = pathElements.slice(0, pathElements.length - 1);
    var targetName = pathElements[pathElements.length - 1];
    return jsonMutate(parentPathElements, json, function (parent) {
        var hasProperty = Object.keys(parent).includes(targetName);
        if (skipMissing && !hasProperty) {
            return parent;
        }
        var result = __assign({}, parent);
        mutator(result, targetName);
        return result;
    });
}
function jsonMutate(path, json, mutator) {
    var e_1, _a;
    var pathElements = path instanceof Array ? path : path.split('.');
    // Clone to avoid mutating original input.
    json = __assign({}, json);
    if (pathElements.length === 0) {
        return mutator(json);
    }
    else if (pathElements[0].startsWith('{')) {
        var pathOptions = pathElements[0].substring(1, pathElements[0].lastIndexOf('}')).split(',');
        try {
            for (var pathOptions_1 = __values(pathOptions), pathOptions_1_1 = pathOptions_1.next(); !pathOptions_1_1.done; pathOptions_1_1 = pathOptions_1.next()) {
                var pathOption = pathOptions_1_1.value;
                if (json[pathOption] != null) {
                    json[pathOption] = jsonMutate(pathElements.slice(1), json[pathOption], mutator);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (pathOptions_1_1 && !pathOptions_1_1.done && (_a = pathOptions_1.return)) _a.call(pathOptions_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else if (pathElements[0].endsWith('[]')) {
        var arrayName = pathElements[0].substring(0, path[0].indexOf('['));
        if (json[arrayName] instanceof Array) {
            json[arrayName] = json[arrayName].map(function (v) { return jsonMutate(pathElements.slice(1), v, mutator); });
        }
    }
    else if (pathElements[0] === '*') {
        for (var jsonProp in json) {
            json[jsonProp] = jsonMutate(pathElements.slice(1), json[jsonProp], mutator);
        }
    }
    else if (json[pathElements[0]] != null) {
        json[pathElements[0]] = jsonMutate(pathElements.slice(1), json[pathElements[0]], mutator);
    }
    return json;
}
var merge = function (r, n) { return (__assign(__assign({}, r), n)); };
// Precise legacy palette fills/strokes can be found here for future reference:
// https://github.com/ag-grid/ag-grid/blob/b22.1.0/grid-enterprise-modules/charts/src/charts/chart/palettes.ts
var LEGACY_PALETTES = {
    borneo: 'ag-default',
    material: 'ag-material',
    pastel: 'ag-pastel',
    bright: 'ag-vivid',
    flat: 'ag-solar',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNb2RlbE1pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRNb2RlbE1pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsYUFBYTtBQUNiLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNuRSxhQUFhO0FBQ2IsT0FBTyxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3JGLGFBQWE7QUFDYixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXJDLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztBQUVwQixNQUFNLFVBQVUsaUJBQWlCLENBQUMsS0FBaUI7SUFDL0MsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUN0QyxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO1FBQ3ZCLDJFQUEyRTtRQUMzRSxLQUFLLENBQUMsT0FBTyxHQUFHLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsS0FBSyxHQUFHLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELEtBQUssR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRCxLQUFLLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkQsS0FBSyxHQUFHLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELEtBQUssR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN2RCxtREFBbUQ7SUFD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