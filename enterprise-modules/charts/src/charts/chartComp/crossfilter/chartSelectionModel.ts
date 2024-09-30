import type { CrossFilteringContext } from './crossFilteringContext';
import type { CrossFilterCategoryEntry } from './selectionModelAPI';

export class ChartSelectionModel {
    public selection: CrossFilterCategoryEntry[] = [];
    public available: CrossFilterCategoryEntry[] = [];
    public chartId: string;
    private crossFilteringContext: CrossFilteringContext;

    public constructor(chartId: string, crossFilteringContext: CrossFilteringContext) {
        this.chartId = chartId;
        this.crossFilteringContext = crossFilteringContext;
    }

    setAvailable(entries: CrossFilterCategoryEntry[]): void {
        this.available = entries;
    }

    getAvailable(): CrossFilterCategoryEntry[] {
        return this.available;
    }

    getFlatSelection(): Record<string, string[]> {
        return this.selection.reduce<Record<string, string[]>>((acc, entry) => {
            acc[entry.category] ??= [];
            acc[entry.category].push((entry['value'] as any)?.value || entry.value);
            return acc;
        }, {});
    }

    public areAllSelected(category: string): boolean {
        return this.available.every((entry) => this.isSelected(category, entry.value));
    }

    public hasSelection(): boolean {
        return this.selection.length > 0;
    }

    public isSelected(category: string, value: string): boolean {
        const rawValue = (value as any)?.value || value;
        return this.selection.some((entry) => entry.category === category && entry.value === rawValue);
    }

    public toggleSelection(multiSelection: boolean, category: string, value: string, notify = true): void {
        const isSelected = this.isSelected(category, value);

        const rawValue = (value as any)?.value || value;
        if (isSelected) {
            this.selection = this.selection.filter((entry) => entry.category !== category || entry.value !== rawValue);
        } else {
            if (!multiSelection) {
                this.clearSelection(false);
            }
            this.selection.push({ category, value: rawValue });
        }

        if (notify) {
            this.crossFilteringContext.updateFromSelection();
        }
    }

    setSelection(entries: CrossFilterCategoryEntry[], notify = true): void {
        this.selection = entries;
        if (notify) {
            this.crossFilteringContext.updateFromSelection();
        }
    }

    public clearSelection(notify = true): void {
        this.setSelection([], notify);
    }
}
