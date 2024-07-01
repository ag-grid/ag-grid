import type { Component } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class AdvancedFilterBuilderItemNavigationFeature extends BeanStub {
    private readonly eGui;
    private readonly focusWrapper;
    private readonly eFocusableComp;
    constructor(eGui: HTMLElement, focusWrapper: HTMLElement, eFocusableComp: Component<any>);
    postConstruct(): void;
}
