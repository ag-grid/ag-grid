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
import { getSeriesType } from './chartComp/utils/seriesTypeMapper';
import { getLegacyAxisType, ALL_AXIS_TYPES } from './chartComp/utils/axisTypeMapper';
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
    return __assign({ chartType: chartType, chartThemeName: (_a = LEGACY_PALETTES[chartPalette]) !== null && _a !== void 0 ? _a : 'ag-default', chartOptions: __assign(__assign({}, chartOptions), { axes: axes,
            xAxis: xAxis,
            yAxis: yAxis }) }, chartModel);
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
        ? chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions.seriesDefaults : chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions[Object.keys(chartOptions)[0]];
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
// https://github.com/ag-grid/ag-grid/blob/b22.1.0/enterprise-modules/charts/src/charts/chart/palettes.ts
var LEGACY_PALETTES = {
    borneo: 'ag-default',
    material: 'ag-material',
    pastel: 'ag-pastel',
    bright: 'ag-vivid',
    flat: 'ag-solar',
};
