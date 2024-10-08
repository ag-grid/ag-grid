import type { FilterModel } from 'ag-grid-community';

import { _mapValues } from '../utils/object';
import type { ChartCrossFilterService } from './../services/chartCrossFilterService';
import { ChartSelectionModel } from './chartSelectionModel';

export class CrossFilteringContext {
    private chartSelectionModels: Record<string, ChartSelectionModel> = {};
    public lastSelectedChartId: string = '';

    constructor(private crossFilterService: ChartCrossFilterService) {}

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
        Object.values(this.chartSelectionModels).forEach((chartSelectionModel) =>
            chartSelectionModel.clearSelection(false)
        );

        if (notify) {
            this.updateFromSelectionModels();
        }
    }

    public updateFromSelectionModels(): void {
        const updates = Object.values(this.chartSelectionModels)
            .flatMap((chartSelectionModel) => chartSelectionModel.selection)
            .reduce(
                (acc, { category, value }) => {
                    acc[category] ??= [];
                    acc[category].push(value);
                    return acc;
                },
                {} as Record<string, string[]>
            );

        if (Object.getOwnPropertyNames(updates).length === 0) {
            this.crossFilterService.resetFilters(updates, true);
        } else {
            this.crossFilterService.setFilters(updates);
        }
    }

    public setFilters(crossFilterUpdate: Record<string, string[]>): void {
        const index: Record<string, ChartSelectionModel> = _mapValues(crossFilterUpdate, (key) =>
            Object.values(this.chartSelectionModels).find((chartSelectionModel) => chartSelectionModel.category === key)
        );

        const updated = Object.entries(index)
            .filter(([, a]) => !!a)
            .map(([key, value]) => {
                const selection = crossFilterUpdate[key].map((v: any) => ({ category: key, value: v }));
                return value.setSelection(selection, false);
            })
            .filter((a) => a);

        if (updated.length > 0) {
            this.updateFromSelectionModels();
        }
    }

    public updateFromGrid() {
        const crossFilterUpdate = _mapValues(
            this.crossFilterService.filterManager?.getFilterModel(),
            (colId: string, value: FilterModel) => {
                const columnFilterType = this.crossFilterService.getColumnFilterType(colId);

                if (columnFilterType === 'agMultiColumnFilter') {
                    return value.filterModels?.[1].values ?? [];
                } else if (columnFilterType === 'agSetColumnFilter') {
                    return value?.values ?? [];
                }

                return [];
            }
        );

        this.setFilters(crossFilterUpdate);
    }
}
