import type { BeanCollection } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { VirtualList } from 'ag-grid-enterprise';
import type { AgPrimaryColsList } from './agPrimaryColsList';
export declare class PrimaryColsListPanelItemDragFeature extends BeanStub {
    private readonly comp;
    private readonly virtualList;
    private columnModel;
    private columnMoveService;
    wireBeans(beans: BeanCollection): void;
    constructor(comp: AgPrimaryColsList, virtualList: VirtualList);
    postConstruct(): void;
    private getCurrentDragValue;
    private isMoveBlocked;
    private moveItem;
    private getMoveDiff;
    private getCurrentColumns;
    private getTargetIndex;
}
