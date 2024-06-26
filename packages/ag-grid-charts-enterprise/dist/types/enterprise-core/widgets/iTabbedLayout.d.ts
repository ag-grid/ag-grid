import type { AgPromise, IAfterGuiAttachedParams } from 'ag-grid-community';
export interface TabbedLayoutParams {
    items: TabbedItem[];
    cssClass?: string;
    keepScrollPosition?: boolean;
    onItemClicked?: (event: {
        item: TabbedItem;
    }) => void;
    onActiveItemClicked?: () => void;
    suppressFocusBodyOnOpen?: boolean;
    suppressTrapFocus?: boolean;
    enableCloseButton?: boolean;
    closeButtonAriaLabel?: string;
    onCloseClicked?: () => void;
}
export interface TabbedItem {
    title: Element;
    titleLabel: string;
    bodyPromise: AgPromise<HTMLElement>;
    name: string;
    getScrollableContainer?: () => HTMLElement;
    afterAttachedCallback?: (params: IAfterGuiAttachedParams) => void;
    afterDetachedCallback?: () => void;
}
