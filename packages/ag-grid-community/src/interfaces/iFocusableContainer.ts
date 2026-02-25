export type FocusableContainerName =
    | 'dialog'
    | 'gridBody'
    | 'pagination'
    | 'pivotToolbar'
    | 'rowGroupToolbar'
    | 'sideBar'
    | 'statusBar';

export interface FocusableContainer {
    getGui(): HTMLElement;
    getFocusableContainerName(): FocusableContainerName;
    setAllowFocus?(allowFocus: boolean): void;
}
