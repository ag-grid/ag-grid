import type {
    BeanCollection,
    ChartDownloadParams,
    ChartModel,
    ChartRef,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    GridApi,
    OpenChartToolPanelParams,
    UpdateChartParams,
} from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry } from '@ag-grid-community/core';

function assertChart<T>(beans: BeanCollection, methodName: keyof GridApi, func: () => T): T | undefined {
    if (
        ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.' + methodName, beans.context.getGridId())
    ) {
        return beans.frameworkOverrides.wrapIncoming(() => func());
    }
}

export function getChartModels(beans: BeanCollection): ChartModel[] | undefined {
    return assertChart(beans, 'getChartModels', () => beans.chartService!.getChartModels());
}

export function getChartRef(beans: BeanCollection, chartId: string): ChartRef | undefined {
    return assertChart(beans, 'getChartRef', () => beans.chartService!.getChartRef(chartId));
}

export function getChartImageDataURL(beans: BeanCollection, params: GetChartImageDataUrlParams): string | undefined {
    return assertChart(beans, 'getChartImageDataURL', () => beans.chartService!.getChartImageDataURL(params));
}

export function downloadChart(beans: BeanCollection, params: ChartDownloadParams) {
    return assertChart(beans, 'downloadChart', () => beans.chartService!.downloadChart(params));
}

export function openChartToolPanel(beans: BeanCollection, params: OpenChartToolPanelParams) {
    return assertChart(beans, 'openChartToolPanel', () => beans.chartService!.openChartToolPanel(params));
}

export function closeChartToolPanel(beans: BeanCollection, params: CloseChartToolPanelParams) {
    return assertChart(beans, 'closeChartToolPanel', () => beans.chartService!.closeChartToolPanel(params.chartId));
}

export function createRangeChart(beans: BeanCollection, params: CreateRangeChartParams): ChartRef | undefined {
    return assertChart(beans, 'createRangeChart', () => beans.chartService!.createRangeChart(params));
}

export function createPivotChart(beans: BeanCollection, params: CreatePivotChartParams): ChartRef | undefined {
    return assertChart(beans, 'createPivotChart', () => beans.chartService!.createPivotChart(params));
}

export function createCrossFilterChart(
    beans: BeanCollection,
    params: CreateCrossFilterChartParams
): ChartRef | undefined {
    return assertChart(beans, 'createCrossFilterChart', () => beans.chartService!.createCrossFilterChart(params));
}

export function updateChart(beans: BeanCollection, params: UpdateChartParams): void {
    return assertChart(beans, 'updateChart', () => beans.chartService!.updateChart(params));
}

export function restoreChart(
    beans: BeanCollection,
    chartModel: ChartModel,
    chartContainer?: HTMLElement
): ChartRef | undefined {
    return assertChart(beans, 'restoreChart', () => beans.chartService!.restoreChart(chartModel, chartContainer));
}
