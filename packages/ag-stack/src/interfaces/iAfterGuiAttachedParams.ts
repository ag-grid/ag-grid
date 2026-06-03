/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AfterGuiAttachedParams<TContainerType extends string> {
    /** Where this component is attached to. */
    container?: TContainerType;
    /**
     * Call this to hide the popup.
     * i.e useful if your component has an action button and you want to hide the popup after it is pressed.
     */
    hidePopup?: () => void;
    /** Set to `true` to not have the component focus its default item. */
    suppressFocus?: boolean;
}
