var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub, PostConstruct, } from "@ag-grid-community/core";
export class ComboChartModel extends BeanStub {
    constructor(chartDataModel) {
        var _a;
        super();
        // this control flag is used to only log warning for the initial user config
        this.suppressComboChartWarnings = false;
        this.chartDataModel = chartDataModel;
        this.seriesChartTypes = (_a = chartDataModel.params.seriesChartTypes) !== null && _a !== void 0 ? _a : [];
    }
    init() {
        this.initComboCharts();
    }
    update(seriesChartTypes) {
        this.seriesChartTypes = seriesChartTypes !== null && seriesChartTypes !== void 0 ? seriesChartTypes : this.seriesChartTypes;
        this.initComboCharts();
        this.updateSeriesChartTypes();
    }
    initComboCharts() {
        const seriesChartTypesExist = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        const customCombo = this.chartDataModel.chartType === 'customCombo' || seriesChartTypesExist;
        if (customCombo) {
            // it is not necessary to supply a chart type for combo charts when `seriesChartTypes` is supplied
            this.chartDataModel.chartType = 'customCombo';
            // cache supplied `seriesChartTypes` to allow switching between different chart types in the settings panel
            this.savedCustomSeriesChartTypes = this.seriesChartTypes || [];
        }
    }
    updateSeriesChartTypes() {
        if (!this.chartDataModel.isComboChart()) {
            return;
        }
        // ensure primary only chart types are not placed on secondary axis
        this.seriesChartTypes = this.seriesChartTypes.map(seriesChartType => {
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
    updateSeriesChartTypesForCustomCombo() {
        const seriesChartTypesSupplied = this.seriesChartTypes && this.seriesChartTypes.length > 0;
        if (!seriesChartTypesSupplied && !this.suppressComboChartWarnings) {
            console.warn(`AG Grid: 'seriesChartTypes' are required when the 'customCombo' chart type is specified.`);
        }
        // ensure correct chartTypes are supplied
        this.seriesChartTypes = this.seriesChartTypes.map(s => {
            if (!ComboChartModel.SUPPORTED_COMBO_CHART_TYPES.includes(s.chartType)) {
                console.warn(`AG Grid: invalid chartType '${s.chartType}' supplied in 'seriesChartTypes', converting to 'line' instead.`);
                s.chartType = 'line';
            }
            return s;
        });
        const getSeriesChartType = (valueCol) => {
            if (!this.savedCustomSeriesChartTypes || this.savedCustomSeriesChartTypes.length === 0) {
                this.savedCustomSeriesChartTypes = this.seriesChartTypes;
            }
            const providedSeriesChartType = this.savedCustomSeriesChartTypes.find(s => s.colId === valueCol.colId);
            if (!providedSeriesChartType) {
                if (valueCol.selected && !this.suppressComboChartWarnings) {
                    console.warn(`AG Grid: no 'seriesChartType' found for colId = '${valueCol.colId}', defaulting to 'line'.`);
                }
                return {
                    colId: valueCol.colId,
                    chartType: 'line',
                    secondaryAxis: false
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
    updateChartSeriesTypesForBuiltInCombos() {
        const { chartType, valueColState } = this.chartDataModel;
        let primaryChartType = chartType === 'columnLineCombo' ? 'groupedColumn' : 'stackedArea';
        let secondaryChartType = chartType === 'columnLineCombo' ? 'line' : 'groupedColumn';
        const selectedCols = valueColState.filter(cs => cs.selected);
        const lineIndex = Math.ceil(selectedCols.length / 2);
        this.seriesChartTypes = selectedCols.map((valueCol, i) => {
            const seriesType = (i >= lineIndex) ? secondaryChartType : primaryChartType;
            return { colId: valueCol.colId, chartType: seriesType, secondaryAxis: false };
        });
    }
}
ComboChartModel.SUPPORTED_COMBO_CHART_TYPES = ['line', 'groupedColumn', 'stackedColumn', 'area', 'stackedArea'];
__decorate([
    PostConstruct
], ComboChartModel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYm9DaGFydE1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbW9kZWwvY29tYm9DaGFydE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQWEsYUFBYSxHQUFvQixNQUFNLHlCQUF5QixDQUFDO0FBRy9GLE1BQU0sT0FBTyxlQUFnQixTQUFRLFFBQVE7SUFVekMsWUFBbUIsY0FBOEI7O1FBQzdDLEtBQUssRUFBRSxDQUFDO1FBTFosNEVBQTRFO1FBQ3BFLCtCQUEwQixHQUFHLEtBQUssQ0FBQztRQUt2QyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBQSxjQUFjLENBQUMsTUFBTSxDQUFDLGdCQUFnQixtQ0FBSSxFQUFFLENBQUM7SUFDekUsQ0FBQztJQUdPLElBQUk7UUFDUixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxnQkFBb0M7UUFDOUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixhQUFoQixnQkFBZ0IsY0FBaEIsZ0JBQWdCLEdBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ2xFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRU8sZUFBZTtRQUNuQixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN4RixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsS0FBSyxhQUFhLElBQUkscUJBQXFCLENBQUM7UUFDN0YsSUFBSSxXQUFXLEVBQUU7WUFDYixrR0FBa0c7WUFDbEcsSUFB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