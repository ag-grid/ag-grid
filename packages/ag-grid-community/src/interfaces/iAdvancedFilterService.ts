import type { GridOptions } from '../entities/gridOptions';
import type { FilterChangedEventSourceType } from '../events';
import type { AdvancedFilterModel } from './advancedFilterModel';
import type { IAdvancedFilterCtrl } from './iAdvancedFilterCtrl';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAdvancedFilterService {
    isEnabled(): boolean;

    /** Follows an options change, reading `enableAdvancedFilter`; raises `advancedFilterEnabledChanged` on a toggle. */
    applyOptions(changedProps: ReadonlySet<keyof GridOptions>): void;

    isFilterPresent(): boolean;

    doesFilterPass(node: IRowNode): boolean;

    getModel(): AdvancedFilterModel | null;

    /** The model the API reads: the applied one, or the last one held until cell data types are inferred. */
    getLatestModel(): AdvancedFilterModel | null;

    /** Sets `model`, replacing any model held for data types. */
    setModel(model: AdvancedFilterModel | null): void;

    /** Sets `model` and reports the change with `source`, or holds both until cell data types are inferred. */
    setModelOrDefer(model: AdvancedFilterModel | null, source: FilterChangedEventSourceType): void;

    isHeaderActive(): boolean;

    getCtrl(): IAdvancedFilterCtrl;

    updateValidity(): boolean;
}
