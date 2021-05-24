// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare type ContainerType = 'columnMenu' | 'contextMenu' | 'toolPanel';
export interface IAfterGuiAttachedParams {
    container: ContainerType;
    hidePopup?: () => void;
    suppressFocus?: boolean;
}
