import { AgEvent, BeanStub, DragSourceType, PostConstruct, VirtualList, VirtualListDragFeature, VirtualListDragItem } from "@ag-grid-community/core";
import { AdvancedFilterBuilderComp } from "./advancedFilterBuilderComp";
import { AdvancedFilterBuilderRowComp, AdvancedFilterBuilderRowParams } from "./advancedFilterBuilderRowComp";

export class AdvancedFilterBuilderDragFeature extends BeanStub {
    constructor(
        private readonly comp: AdvancedFilterBuilderComp,
        private readonly virtualList: VirtualList
    ) { super(); }

    @PostConstruct
    private postConstruct(): void {
        this.createManagedBean(new VirtualListDragFeature<
            AdvancedFilterBuilderComp,
            AdvancedFilterBuilderRowComp,
            AdvancedFilterBuilderRowParams,
            AgEvent
        >(
            this.comp,
            this.virtualList,
            {
                dragSourceType: DragSourceType.AdvancedFilterBuilder,
                listItemDragStartEvent: 'advancedFilterBuilderDragStart',
                listItemDragEndEvent: 'advancedFilterBuilderDragEnd',
                getCurrentDragValue: (listItemDragStartEvent: AgEvent) => this.getCurrentDragValue(listItemDragStartEvent),
                isMoveBlocked: () => false,
                getNumRows: (comp: AdvancedFilterBuilderComp) => comp.getNumRows(),
                moveItem: (
                    currentDragValue: AdvancedFilterBuilderRowParams | null,
                    lastHoveredListItem: VirtualListDragItem<AdvancedFilterBuilderRowComp> | null
                ) => this.moveItem(currentDragValue, lastHoveredListItem),
            }
        ));
    }

    private getCurrentDragValue(listItemDragStartEvent: AgEvent): AdvancedFilterBuilderRowParams {
        return (listItemDragStartEvent as any).row;
    }

    private moveItem(currentDragValue: AdvancedFilterBuilderRowParams | null, lastHoveredListItem: VirtualListDragItem<AdvancedFilterBuilderRowComp> | null): void {
        this.comp.moveRow(currentDragValue, lastHoveredListItem);
    }
}