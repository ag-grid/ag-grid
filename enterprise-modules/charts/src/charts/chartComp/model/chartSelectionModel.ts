import type { CrossFilterCategoryEntry } from './selectionModelAPI';

export class ChartSelectionModel {
    public selection: CrossFilterCategoryEntry[] = [];
    public available: CrossFilterCategoryEntry[] = [];
    public chartId: string;

    public constructor(chartId: string) {
        this.chartId = chartId;
    }

    setAvailable(entries: CrossFilterCategoryEntry[]): void {
        this.available = entries;
    }

    getAvailable(): CrossFilterCategoryEntry[] {
        return this.available;
    }

    public areAllSelected(category: string): boolean {
        return this.available.every((entry) => this.isSelected(category, entry.value));
    }

    public hasSelection(): boolean {
        return this.selection.length > 0;
    }

    public isSelected(category: string, value: string): boolean {
        return this.selection.some((entry) => entry.category === category && entry.value === value);
    }

    public toggleSelection(multiSelection: boolean, category: string, value: string): void {
        const isSelected = this.isSelected(category, value);

        if (isSelected) {
            this.selection = this.selection.filter((entry) => entry.category !== category || entry.value !== value);
        } else {
            if (!multiSelection) {
                this.clearSelection();
            }
            this.selection.push({ category, value });
        }
    }

    setSelection(entries: CrossFilterCategoryEntry[]): void {
        this.selection = entries;
    }

    public clearSelection(): void {
        this.selection = [];
    }
}
