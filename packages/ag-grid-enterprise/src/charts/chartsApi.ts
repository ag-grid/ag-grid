import type {
    ChartDownloadParams,
    ChartModel,
    ChartRef,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    OpenChartToolPanelParams,
    UpdateChartParams,
    _BeanCollection,
} from 'ag-grid-community';

export function getChartModels(beans: _BeanCollection): ChartModel[] | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.getChartModels());
}

export function getChartRef(beans: _BeanCollection, chartId: string): ChartRef | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.getChartRef(chartId));
}

export function getChartImageDataURL(beans: _BeanCollection, params: GetChartImageDataUrlParams): string | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.getChartImageDataURL(params));
}

export function downloadChart(beans: _BeanCollection, params: ChartDownloadParams) {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.downloadChart(params));
}

export function openChartToolPanel(beans: _BeanCollection, params: OpenChartToolPanelParams) {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.openChartToolPanel(params));
}

export function closeChartToolPanel(beans: _BeanCollection, params: CloseChartToolPanelParams) {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.closeChartToolPanel(params.chartId));
}

export function createRangeChart(beans: _BeanCollection, params: CreateRangeChartParams): ChartRef | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.createRangeChart(params, true));
}

export function createPivotChart(beans: _BeanCollection, params: CreatePivotChartParams): ChartRef | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.createPivotChart(params, true));
}

export function createCrossFilterChart(
    beans: _BeanCollection,
    params: CreateCrossFilterChartParams
): ChartRef | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.createCrossFilterChart(params, true));
}

export function updateChart(beans: _BeanCollection, params: UpdateChartParams): void {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.updateChart(params));
}

export function restoreChart(
    beans: _BeanCollection,
    chartModel: ChartModel,
    chartContainer?: HTMLElement
): ChartRef | undefined {
    return beans.frameworkOverrides.wrapIncoming(() => beans.chartSvc?.restoreChart(chartModel, chartContainer));
}
