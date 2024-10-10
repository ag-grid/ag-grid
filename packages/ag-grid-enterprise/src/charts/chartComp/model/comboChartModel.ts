import type { ChartType, SeriesChartType } from 'ag-grid-community';
import { BeanStub, _warn } from 'ag-grid-community';

import type { ChartDataModel, ColState } from './chartDataModel';

const SUPPORTED_COMBO_CHART_TYPES = new Set(['line', 'groupedColumn', 'stackedColumn', 'area', 'stackedArea']);

export class ComboChartModel extends BeanStub {
    public seriesChartTypes: SeriesChartType[];
    public savedCustomSeriesChartTypes: SeriesChartType[];

    // this control flag is used to only log warning for the initial user config
    private suppressComboChartWarnings = false;
    private chartDataModel: ChartDataModel;

    public constructor(chartDataModel: ChartDataModel) {
        super();
        this.chartDataModel = chartDataModel;
        this.seriesChartTypes = chartDataModel.params.seriesChartTypes ?? [];
    }

    public postConstruct(): void {
        this.initComboCharts();
    }

    public update(seriesChartTypes?: SeriesChartType[]): void {
        this.seriesChartTypes = seriesChartTypes ?? this.seriesChartTypes;
        this.initComboCharts();
        this.updateSeriesChartTypes();
    }

    private initComboCharts() {
        const seriesChartTypesExist = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        const customCombo = this.chartDataModel.chartType === 'customCombo' || seriesChartTypesExist;
        if (customCombo) {
            // it is not necessary to supply a chart type for combo charts when `seriesChartTypes` is supplied
            this.chartDataModel.chartType = 'customCombo';

            // cache supplied `seriesChartTypes` to allow switching between different chart types in the settings panel
            this.savedCustomSeriesChartTypes = this.seriesChartTypes || [];
        }
    }

    public updateSeriesChartTypes(): void {
        if (!this.chartDataModel.isComboChart()) {
            return;
        }

        // ensure primary only chart types are not placed on secondary axis
        this.seriesChartTypes = this.seriesChartTypes.map((seriesChartType) => {
            const primaryOnly = ['groupedColumn', 'stackedColumn', 'stackedArea'].includes(seriesChartType.chartType);
            seriesChartType.secondaryAxis = primaryOnly ? false : seriesChartType.secondaryAxis;
            return seriesChartType;
        });

        // note that when seriesChartTypes are supplied the chart type is also changed to 'customCombo'
        if (this.chartDataModel.chartType === 'customCombo') {
            this.updateSeriesChartTypesForCustomCombo();
            return;
        }

        this.updateChartSeriesTypesForBuiltInCombos();
    }

    private updateSeriesChartTypesForCustomCombo() {
        const seriesChartTypesSupplied = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        if (!seriesChartTypesSupplied && !this.suppressComboChartWarnings) {
            _warn(150);
        }

        // ensure correct chartTypes are supplied
        this.seriesChartTypes = this.seriesChartTypes.map((s) => {
            if (!SUPPORTED_COMBO_CHART_TYPES.has(s.chartType)) {
                _warn(151, { chartType: s.chartType });
                s.chartType = 'line';
            }
            return s;
        });

        const getSeriesChartType = (valueCol: ColState): SeriesChartType => {
            if (!this.savedCustomSeriesChartTypes || this.savedCustomSeriesChartTypes.length === 0) {
                this.savedCustomSeriesChartTypes = this.seriesChartTypes;
            }

            const providedSeriesChartType = this.savedCustomSeriesChartTypes.find((s) => s.colId === valueCol.colId);
            if (!providedSeriesChartType) {
                if (valueCol.selected && !this.suppressComboChartWarnings) {
                    _warn(152, { colId: valueCol.colId });
                }
                return {
                    colId: valueCol.colId,
                    chartType: 'line',
                    secondaryAxis: false,
                };
            }

            return providedSeriesChartType;
        };

        const updatedSeriesChartTypes = this.chartDataModel.valueColState.map(getSeriesChartType);

        this.seriesChartTypes = updatedSeriesChartTypes;

        // also cache custom `seriesChartTypes` to allow for switching between different chart types
        this.savedCustomSeriesChartTypes = updatedSeriesChartTypes;

        // turn off warnings as first combo chart attempt has completed
        this.suppressComboChartWarnings = true;
    }

    private updateChartSeriesTypesForBuiltInCombos() {
        const { chartType, valueColState } = this.chartDataModel;

        const primaryChartType: ChartType = chartType === 'columnLineCombo' ? 'groupedColumn' : 'stackedArea';
        const secondaryChartType: ChartType = chartType === 'columnLineCombo' ? 'line' : 'groupedColumn';

        const selectedCols = valueColState.filter((cs) => cs.selected);
        const lineIndex = Math.ceil(selectedCols.length / 2);
        this.seriesChartTypes = selectedCols.map((valueCol: ColState, i: number) => {
            const seriesType = i >= lineIndex ? secondaryChartType : primaryChartType;
            return { colId: valueCol.colId, chartType: seriesType, secondaryAxis: false };
        });
    }
}
