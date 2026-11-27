import type { GridApi, Module } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

/** The modules the parity grids run on: every filter the Advanced Filter is compared against. */
export const PARITY_MODULES: Module[] = [
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    BigIntFilterModule,
    SetFilterModule,
    MultiFilterModule,
    CustomFilterModule,
    AdvancedFilterModule,
    NewFiltersToolPanelModule,
    GridStateModule,
    ClientSideRowModelModule,
];

/** A filter component that filters nothing: only its `filterParams` matter here. */
export class MinimalFilter {
    public init(): void {}
    public getGui(): HTMLElement {
        return document.createElement('div');
    }
    public isFilterActive(): boolean {
        return false;
    }
    public doesFilterPass(): boolean {
        return true;
    }
    public getModel(): null {
        return null;
    }
    public setModel(): void {}
}

export function getDisplayedIds(api: GridApi<{ id: number }>): number[] {
    const result: number[] = [];
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        result.push(api.getDisplayedRowAtIndex(i)!.data!.id);
    }
    return result;
}
