import { BeanStub } from "../context/beanStub";
import { AgEvent } from "../events";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { Component } from "../widgets/component";
import { VirtualList } from "../widgets/virtualList";
import { DragSourceType } from "./dragAndDropService";
export interface VirtualListDragItem<R extends Component> {
    rowIndex: number;
    position: 'top' | 'bottom';
    component: R;
}
export interface VirtualListDragParams<C extends Component, R extends Component, V, E extends AgEvent> {
    eventSource: Window | HTMLElement | IEventEmitter;
    listItemDragStartEvent: string;
    listItemDragEndEvent: string;
    dragSourceType: DragSourceType;
    getCurrentDragValue: (listItemDragStartEvent: E) => V;
    isMoveBlocked: (currentDragValue: V | null) => boolean;
    getNumRows: (comp: C) => number;
    moveItem: (currentDragValue: V | null, lastHoveredListItem: VirtualListDragItem<R> | null) => void;
}
export declare class VirtualListDragFeature<C extends Component, R extends Component, V, E extends AgEvent> extends BeanStub {
    private readonly comp;
    private readonly virtualList;
    private readonly params;
    private dragAndDropService;
    private currentDragValue;
    private lastHoveredListItem;
    private autoScrollService;
    private moveBlocked;
    constructor(comp: C, virtualList: VirtualList, params: VirtualListDragParams<C, R, V, E>);
    private postConstruct;
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
