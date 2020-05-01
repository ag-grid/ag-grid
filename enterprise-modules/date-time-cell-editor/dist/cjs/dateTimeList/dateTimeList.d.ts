import { Component } from '@ag-grid-community/core';
interface DateTimeListOptions {
    onValueSelect: (value: Date) => void;
    initialValue?: Date;
}
export declare class DateTimeList extends Component {
    private static TEMPLATE;
    private ePrevPageButton;
    private eTitle;
    private eNextPageButton;
    private eLabelsRow;
    private eEntriesTable;
    private currentPageNumber;
    private model;
    private columnLabels;
    private rowComps;
    private onValueSelect;
    private initialValue;
    private currentX;
    private currentY;
    constructor(options: DateTimeListOptions);
    init(): void;
    focus(): void;
    private showPage;
    private getRowComp;
    private getColumnLabel;
    private handleKeyDown;
    private handleFocusChange;
    private navigatePage;
    private navigateCurrentCell;
}
export {};
