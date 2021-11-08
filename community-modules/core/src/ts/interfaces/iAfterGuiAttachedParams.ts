export type ContainerType = 'columnMenu' | 'contextMenu' | 'toolPanel' | 'floatingFilter';

export interface IAfterGuiAttachedParams {
    container?: ContainerType;
    /** Callback to hide the parent popup - e.g. close after 'Apply' button pressed.  */
    hidePopup?: () => void;
    /** Callback to reposition the parent popup - e.g. after filter UI dimensions change.  */
    repositionPopup?: () => void;
    suppressFocus?: boolean;
}
