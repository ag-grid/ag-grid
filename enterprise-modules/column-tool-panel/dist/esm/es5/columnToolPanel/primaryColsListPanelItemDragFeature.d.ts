import { BeanStub, VirtualList } from "@ag-grid-community/core";
import { PrimaryColsListPanel } from "./primaryColsListPanel";
export declare class PrimaryColsListPanelItemDragFeature extends BeanStub {
    private readonly comp;
    private readonly virtualList;
    private columnModel;
    private dragAndDropService;
    private currentDragColumn;
    private lastHoveredColumnItem;
    private autoScrollService;
    private moveBlocked;
    constructor(comp: PrimaryColsListPanel, virtualList: VirtualList);
    private postConstruct;
    private columnPanelItemDragStart;
    private columnPanelItemDragEnd;
    private createDropTarget;
    private createAutoScrollService;
    private onDragging;
    private getDragColumnItem;
    private onDragStop;
    private getMoveDiff;
    private getCurrentColumns;
    private getTargetIndex;
    private onDragLeave;
    private clearHoveredItems;
}
