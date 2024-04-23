import { Component } from "ag-grid-community";
import { AdvancedFilterBuilderItem } from "./iAdvancedFilterBuilder";
export declare class AdvancedFilterBuilderItemAddComp extends Component {
    private readonly item;
    private readonly focusWrapper;
    private readonly beans;
    private readonly advancedFilterExpressionService;
    private readonly eItem;
    constructor(item: AdvancedFilterBuilderItem, focusWrapper: HTMLElement);
    private postConstruct;
    afterAdd(): void;
}
