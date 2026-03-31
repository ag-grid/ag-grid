export type FocusableContainerName =
    | 'dialog'
    | 'gridBody'
    | 'pagination'
    | 'pivotToolbar'
    | 'rowGroupToolbar'
    | 'sideBar'
    | 'statusBar'
    | 'toolbar';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface FocusableContainer {
    getGui(): HTMLElement;
    getFocusableContainerName(): FocusableContainerName;
    setAllowFocus?(allowFocus: boolean): void;
}
