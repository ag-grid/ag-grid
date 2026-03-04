import type { IPinnedSectionCompHost } from './iPinnedSectionCompHost';

export interface IAdvancedFilterCtrl {
    setupHeaderComp(headerCompHost: IPinnedSectionCompHost): void;
    focusHeaderComp(): boolean;
    getHeaderHeight(): number;
    toggleFilterBuilder(params: { source: 'api' | 'ui'; force?: boolean; eventSource?: HTMLElement }): void;
}
