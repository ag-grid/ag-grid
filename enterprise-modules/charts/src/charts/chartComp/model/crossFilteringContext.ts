import { ChartSelectionModel } from './chartSelectionModel';

export class CrossFilteringContext {
    private chartSelectionModels: Record<string, ChartSelectionModel> = {};
    public lastSelectedChartId: string = '';

    public getChartSelectionModel(chartId: string): ChartSelectionModel {
        return this.chartSelectionModels[chartId];
    }

    public createChartSelectionModel(chartId: string): ChartSelectionModel {
        return (this.chartSelectionModels[chartId] = new ChartSelectionModel(chartId));
    }

    public deleteChartSelectionModel(chartId: string): void {
        delete this.chartSelectionModels[chartId];
    }

    public clearAllSelections(): void {
        Object.values(this.chartSelectionModels).forEach((chartSelectionModel) => {
            chartSelectionModel.clearSelection();
        });
    }
}
