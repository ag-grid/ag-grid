import { ChartModel } from '@ag-grid-community/core';
import { getSeriesType } from './chartComp/utils/seriesTypeMapper';

// the line below is automatically modified during releases - do not modify
// (see scripts/release/updateChartModel.js)
export const CURRENT_VERSION = '28.2.0';

const DEBUG = false;

export function upgradeChartModel(model: ChartModel): ChartModel {
    if (model.version == null) {
        // Try to guess the version so we can apply the right subset of migrations.
        model.version = heuristicVersionDetection(model);
    }

    model = migrateIfBefore('23.0.0', model, migrateV23);
    model = migrateIfBefore('24.0.0', model, migrateV24);
    model = migrateIfBefore('25.1.0', model, migrateV25_1);
    model = migrateIfBefore('26.0.0', model, migrateV26);
    model = migrateIfBefore('26.0.0', model, migrateV26_1);
    // Switch from iChartOptions to iAgChartOptions....
    model = migrateIfBefore('26.2.0', model, migrateV26_2);
    model = migrateIfBefore('28.2.0', model, migrateV28_2);

    // Bump version to latest.
    model = migrateIfBefore(CURRENT_VERSION, model, (m) => m);

    return model;
}

function migrateV23(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/76c6744ff2b732d298d1ade73c122188854b5bac
    const markerUpdate = ({ type, ...marker }: any) => ({ shape: type, ...marker });
    model = jsonMutate('chartOptions.legend.item.marker', model, markerUpdate);
    model = jsonMutate('chartOptions.seriesDefaults.marker', model, markerUpdate);

    // https://github.com/ag-grid/ag-grid/commit/7bdf2cfd666acda758a818733a9f9cb35ac1d7a7
    const legendUpdate = ({ padding, ...legend }: any) => ({ spacing: padding, ...legend });
    model = jsonMutate('chartOptions.legend', model, legendUpdate);

    return model;
}

function migrateV24(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/f4e854e3dc459400fa00e6da2873cb8e9cfff6fe#
    const markerUpdate = ({ minSize, ...marker }: any) => ({ ...marker });
    model = jsonMutate('chartOptions.seriesDefaults.marker', model, markerUpdate);
    return model;
}

function migrateV25_1(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/61943f9fecbfb5ac1b9a1fd93788f9fdd8687181
    const pieLabelUpdate = ({ minRequiredAngle, ...label }: any) => ({ minAngle: minRequiredAngle, ...label });
    if (model.chartType === 'pie') {
        model = jsonMutate('chartOptions.seriesDefaults.label', model, pieLabelUpdate);
    }
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
    const {
        chart,
        chartOptions: {
            seriesDefaults: { tooltipClass, tooltipTracking, ...sProps },
            ...chartProps
        },
        ...props
    } = model as any;
    return { chartOptions: { seriesDefaults: sProps, ...chartProps }, ...props } as any;
}

function migrateV26_1(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/df2445d88e64cb4e831d6163104a0fa60ccde3b5
    const highlightOptUpdate = ({ item, series, ...opts }: any) => ({
        item: { ...opts, ...item },
        series,
    });
    return jsonMutate('chartOptions.seriesDefaults.highlightStyle', model, highlightOptUpdate);
}

function migrateV26_2(model: ChartModel) {
    // https://github.com/ag-grid/ag-grid/commit/8b2e223cb1a687cb6c1d70b9f75f52fa29d00341
    const modelAny = model as any;

    const {
        chartType,
        chartOptions: { axes, series, seriesDefaults, xAxis, yAxis, ...otherChartOptions },
        ...otherModelProps
    } = modelAny;
    const seriesTypes = series?.map((s: any) => s.type) ?? [getSeriesType(chartType)];

    const merge = (r: {}, n: {}) => ({ ...r, ...n });

    const updatedAxes = axes
        .map(({ type, ...axisProps }: any) => ({
            [type]: { ...axisProps },
        }))
        .reduce(merge, {});

    const updatedChartOptions = seriesTypes
        .map((t: string) => ({
            [t]: {
                axes: updatedAxes,
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

function migrateV28_2(model: ChartModel) {
    // series.yKeys => yKey ?
    // series.yNames => yName ?

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
    } else if (json[pathElements[0]] != null) {
        json[pathElements[0]] = jsonMutate(pathElements.slice(1), json[pathElements[0]], mutator);
    }

    return json;
}
