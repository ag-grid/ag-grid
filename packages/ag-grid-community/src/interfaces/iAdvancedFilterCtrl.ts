import type { IPinnedSectionCompHost } from './iPinnedSectionCompHost';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAdvancedFilterCtrl {
    mountTopSectionComp(host: IPinnedSectionCompHost): void;
    focusHeaderComp(): boolean;
    getHeaderHeight(): number;
    toggleFilterBuilder(params: { source: 'api' | 'ui'; force?: boolean; eventSource?: HTMLElement }): void;
}
