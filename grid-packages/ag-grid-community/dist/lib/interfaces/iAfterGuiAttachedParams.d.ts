export declare type ContainerType = 'columnMenu' | 'contextMenu' | 'toolPanel' | 'floatingFilter';
export interface IAfterGuiAttachedParams {
    container?: ContainerType;
    hidePopup?: () => void;
    suppressFocus?: boolean;
}
