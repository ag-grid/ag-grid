import type { AdvancedFilterModel } from './advancedFilterModel';
import type { IAdvancedFilterCtrl } from './iAdvancedFilterCtrl';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAdvancedFilterService {
    isEnabled(): boolean;

    isFilterPresent(): boolean;

    doesFilterPass(node: IRowNode): boolean;

    getModel(): AdvancedFilterModel | null;

    setModel(model: AdvancedFilterModel | null): void;

    isHeaderActive(): boolean;

    getCtrl(): IAdvancedFilterCtrl;

    updateValidity(): boolean;
}
