import { _ } from "@ag-grid-community/core";
import { CategoryAxis, getChartTheme, themes, } from "ag-charts-community";
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
            const themeOverrides = { overrides: this.chartOptions };
            this.chartTheme = getChartTheme(Object.assign({ baseTheme: this.getSelectedTheme() }, themeOverrides));
            return;
        }
        this.chartTheme = this.createChartTheme();
        this.chartOptions = this.convertConfigToOverrides(this.chartTheme.config);
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
            return getChartTheme(stockTheme ? Object.assign({ baseTheme: themeName }, themeOverrides) : getCustomTheme());
        }
        return getChartTheme(stockTheme ? themeName : this.lookupCustomChartTheme(themeName));
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
    downloadChart() {
        const { chart } = this;
        const fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    }
    getChartImageDataURL(type) {
        return this.chart.scene.getDataURL(type);
    }
    getChartOptions() {
        return this.chartOptions;
    }
    transformData(data, categoryKey) {
        if (this.chart.axes.filter(a => a instanceof CategoryAxis).length < 1) {
            return data;
        }
        // replace the values for the selected category with a complex object to allow for duplicated categories
        return data.map((d, index) => {
            const value = d[categoryKey];
            const valueString = value && value.toString ? value.toString() : '';
            const datum = Object.assign({}, d);
            datum[categoryKey] = { id: index, value, toString: () => valueString };
            return datum;
        });
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
//# sourceMappingURL=chartProxy.js.map