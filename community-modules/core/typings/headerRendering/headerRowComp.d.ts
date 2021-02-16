import { Component } from '../widgets/component';
import { AbstractHeaderWrapper } from './header/abstractHeaderWrapper';
export declare enum HeaderRowType {
    COLUMN_GROUP = 0,
    COLUMN = 1,
    FLOATING_FILTER = 2
}
export declare class HeaderRowComp extends Component {
    private columnController;
    private focusController;
    private readonly pinned;
    private readonly type;
    private dept;
    private headerComps;
    constructor(dept: number, type: HeaderRowType, pinned: string | null);
    forEachHeaderElement(callback: (comp: Component) => void): void;
    private setRowIndex;
    getRowIndex(): number;
    getType(): HeaderRowType;
    private destroyAllChildComponents;
    private destroyChildComponents;
    private onRowHeightChanged;
    private init;
    private onColumnResized;
    private setWidth;
    private getWidthForRow;
    private onDisplayedColumnsChanged;
    private getColumnsInViewport;
    private getColumnsInViewportPrintLayout;
    private getActualDepth;
    private getColumnsInViewportNormalLayout;
    private onVirtualColumnsChanged;
    private createHeaderComp;
    getHeaderComps(): {
        [key: string]: AbstractHeaderWrapper;
    };
}
