import type { AfterGuiAttachedParams } from 'ag-stack';

import type { AgPromise } from 'ag-grid-community';

export interface AgTabbedLayoutParams<TContainerType extends string> {
    items: AgTabbedItem<TContainerType>[];
    cssClass?: string;
    keepScrollPosition?: boolean;
    onItemClicked?: (event: { item: AgTabbedItem<TContainerType> }) => void;
    onActiveItemClicked?: () => void;
    suppressFocusBodyOnOpen?: boolean;
    suppressTrapFocus?: boolean;
    enableCloseButton?: boolean;
    closeButtonAriaLabel?: string;
    onCloseClicked?: () => void;
}

export interface AgTabbedItem<TContainerType extends string> {
    title: Element;
    titleLabel: string;
    bodyPromise: AgPromise<HTMLElement>;
    name: string;
    getScrollableContainer?: () => HTMLElement;
    afterAttachedCallback?: (params: AfterGuiAttachedParams<TContainerType>) => void;
    afterDetachedCallback?: () => void;
}
