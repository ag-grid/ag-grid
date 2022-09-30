import { _ } from "@ag-grid-community/core";
import { AgChart, getIntegratedChartTheme, themes } from "ag-charts-community";
import { deepMerge } from "../utils/object";
import { getSeriesType } from "../utils/seriesTypeMapper";
export class ChartProxy {
    constructor(chartProxyParams) {
        this.chartProxyParams = chartProxyParams;
        this.chartType = chartProxyParams.chartType;
        this.crossFiltering = chartProxyParams.crossFiltering;
        this.crossFilterCallback = chartProxyParams.crossFilterCallback;
        this.standaloneChartType = getSeriesType(this.chartType);
        if (this.chartProxyParams.chartOptionsToRestore) {
            this.chartOptions = this.chartProxyParams.chartOptionsToRestore;
            this.chartPalette = this.chartProxyParams.chartPaletteToRestore;
            const themeOverrides = { overrides: this.chartOptions, palette: this.chartPalette };
            this.chartTheme = getIntegratedChartTheme(Object.assign({ baseTheme: this.getSelectedTheme() }, themeOverrides));
            return;
        }
        this.chartTheme = this.createChartTheme();
        this.chartOptions = this.convertConfigToOverrides(this.chartTheme.config);
        this.chartPalette = this.chartTheme.palette;
    }
    recreateChart() {
        if (this.chart) {
            this.destroyChart();
        }
        this.chart = this.createChart();
        if (this.crossFiltering) {
            // add event listener to chart canvas to detect when user wishes to reset filters
            const resetFilters = true;
            this.chart.addEventListener('click', (e) => this.crossFilterCallback(e, resetFilters));
        }
    }
    getChart() {
        return this.chart;
    }
    createChartTheme() {
        const themeName = this.getSelectedTheme();
        const stockTheme = this.isStockTheme(themeName);
        const gridOptionsThemeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();
        const apiThemeOverrides = this.chartProxyParams.apiChartThemeOverrides;
        if (gridOptionsThemeOverrides || apiThemeOverrides) {
            const themeOverrides = {
                overrides: ChartProxy.mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides)
            };
            const getCustomTheme = () => deepMerge(this.lookupCustomChartTheme(themeName), themeOverrides);
            return getIntegratedChartTheme(stockTheme ? Object.assign({ baseTheme: themeName }, themeOverrides) : getCustomTheme());
        }
        return getIntegratedChartTheme(stockTheme ? themeName : this.lookupCustomChartTheme(themeName));
    }
    isStockTheme(themeName) {
        return _.includes(Object.keys(themes), themeName);
    }
    getSelectedTheme() {
        let chartThemeName = this.chartProxyParams.getChartThemeName();
        const availableThemes = this.chartProxyParams.getChartThemes();
        if (!_.includes(availableThemes, chartThemeName)) {
            chartThemeName = availableThemes[0];
        }
        return chartThemeName;
    }
    lookupCustomChartTheme(name) {
        const { customChartThemes } = this.chartProxyParams;
        const customChartTheme = customChartThemes && customChartThemes[name];
        if (!customChartTheme) {
            console.warn(`AG Grid: no stock theme exists with the name '${name}' and no ` +
                "custom chart theme with that name was supplied to 'customChartThemes'");
        }
        return customChartTheme;
    }
    static mergeThemeOverrides(gridOptionsThemeOverrides, apiThemeOverrides) {
        if (!gridOptionsThemeOverrides) {
            return apiThemeOverrides;
        }
        if (!apiThemeOverrides) {
            return gridOptionsThemeOverrides;
        }
        return deepMerge(gridOptionsThemeOverrides, apiThemeOverrides);
    }
    downloadChart(dimensions, fileName, fileFormat) {
        const { chart } = this;
        const imageFileName = fileName || (chart.title ? chart.title.text : 'chart');
        const { width, height } = dimensions || {};
        AgChart.download(chart, { width, height, fileName: imageFileName, fileFormat });
    }
    getChartImageDataURL(type) {
        return this.chart.scene.getDataURL(type);
    }
    getChartOptions() {
        return this.chartOptions;
    }
    getChartPalette() {
        return this.chartPalette;
    }
    transformData(data, categoryKey, categoryAxis) {
        if (categoryAxis) {
            // replace the values for the selected category with a complex object to allow for duplicated categories
            return data.map((d, index) => {
                const value = d[categoryKey];
                const valueString = value && value.toString ? value.toString() : '';
                const datum = Object.assign({}, d);
                datum[categoryKey] = { id: index, value, toString: () => valueString };
                return datum;
            });
        }
        return data;
    }
    getCommonChartOptions() {
        const getChartOption = (propertyKey) => {
            return _.get(this.chartOptions, `${this.standaloneChartType}.${propertyKey}`, undefined);
        };
        return {
            padding: getChartOption('padding'),
            background: getChartOption('background'),
            title: getChartOption('title'),
            subtitle: getChartOption('subtitle'),
            tooltip: getChartOption('tooltip'),
            legend: getChartOption('legend'),
            navigator: getChartOption('navigator'),
        };
    }
    convertConfigToOverrides(config) {
        const isComboChart = ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(this.chartType);
        const overrideObjs = isComboChart ? ['line', 'area', 'column', 'cartesian'] : [this.standaloneChartType];
        const overrides = {};
        overrideObjs.forEach(overrideObj => {
            const chartOverrides = deepMerge({}, config[overrideObj]);
            chartOverrides.series = chartOverrides.series[overrideObj];
            // special handing to add the scatter paired mode to the chart options
            if (overrideObj === 'scatter') {
                chartOverrides.paired = true;
            }
            overrides[overrideObj] = chartOverrides;
        });
        return overrides;
    }
    destroy() {
        this.destroyChart();
    }
    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    }
}
