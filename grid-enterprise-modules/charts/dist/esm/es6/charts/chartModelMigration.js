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
// @ts-ignore
import { getSeriesType } from './chartComp/utils/seriesTypeMapper';
// @ts-ignore
import { ALL_AXIS_TYPES, getLegacyAxisType } from './chartComp/utils/axisTypeMapper';
// @ts-ignore
import { VERSION } from '../version';
const DEBUG = false;
export function upgradeChartModel(model) {
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
    model = migrateIfBefore('29.1.0', model, migrateV29_1);
    model = migrateIfBefore('29.2.0', model, migrateV29_2);
    model = migrateIfBefore('30.0.0', model, migrateV30);
    model = cleanup(model);
    // Bump version to latest.
    model = migrateIfBefore(VERSION, model, (m) => m);
    if (DEBUG && originalVersion !== model.version) {
        console.log('AG Grid: ChartModel migration complete', { model });
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
    const _b = model, { chartType, chartPalette } = _b, // Migrate.
    _c = _b.chartOptions, // Migrate.
    { xAxis, yAxis } = _c, chartOptions = __rest(_c, ["xAxis", "yAxis"]), chartModel = __rest(_b, ["chartType", "chartPalette", "chartOptions"]);
    const axesTypes = getLegacyAxisType(chartType);
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
    const seriesTypes = [getSeriesType(chartType)];
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
        ALL_AXIS_TYPES.filter((v) => updatedAxes[v] == null).forEach((v) => {
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
    const tooltipOptUpdate = (_a) => {
        var _b, _c, _d, _e;
        var { tracking } = _a, opts = __rest(_a, ["tracking"]);
        const output = Object.assign({}, opts);
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
    const modelAny = model;
    if (model.version != null) {
        return model.version;
    }
    const hasKey = (obj, ...keys) => {
        return Object.keys(obj || {}).some((k) => keys.includes(k));
    };
    const chartOptions = modelAny.chartOptions;
    const seriesOptions = hasKey(chartOptions, 'seriesDefaults')
        ? chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions.seriesDefaults
        : chartOptions === null || chartOptions === void 0 ? void 0 : chartOptions[Object.keys(chartOptions)[0]];
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
function jsonAdd(path, value, json) {
    var _a;
    if (typeof path === 'string') {
        path = path.split('.');
    }
    const nextPath = path[0];
    if (path.length > 1) {
        json[nextPath] = jsonAdd(path.slice(1), value, (_a = json[nextPath]) !== null && _a !== void 0 ? _a : {});
    }
    const hasProperty = Object.keys(json).includes(nextPath);
    if (!hasProperty) {
        json[nextPath] = value;
    }
    return json;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNb2RlbE1pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRNb2RlbE1pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLGFBQWE7QUFDYixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDbkUsYUFBYTtBQUNiLE9BQU8sRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNyRixhQUFhO0FBQ2IsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVyQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUM7QUFFcEIsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQWlCO0lBQy9DLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDdEMsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtRQUN2QiwyRUFBMkU7UUFDM0UsS0FBSyxDQUFDLE9BQU8sR0FBRyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwRDtJQUVELEtBQUssR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRCxLQUFLLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDckQsS0FBSyxHQUFHLGVBQWUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3ZELEtBQUssR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRCxLQUFLLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkQsbURBQW1EO0lBQ25ELEtBQUssR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEtBQUss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