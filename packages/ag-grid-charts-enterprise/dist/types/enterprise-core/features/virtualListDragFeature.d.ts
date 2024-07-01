import type { AgEvent, BeanCollection, Component } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { VirtualList } from '../widgets/virtualList';
import type { VirtualListDragParams } from './iVirtualListDragFeature';
export declare class VirtualListDragFeature<C extends Component<any>, R extends Component<any>, V, E extends AgEvent> extends BeanStub {
    private readonly comp;
    private readonly virtualList;
    private readonly params;
    private dragAndDropService;
    wireBeans(beans: BeanCollection): void;
    private currentDragValue;
    private lastHoveredListItem;
    private autoScrollService;
    private moveBlocked;
    constructor(comp: C, virtualList: VirtualList<any>, params: VirtualListDragParams<C, R, V, E>);
    postConstruct(): void;
    private listItemDragStart;
    private listItemDragEnd;
    private createDropTarget;
    private createAutoScrollService;
    private onDragging;
    private getListDragItem;
    private onDragStop;
    private onDragLeave;
    private clearHoveredItems;
}
