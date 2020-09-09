import { Component } from '../widgets/component';
import { DropTarget } from '../dragAndDrop/dragAndDropService';
import { AbstractHeaderWrapper } from './header/abstractHeaderWrapper';
export declare enum HeaderRowType {
    COLUMN_GROUP = 0,
    COLUMN = 1,
    FLOATING_FILTER = 2
}
export declare class HeaderRowComp extends Component {
    private gridOptionsWrapper;
    private columnController;
    private focusController;
    private readonly pinned;
    private readonly dropTarget;
    private readonly type;
    private dept;
    private headerComps;
    constructor(dept: number, type: HeaderRowType, pinned: string, dropTarget: DropTarget);
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
    private getItemsAtDepth;
    private onVirtualColumnsChanged;
    private createHeaderComp;
    getHeaderComps(): {
        [key: string]: AbstractHeaderWrapper;
    };
}
