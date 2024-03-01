import {
    AgCheckbox,
    AgRadioButton,
    AutoScrollService,
    Autowired,
    Column,
    Component,
    DragAndDropService,
    DraggingEvent,
    DragSource,
    DragSourceType,
    Events,
    _
} from "@ag-grid-community/core";
import { AgPillSelectChangeParams } from "../../../../widgets/agPillSelect";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";

export abstract class DragDataPanel extends Component {
    @Autowired('dragAndDropService') protected dragAndDropService: DragAndDropService;

    private lastHoveredItem?: { comp: AgCheckbox, position: 'top' | 'bottom' };
    private lastDraggedColumn?: Column;
    protected columnComps: Map<string, AgRadioButton | AgCheckbox> = new Map<string, AgRadioButton | AgCheckbox>();

    constructor(
        protected readonly chartController: ChartController,
        private readonly autoScrollService: AutoScrollService,
        template?: string
    ) {
        super(template);
    }

    public refreshColumnComps(cols: ColState[]): boolean {
        if (_.areEqual(_.keys(this.columnComps), cols.map(({ colId }) => colId))) {
            return false;
        }

        cols.forEach(col => {
            this.columnComps.get(col.colId)!.setValue(col.selected, true);
        });

        return true;
    }

    protected onDragging(draggingEvent: DraggingEvent): void {
        const itemHovered = this.checkHoveredItem(draggingEvent);

        if (!itemHovered) { return; }

        this.lastDraggedColumn = draggingEvent.dragItem.columns![0];

        const { comp, position } = itemHovered;
        const { comp: lastHoveredComp, position: lastHoveredPosition } = this.lastHoveredItem || {};

        if (comp === lastHoveredComp && position === lastHoveredPosition) { return; }

        this.autoScrollService.check(draggingEvent.event);
        this.clearHoveredItems();
        this.lastHoveredItem = { comp, position };

        const eGui = comp.getGui();

        eGui.classList.add('ag-list-item-hovered', `ag-item-highlight-${position}`);
    }

    protected checkHoveredItem(draggingEvent: DraggingEvent): { comp: AgCheckbox, position: 'top' | 'bottom' } | null {
        if (_.missing(draggingEvent.vDirection)) { return null; }

        const mouseEvent = draggingEvent.event;

        for (const comp of this.columnComps.values()) {
            const eGui = comp.getGui();

            if (!eGui.querySelector('.ag-chart-data-column-drag-handle')) { continue; }

            const rect = eGui.getBoundingClientRect();
            const isOverComp = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;

            if (isOverComp) {
                const height = eGui.clientHeight;
                const position = mouseEvent.clientY > rect.top + (height / 2) ? 'bottom': 'top';
                return { comp, position };
            }
        }

        return null;
    }

    protected onDragLeave(): void {
        this.clearHoveredItems();
    }

    protected onDragStop(): void {
        if (this.lastHoveredItem) {
            const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();
            const draggedColumnState = [...dimensionCols, ...valueCols]
                .find(state => state.column === this.lastDraggedColumn);
            if (draggedColumnState) {
                let targetIndex = Array.from(this.columnComps.values()).indexOf(this.lastHoveredItem.comp);
                if (this.lastHoveredItem.position === 'bottom') { targetIndex++; }

                draggedColumnState.order = targetIndex;
                this.chartController.updateForPanelChange(draggedColumnState);
            }
        }
        this.clearHoveredItems();
        this.lastDraggedColumn = undefined;
        this.autoScrollService.ensureCleared();
    }

    protected clearHoveredItems(): void {
        this.columnComps.forEach(columnComp => {
            columnComp.getGui().classList.remove(
                'ag-list-item-hovered',
                'ag-item-highlight-top', 
                'ag-item-highlight-bottom'
            );
        });
        this.lastHoveredItem = undefined;
    }

    protected addDragHandle(comp: AgCheckbox, col: ColState): void {
        const eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService)!;

        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');

        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);
0
        const dragSource: DragSource = {
            type: DragSourceType.ChartPanel,
            eElement: eDragHandle,
            dragItemName: col.displayName,
            getDragItem: () => ({ columns: [col.column!] }),
            onDragStopped: () => this.onDragStop()
        };

        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }

    protected addChangeListener(component: AgRadioButton | AgCheckbox, columnState: ColState) {
        this.addManagedListener(component, Events.EVENT_FIELD_VALUE_CHANGED, () => {
            columnState.selected = component.getValue();
            this.chartController.updateForPanelChange(columnState);
        });
    }

    protected isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.ChartPanel;
    }

    protected onValueChange({ added, updated, removed, selected }: AgPillSelectChangeParams<ColState>) {
        let colState: ColState | undefined;
        let resetOrder: boolean | undefined
        if (added.length) {
            colState = added[0];
            colState.selected = true;
        } else if (removed.length) {
            colState = removed[0];
            colState.selected = false;
        } else if (updated.length) {
            selected.forEach((col, index) => {
                col.order = index;
            });
            colState = updated[0];
            resetOrder = true;
        }
        if (colState) {
            this.chartController.updateForPanelChange(colState, resetOrder);
        }
    }
}
