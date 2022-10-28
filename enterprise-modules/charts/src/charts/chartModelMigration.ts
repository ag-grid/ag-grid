import { ChartModel, AgChartThemeName } from '@ag-grid-community/core';
import { getSeriesType } from './chartComp/utils/seriesTypeMapper';
import { getLegacyAxisType, ALL_AXIS_TYPES } from './chartComp/utils/axisTypeMapper';

// the line below is automatically modified during releases - do not modify
// (see scripts/release/updateChartModel.js)
export const CURRENT_VERSION = '28.2.0';

const DEBUG = (window as any)['agChartsDebug'] === true;

export function upgradeChartModel(model: ChartModel): ChartModel {
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
    model = cleanup(model);

    // Bump version to latest.
    model = migrateIfBefore(CURRENT_VERSION, model, (m) => m);

    return model;
}

function migrateV23(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/76c6744ff2b732d298d1ade73c122188854b5bac
    model = jsonRename('chartOptions.legend.item.marker.type', 'shape', model);
    model = jsonRename('chartOptions.seriesDefaults.marker.type', 'shape', model);

    // https://github.com/ag-grid/ag-grid/commit/7bdf2cfd666acda758a818733a9f9cb35ac1d7a7
    model = jsonRename('chartOptions.legend.padding', 'spacing', model);

    return model;
}

function migrateV24(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/f4e854e3dc459400fa00e6da2873cb8e9cfff6fe#
    model = jsonDelete('chartOptions.seriesDefaults.marker.minSize', model);

    const {
        chartType,
        chartPalette, // Migrate.
        chartOptions: { xAxis, yAxis, ...chartOptions },
        ...chartModel
    } = model as any;
    const axesTypes = getLegacyAxisType(chartType);
    const axes = axesTypes?.map((type, i) => ({
        type,
        ...(i === 0 ? xAxis : yAxis),
    }));

    return {
        chartType,
        chartThemeName: LEGACY_PALETTES[chartPalette] ?? 'ag-default',
        chartOptions: {
            ...chartOptions,
            axes,
            xAxis,
            yAxis,
        },
        ...chartModel,
    } as ChartModel;
}

function migrateV25_1(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/61943f9fecbfb5ac1b9a1fd93788f9fdd8687181
    model = jsonRename('chartOptions.seriesDefaults.label.minRequiredAngle', 'minAngle', model);
    return model;
}

function migrateV26(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/df2445d88e64cb4e831d6163104a0fa60ccde3b5
    const highlightOptUpdate = ({ dimOpacity, ...opts }: any) => ({
        ...opts,
        ...(dimOpacity != null ? { series: { dimOpacity } } : {}),
    });
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

function migrateV26_1(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/df2445d88e64cb4e831d6163104a0fa60ccde3b5
    const highlightOptUpdate = ({ item, series, ...opts }: any) => ({
        item: { ...opts, ...item },
        ...(series ? { series } : {}),
    });
    model = jsonMutate('chartOptions.seriesDefaults.highlightStyle', model, highlightOptUpdate);
    model = jsonMutate('chartOptions.series[].highlightStyle', model, highlightOptUpdate);
    return model;
}

function migrateV26_2(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/8b2e223cb1a687cb6c1d70b9f75f52fa29d00341
    model = jsonDelete('chartOptions.seriesDefaults.fill', model);
    model = jsonDelete('chartOptions.seriesDefaults.stroke', model);
    model = jsonDelete('chartOptions.seriesDefaults.callout.colors', model);
    model = jsonDelete('chartOptions.xAxis', model);
    model = jsonDelete('chartOptions.yAxis', model);
    const {
        chartType,
        chartOptions: { axes, series, seriesDefaults, ...otherChartOptions },
        ...otherModelProps
    } = model as any;

    // At 26.2.0 combination charts weren't supported, so we can safely assume a single series type.
    // We can't rely on the `series.type` field as it was incorrect (in v25.0.0 line chart has an
    // `area` series).
    const seriesTypes = [getSeriesType(chartType)];

    const chartTypeMixin: any = {};
    if (!seriesTypes.includes('pie')) {
        const minimalAxis = { top: {}, bottom: {}, left: {}, right: {} };
        const updatedAxes = axes
            .map(({ type, ...axisProps }: any) => ({
                [type]: { ...minimalAxis, ...axisProps },
            }))
            .reduce(merge, {});
        ALL_AXIS_TYPES.filter((v) => updatedAxes[v] == null).forEach((v) => {
            updatedAxes[v] = { ...minimalAxis };
        });
        chartTypeMixin.axes = updatedAxes;
    }

    const updatedChartOptions = seriesTypes
        .map((t: string) => ({
            [t]: {
                ...chartTypeMixin,
                series: seriesDefaults,
                ...otherChartOptions,
            },
        }))
        .reduce(merge, {});

    model = {
        ...otherModelProps,
        chartType,
        chartOptions: updatedChartOptions,
    };

    return model;
}

function migrateV28(model: ChartModel) {
    model = jsonDelete('chartOptions.*.title.padding', model);
    model = jsonDelete('chartOptions.*.subtitle.padding', model);
    model = jsonDelete('chartOptions.*.axes.*.title.padding', model);
    model = jsonBackfill('chartOptions.*.axes.*.title.enabled', false, model);

    return model;
}

function migrateV28_2(model: ChartModel) {
    model = jsonRename('chartOptions.pie.series.callout', 'calloutLine', model);
    model = jsonRename('chartOptions.pie.series.label', 'calloutLabel', model);

    // series.yKeys => yKey ?
    // series.yNames => yName ?

    return model;
}

function cleanup(model: ChartModel) {
    // Remove fixed width/height - this has never been supported via UI configuration.
    model = jsonDelete('chartOptions.*.width', model);
    model = jsonDelete('chartOptions.*.height', model);
    model = jsonBackfill('chartOptions.*.axes.category.label.autoRotate', true, model);

    return model;
}

export function heuristicVersionDetection(model: ChartModel) {
    const modelAny = model as any;

    if (model.version != null) {
        return model.version;
    }

    const hasKey = (obj: any, ...keys: string[]) => {
        return Object.keys(obj || {}).some((k) => keys.includes(k));
    };

    const chartOptions = modelAny.chartOptions;
    const seriesOptions = hasKey(chartOptions, 'seriesDefaults')
        ? chartOptions?.seriesDefaults
        : chartOptions?.[Object.keys(chartOptions)[0]];
    const hints = {
        '27.0.0': hasKey(modelAny, 'seriesChartTypes'),
        '26.2.0': !hasKey(chartOptions, 'seriesDefaults'),
        '26.1.0': hasKey(seriesOptions?.highlightStyle, 'item'),
        '26.0.0': hasKey(seriesOptions?.highlightStyle, 'series'),
        // '26.0.0': modelAny.chart === undefined,
        '25.1.0': hasKey(seriesOptions?.label, 'minAngle'),
        '25.0.0':
            hasKey(modelAny, 'modelType', 'aggFunc', 'unlinkChart', 'suppressChartRanges') ||
            hasKey(seriesOptions, 'lineDash', 'lineDashOffset'),
        '24.0.0': hasKey(modelAny, 'chartThemeName', 'chart') || hasKey(chartOptions, 'series'),
        '23.2.0': hasKey(chartOptions, 'navigator'),
        '23.0.0': hasKey(chartOptions?.legend?.item?.marker, 'shape'),
        '22.1.0': hasKey(modelAny, 'chartPalette', 'chartType'),
    };

    // Default to 27.1.0, the last version before we added `version`.
    const defaultVersion = '27.1.0';
    const matchingHints = Object.entries(hints).filter(([_, match]) => match);

    if (DEBUG) console.log('AG Grid: ChartModel migration', { heuristicVersionCandidates: matchingHints });
    const [heuristicVersion = defaultVersion] = matchingHints[0];

    if (DEBUG) console.log('AG Grid: ChartModel migration', { heuristicVersion });
    return heuristicVersion;
}

function migrateIfBefore(maxVersion: string, model: ChartModel, migration: (m: ChartModel) => ChartModel): ChartModel {
    if (versionNumber(maxVersion) > versionNumber(model.version!)) {
        if (DEBUG) console.log('AG Grid: ChartModel migration', { migratingTo: maxVersion });

        const result = migration(model);
        result.version = maxVersion;
        return result;
    }

    return model;
}

type VersionParts = { major: number; minor: number; patch: number };
function versionParts(version: string): VersionParts {
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

function versionNumber(version: string): number {
    const { major, minor, patch } = versionParts(version);

    // Return a number of the form MMmmPP.
    return major * 10_000 + minor * 100 + patch;
}

function jsonDeleteDefault(path: string | string[], defaultValue: any, json: any): any {
    return jsonMutateProperty(path, true, json, (parent, prop) => {
        if (parent[prop] === defaultValue) {
            delete parent[prop];
        }
    });
}

function jsonBackfill(path: string | string[], defaultValue: any, json: any): any {
    return jsonMutateProperty(path, false, json, (parent, prop) => {
        if (parent[prop] == null) {
            parent[prop] = defaultValue;
        }
    });
}

function jsonRename(path: string | string[], renameTo: string, json: any): any {
    return jsonMutateProperty(path, true, json, (parent, prop) => {
        parent[renameTo] = parent[prop];
        delete parent[prop];
    });
}

function jsonDelete(path: string | string[], json: any): any {
    return jsonMutateProperty(path, true, json, (parent, prop) => delete parent[prop]);
}

function jsonMutateProperty(
    path: string | string[],
    skipMissing: boolean,
    json: any,
    mutator: (parent: any, targetProp: string) => any
): void {
    const pathElements = path instanceof Array ? path : path.split('.');
    const parentPathElements = pathElements.slice(0, pathElements.length - 1);
    const targetName = pathElements[pathElements.length - 1];

    return jsonMutate(parentPathElements, json, (parent) => {
        const hasProperty = Object.keys(parent).includes(targetName);
        if (skipMissing && !hasProperty) {
            return parent;
        }

        const result = { ...parent };
        mutator(result, targetName);
        return result;
    });
}

function jsonMutate(path: string | string[], json: any, mutator: (v: any) => any): any {
    const pathElements = path instanceof Array ? path : path.split('.');

    // Clone to avoid mutating original input.
    json = { ...json };

    if (pathElements.length === 0) {
        return mutator(json);
    } else if (pathElements[0].startsWith('{')) {
        const pathOptions = pathElements[0].substring(1, pathElements[0].lastIndexOf('}')).split(',');
        for (const pathOption of pathOptions) {
            if (json[pathOption] != null) {
                json[pathOption] = jsonMutate(pathElements.slice(1), json[pathOption], mutator);
            }
        }
    } else if (pathElements[0].endsWith('[]')) {
        const arrayName = pathElements[0].substring(0, path[0].indexOf('['));
        if (json[arrayName] instanceof Array) {
            json[arrayName] = json[arrayName].map((v: any) => jsonMutate(pathElements.slice(1), v, mutator));
        }
    } else if (pathElements[0] === '*') {
        for (const jsonProp in json) {
            json[jsonProp] = jsonMutate(pathElements.slice(1), json[jsonProp], mutator);
        }
    } else if (json[pathElements[0]] != null) {
        json[pathElements[0]] = jsonMutate(pathElements.slice(1), json[pathElements[0]], mutator);
    }

    return json;
}

const merge = (r: {}, n: {}) => ({ ...r, ...n });

// Precise legacy palette fills/strokes can be found here for future reference:
// https://github.com/ag-grid/ag-grid/blob/b22.1.0/enterprise-modules/charts/src/charts/chart/palettes.ts
const LEGACY_PALETTES: Record<string, AgChartThemeName> = {
    borneo: 'ag-default',
    material: 'ag-material',
    pastel: 'ag-pastel',
    bright: 'ag-vivid',
    flat: 'ag-solar',
};
