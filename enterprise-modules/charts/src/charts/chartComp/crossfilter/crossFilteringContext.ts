import type { ChartCrossFilterService } from './../services/chartCrossFilterService';
import { ChartSelectionModel } from './chartSelectionModel';

export class CrossFilteringContext {
    private chartSelectionModels: Record<string, ChartSelectionModel> = {};
    public lastSelectedChartId: string = '';
    private crossFilterService: ChartCrossFilterService;

    constructor(crossFilterService: ChartCrossFilterService) {
        this.crossFilterService = crossFilterService;
    }

    public getChartSelectionModel(chartId: string): ChartSelectionModel {
        return this.chartSelectionModels[chartId];
    }

    public createChartSelectionModel(chartId: string): ChartSelectionModel {
        return (this.chartSelectionModels[chartId] = new ChartSelectionModel(chartId, this));
    }

    public deleteChartSelectionModel(chartId: string): void {
        delete this.chartSelectionModels[chartId];
    }

    public clearAllSelections(notify = true): void {
        Object.values(this.chartSelectionModels).forEach((chartSelectionModel) => {
            chartSelectionModel.clearSelection(false);
        });

        if (notify) {
            this.updateFromSelection();
        }
    }

    public updateFromSelection(): void {
        const updates = Object.values(this.chartSelectionModels)
            .map((chartSelectionModel) => {
                return chartSelectionModel.getFlatSelection();
            })
            .reduce((acc, flatSelection) => {
                Object.entries(flatSelection).forEach(([category, values]) => {
                    acc[category] ??= [];
                    acc[category].push(...values);
                });
                return acc;
            });

        if (Object.getOwnPropertyNames(updates).length === 0) {
            this.crossFilterService.resetFilters(updates, true);
        } else {
            this.crossFilterService.setFilters(updates);
        }
    }
}
