// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../../../entities/column";
import { Component } from "../../../widgets/component";
export declare class SortIndicatorComp extends Component {
    private static TEMPLATE;
    private eSortOrder;
    private eSortAsc;
    private eSortDesc;
    private eSortMixed;
    private eSortNone;
    private readonly columnModel;
    private readonly sortController;
    private column;
    private suppressOrder;
    constructor(skipTemplate?: boolean);
    attachCustomElements(eSortOrder: HTMLElement, eSortAsc: HTMLElement, eSortDesc: HTMLElement, eSortMixed: HTMLElement, eSortNone: HTMLElement): void;
    setupSort(column: Column, suppressOrder?: boolean): void;
    private addInIcon;
    private onSortChanged;
    private updateIcons;
    private setupMultiSortIndicator;
    private updateMultiSortIndicator;
    private updateSortOrder;
}
