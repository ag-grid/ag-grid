import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { AdvancedFilterBuilderEvents, AdvancedFilterBuilderItem } from './iAdvancedFilterBuilder';
export declare class AdvancedFilterBuilderItemAddComp extends Component<AdvancedFilterBuilderEvents> {
    private readonly item;
    private readonly focusWrapper;
    private advancedFilterExpressionService;
    wireBeans(beans: BeanCollection): void;
    private readonly eItem;
    constructor(item: AdvancedFilterBuilderItem, focusWrapper: HTMLElement);
    postConstruct(): void;
    afterAdd(): void;
}
