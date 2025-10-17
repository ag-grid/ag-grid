import type {
    AgEvent,
    _AgComponent,
    _AgCoreBeanCollection,
    _AgDraggingEvent,
    _AgDropTarget,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';
import { AutoScrollService, _AgBeanStub, _radioCssClass } from 'ag-grid-community';

import type { AgVirtualList } from './agVirtualList';
import { agVirtualListDragFeatureCSS } from './agVirtualListDragFeature.css-GENERATED';
import type { AgVirtualListDragParams, VirtualListDragItem } from './iVirtualListDragFeature';

const LIST_ITEM_HOVERED = 'ag-list-item-hovered';

export class AgVirtualListDragFeature<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TDragSourceType extends number,
    TParentComponent extends _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>,
    TChildComponent extends _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>,
    TDragValue,
    TDragStartEvent extends AgEvent,
    TDragEndEvent extends AgEvent,
> extends _AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private currentDragValue: TDragValue | null = null;
    private lastHoveredListItem: VirtualListDragItem<TChildComponent> | null = null;
    private autoScrollService: AutoScrollService;
    private moveBlocked: boolean;

    constructor(
        private readonly comp: TParentComponent,
        private readonly virtualList: AgVirtualList<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            any
        >,
        private readonly params: AgVirtualListDragParams<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TDragSourceType,
            TParentComponent,
            TChildComponent,
            TDragValue,
            TDragStartEvent,
            TDragEndEvent
        >
    ) {
        super();
    }

    public postConstruct(): void {
        this.beans.environment.addGlobalCSS(agVirtualListDragFeatureCSS, 'component-AgVirtualListDragFeature');

        this.params.addListeners(this, this.listItemDragStart.bind(this), this.listItemDragEnd.bind(this));

        this.createDropTarget();
        this.createAutoScrollService();
    }

    private listItemDragStart(event: TDragStartEvent): void {
        this.currentDragValue = this.params.getCurrentDragValue(event);
        this.moveBlocked = this.params.isMoveBlocked(this.currentDragValue);
    }

    private listItemDragEnd(): void {
        window.setTimeout(() => {
            this.currentDragValue = null;
            this.moveBlocked = false;
        }, 10);
    }

    private createDropTarget(): void {
        const dropTarget: _AgDropTarget<TDragSourceType, any, any, _AgDraggingEvent<TDragSourceType, any, any, any>> = {
            isInterestedIn: (type: TDragSourceType) => type === this.params.dragSourceType,
            getIconName: () => (this.moveBlocked ? 'pinned' : 'move'),
            getContainer: () => this.comp.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: () => this.onDragStop(),
            onDragLeave: () => this.onDragLeave(),
            onDragCancel: () => this.onDragCancel(),
        };

        this.beans.dragAndDrop?.addDropTarget(dropTarget);
    }

    private createAutoScrollService(): void {
        const virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: () => virtualListGui.scrollTop,
            setVerticalPosition: (position) => (virtualListGui.scrollTop = position),
        });
    }

    private onDragging(e: _AgDraggingEvent<TDragSourceType, any, any, any>) {
        if (!this.currentDragValue || this.moveBlocked) {
            return;
        }

        const hoveredListItem = this.getListDragItem(e);
        const comp = this.virtualList.getComponentAt(hoveredListItem.rowIndex);

        if (!comp) {
            return;
        }

        const el = comp!.getGui().parentElement as HTMLElement;

        if (
            this.lastHoveredListItem &&
            this.lastHoveredListItem.rowIndex === hoveredListItem.rowIndex &&
            this.lastHoveredListItem.position === hoveredListItem.position
        ) {
            return;
        }

        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredListItem = hoveredListItem;

        _radioCssClass(el, LIST_ITEM_HOVERED);
        _radioCssClass(el, `ag-item-highlight-${hoveredListItem.position}`);
    }

    private getListDragItem(e: _AgDraggingEvent<TDragSourceType, any, any, any>): VirtualListDragItem<TChildComponent> {
        const virtualListGui = this.virtualList.getGui();
        const paddingTop = Number.parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        const rowHeight = this.virtualList.getRowHeight();
        const scrollTop = this.virtualList.getScrollTop();
        const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        const maxLen = this.params.getNumRows(this.comp) - 1;
        const normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;

        return {
            rowIndex: normalizedRowIndex,
            position: Math.round(rowIndex) > rowIndex || rowIndex > maxLen ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex) as TChildComponent,
        };
    }

    private onDragStop() {
        if (this.moveBlocked) {
            return;
        }

        this.params.moveItem(this.currentDragValue, this.lastHoveredListItem);
        this.clearDragProperties();
    }

    private onDragCancel() {
        this.clearDragProperties();
    }

    private onDragLeave() {
        this.clearDragProperties();
    }

    private clearDragProperties(): void {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }

    private clearHoveredItems(): void {
        const virtualListGui = this.virtualList.getGui();
        for (const el of virtualListGui.querySelectorAll(`.${LIST_ITEM_HOVERED}`)) {
            for (const cls of [LIST_ITEM_HOVERED, 'ag-item-highlight-top', 'ag-item-highlight-bottom']) {
                (el as HTMLElement).classList.remove(cls);
            }
        }
        this.lastHoveredListItem = null;
    }
}
