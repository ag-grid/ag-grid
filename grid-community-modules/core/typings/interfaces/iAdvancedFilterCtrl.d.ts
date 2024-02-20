export interface IAdvancedFilterCtrl {
    setupHeaderComp(eCompToInsertBefore: HTMLElement): void;
    focusHeaderComp(): boolean;
    getHeaderHeight(): number;
    toggleFilterBuilder(source: 'api' | 'ui', force?: boolean): void;
}
