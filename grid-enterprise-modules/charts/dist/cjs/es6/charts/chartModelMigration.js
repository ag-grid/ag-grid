"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.heuristicVersionDetection = exports.upgradeChartModel = void 0;
// @ts-ignore
const seriesTypeMapper_1 = require("./chartComp/utils/seriesTypeMapper");
// @ts-ignore
const axisTypeMapper_1 = require("./chartComp/utils/axisTypeMapper");
// @ts-ignore
const version_1 = require("../version");
const DEBUG = false;
function upgradeChartModel(model) {
    const originalVersion = model.version;
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
    model = migrateIfBefore(version_1.VERSION, model, (m) => m);
    if (DEBUG && originalVersion !== model.version) {
        console.log('AG Grid: ChartModel migration complete', { model });
    }
    return model;
}
exports.upgradeChartModel = upgradeChartModel;
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
    const _b = model, { chartType, chartPalette } = _b, // Migrate.
    _c = _b.chartOptions, // Migrate.
    { xAxis, yAxis } = _c, chartOptions = __rest(_c, ["xAxis", "yAxis"]), chartModel = __rest(_b, ["chartType", "chartPalette", "chartOptions"]);
    const axesTypes = axisTypeMapper_1.getLegacyAxisType(chartType);
    const axes = axesTypes === null || axesTypes === void 0 ? void 0 : axesTypes.map((type, i) => (Object.assign({ type }, (i === 0 ? xAxis : yAxis))));
    return Object.assign({ chartType, chartThemeName: (_a = LEGACY_PALETTES[chartPalette]) !== null && _a !== void 0 ? _a : 'ag-default', chartOptions: Object.assign(Object.assign({}, chartOptions), { axes,
            xAxis,
            yAxis }) }, chartModel);
}
function migrateV25_1(model) {
    // https://github.com/ag-grid/ag-grid/commit/61943f9fecbfb5ac1b9a1fd93788f9fdd8687181
    model = jsonRename('chartOptions.seriesDefaults.label.minRequiredAngle', 'minAngle', model);
    return model;
}
function migrateV26(model) {
    // https://github.com/ag-grid/ag-grid/commit/df2445d88e64cb4e831d6163104a0fa60ccde3b5
    const highlightOptUpdate = (_a) => {
        var { dimOpacity } = _a, opts = __rest(_a, ["dimOpacity"]);
        return (Object.assign(Object.assign({}, opts), (dimOpacity != null ? { series: { dimOpacity } } : {})));
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
    const highlightOptUpdate = (_a) => {
        var { item, series } = _a, opts = __rest(_a, ["item", "series"]);
        return (Object.assign({ item: Object.assign(Object.assign({}, opts), item) }, (series ? { series } : {})));
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
    const _a = model, { chartType } = _a, _b = _a.chartOptions, { axes, series, seriesDefaults } = _b, otherChartOptions = __rest(_b, ["axes", "series", "seriesDefaults"]), otherModelProps = __rest(_a, ["chartType", "chartOptions"]);
    // At 26.2.0 combination charts weren't supported, so we can safely assume a single series type.
    // We can't rely on the `series.type` field as it was incorrect (in v25.0.0 line chart has an
    // `area` series).
    const seriesTypes = [seriesTypeMapper_1.getSeriesType(chartType)];
    const chartTypeMixin = {};
    if (!seriesTypes.includes('pie')) {
        const minimalAxis = { top: {}, bottom: {}, left: {}, right: {} };
        const updatedAxes = axes
            .map((_a) => {
            var { type } = _a, axisProps = __rest(_a, ["type"]);
            return ({
                [type]: Object.assign(Object.assign({}, minimalAxis), axisProps),
            });
        })
            .reduce(merge, {});
        axisTypeMapper_1.ALL_AXIS_TYPES.filter((v) => updatedAxes[v] == null).forEach((v) => {
            updatedAxes[v] = Object.assign({}, minimalAxis);
        });
        chartTypeMixin.axes = updatedAxes;
    }
    const updatedChartOptions = seriesTypes
        .map((t) => ({
        [t]: Object.assign(Object.assign(Object.assign({}, chartTypeMixin), { series: seriesDefaults }), otherChartOptions),
    }))
        .reduce(merge, {});
    model = Object.assign(Object.assign({}, otherModelProps), { chartType, chartOptions: updatedChartOptions });
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
function heuristicVersionDetection(model) {
    var _a, _b;
    const modelAny = model;
    if (model.version != null) {
        return model.version;
    }
    const hasKey = (obj, ...keys) => {
        return Object.keys(obj || {}).some((k) => keys.includes(k));
    };
    const chartOptions = modelAny.chartOptions;
    const seriesOptions = hasKey(chartOptions, 'seriesDefaults')
        ? chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions.seriesDefaults : chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions[Object.keys(chartOptions)[0]];
    const hints = {
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
    const defaultVersion = '27.1.0';
    const matchingHints = Object.entries(hints).filter(([_, match]) => match);
    if (DEBUG)
        console.log('AG Grid: ChartModel migration', { heuristicVersionCandidates: matchingHints });
    const [heuristicVersion = defaultVersion] = matchingHints[0];
    if (DEBUG)
        console.log('AG Grid: ChartModel migration', { heuristicVersion });
    return heuristicVersion;
}
exports.heuristicVersionDetection = heuristicVersionDetection;
function migrateIfBefore(maxVersion, model, migration) {
    if (versionNumber(maxVersion) > versionNumber(model.version)) {
        if (DEBUG)
            console.log('AG Grid: ChartModel migration', { migratingTo: maxVersion });
        const result = migration(model);
        result.version = maxVersion;
        if (DEBUG)
            console.log('AG Grid: ChartModel migration', { migratedTo: maxVersion, result });
        return result;
    }
    return model;
}
function versionParts(version) {
    const split = typeof version === 'string' ? version.split('.').map((v) => Number(v)) : [];
    if (split.length !== 3 || split.some((v) => isNaN(v))) {
        throw new Error('AG Grid - Illegal version string: ' + version);
    }
    return {
        major: split[0],
        minor: split[1],
        patch: split[2],
    };
}
function versionNumber(version) {
    const { major, minor, patch } = versionParts(version);
    // Return a number of the form MMmmPP.
    return major * 10000 + minor * 100 + patch;
}
function jsonDeleteDefault(path, defaultValue, json) {
    return jsonMutateProperty(path, true, json, (parent, prop) => {
        if (parent[prop] === defaultValue) {
            delete parent[prop];
        }
    });
}
function jsonBackfill(path, defaultValue, json) {
    return jsonMutateProperty(path, false, json, (parent, prop) => {
        if (parent[prop] == null) {
            parent[prop] = defaultValue;
        }
    });
}
function jsonMove(from, to, json) {
    let valueToMove = undefined;
    let valueFound = false;
    json = jsonMutateProperty(from, true, json, (parent, prop) => {
        valueFound = true;
        valueToMove = parent[prop];
        delete parent[prop];
    });
    if (!valueFound) {
        return json;
    }
    return jsonMutateProperty(to, false, json, (parent, prop) => {
        parent[prop] = valueToMove;
    });
}
function jsonMoveIfMissing(from, to, json) {
    let valueToMove = undefined;
    let valueFound = false;
    json = jsonMutateProperty(from, true, json, (parent, prop) => {
        valueFound = true;
        valueToMove = parent[prop];
        delete parent[prop];
    });
    if (!valueFound) {
        return json;
    }
    return jsonMutateProperty(to, false, json, (parent, prop) => {
        if (parent[prop] === undefined) {
            parent[prop] = valueToMove;
        }
    });
}
function jsonRename(path, renameTo, json) {
    return jsonMutateProperty(path, true, json, (parent, prop) => {
        parent[renameTo] = parent[prop];
        delete parent[prop];
    });
}
function jsonDelete(path, json) {
    return jsonMutateProperty(path, true, json, (parent, prop) => delete parent[prop]);
}
function jsonMutateProperty(path, skipMissing, json, mutator) {
    const pathElements = path instanceof Array ? path : path.split('.');
    const parentPathElements = pathElements.slice(0, pathElements.length - 1);
    const targetName = pathElements[pathElements.length - 1];
    return jsonMutate(parentPathElements, json, (parent) => {
        const hasProperty = Object.keys(parent).includes(targetName);
        if (skipMissing && !hasProperty) {
            return parent;
        }
        const result = Object.assign({}, parent);
        mutator(result, targetName);
        return result;
    });
}
function jsonMutate(path, json, mutator) {
    const pathElements = path instanceof Array ? path : path.split('.');
    // Clone to avoid mutating original input.
    json = Object.assign({}, json);
    if (pathElements.length === 0) {
        return mutator(json);
    }
    else if (pathElements[0].startsWith('{')) {
        const pathOptions = pathElements[0].substring(1, pathElements[0].lastIndexOf('}')).split(',');
        for (const pathOption of pathOptions) {
            if (json[pathOption] != null) {
                json[pathOption] = jsonMutate(pathElements.slice(1), json[pathOption], mutator);
            }
        }
    }
    else if (pathElements[0].endsWith('[]')) {
        const arrayName = pathElements[0].substring(0, path[0].indexOf('['));
        if (json[arrayName] instanceof Array) {
            json[arrayName] = json[arrayName].map((v) => jsonMutate(pathElements.slice(1), v, mutator));
        }
    }
    else if (pathElements[0] === '*') {
        for (const jsonProp in json) {
            json[jsonProp] = jsonMutate(pathElements.slice(1), json[jsonProp], mutator);
        }
    }
    else if (json[pathElements[0]] != null) {
        json[pathElements[0]] = jsonMutate(pathElements.slice(1), json[pathElements[0]], mutator);
    }
    return json;
}
const merge = (r, n) => (Object.assign(Object.assign({}, r), n));
// Precise legacy palette fills/strokes can be found here for future reference:
// https://github.com/ag-grid/ag-grid/blob/b22.1.0/grid-enterprise-modules/charts/src/charts/chart/palettes.ts
const LEGACY_PALETTES = {
    borneo: 'ag-default',
    material: 'ag-material',
    pastel: 'ag-pastel',
    bright: 'ag-vivid',
    flat: 'ag-solar',
};
