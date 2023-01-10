export function deproxy(chartOrProxy) {
    if (chartOrProxy.chart != null) {
        return chartOrProxy.chart;
    }
    return chartOrProxy;
}
