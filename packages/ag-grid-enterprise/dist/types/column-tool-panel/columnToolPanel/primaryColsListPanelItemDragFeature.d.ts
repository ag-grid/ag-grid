import { BeanStub, VirtualList } from "ag-grid-community";
import { PrimaryColsListPanel } from "./primaryColsListPanel";
export declare class PrimaryColsListPanelItemDragFeature extends BeanStub {
    private readonly comp;
    private readonly virtualList;
    private columnModel;
    constructor(comp: PrimaryColsListPanel, virtualList: VirtualList);
    private postConstruct;
    private getCurrentDragValue;
    private isMoveBlocked;
    private moveItem;
    private getMoveDiff;
    private getCurrentColumns;
    private getTargetIndex;
}
