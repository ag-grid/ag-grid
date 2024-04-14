import {
    AgCheckbox,
    AgGroupComponent,
    AgRadioButton,
    AgSelect,
    AgSelectParams,
    AutoScrollService,
    Autowired,
    Column,
    Component,
    DragAndDropService,
    DraggingEvent,
    DragSource,
    DragSourceType,
    Events,
    ListOption,
    _
} from "@ag-grid-community/core";
import { AgPillSelect, AgPillSelectChangeParams } from "../../../../widgets/agPillSelect";
import { ChartController } from "../../chartController";
import { ChartDataModel, ColState } from "../../model/chartDataModel";
import { ChartTranslationKey, ChartTranslationService } from "../../services/chartTranslationService";

export abstract class DragDataPanel extends Component {
    @Autowired('dragAndDropService') protected dragAndDropService: DragAndDropService;
    @Autowired('chartTranslationService') protected readonly chartTranslationService: ChartTranslationService;

    private lastHoveredItem?: { comp: AgCheckbox, position: 'top' | 'bottom' };
    private lastDraggedColumn?: Column;
    protected columnComps: Map<string, AgRadioButton | AgCheckbox> = new Map<string, AgRadioButton | AgCheckbox>();
    protected groupComp: AgGroupComponent;
    protected valuePillSelect?: AgPillSelect<ColState>;
    protected valueSelect?: AgSelect<ColState>;

    constructor(
        protected readonly chartController: ChartController,
        private readonly autoScrollService: AutoScrollService,
        protected readonly allowMultipleSelection: boolean,
        private readonly maxSelection: number | undefined,
        template?: string
    ) {
        super(template);
    }

    public refreshColumnComps(cols: ColState[]): boolean {
        if (!_.areEqual(_.keys(this.columnComps), cols.map(({ colId }) => colId))) {
            return false;
        }

        cols.forEach(col => {
            this.columnComps.get(col.colId)!.setValue(col.selected, true);
        });

        return true;
    }

    protected createGroup(
        columns: ColState[],
        valueFormatter: (colState: ColState) => string,
        selectLabelKey: ChartTranslationKey,
        dragSourceId: string,
        skipAnimation?: () => boolean
    ): void {
        if (this.allowMultipleSelection) {
            const selectedValueList = columns.filter(col => col.selected);
            this.valuePillSelect = this.groupComp.createManagedBean(new AgPillSelect<ColState>({
                valueList: columns,
                selectedValueList,
                valueFormatter,
                selectPlaceholder: this.chartTranslationService.translate(selectLabelKey),
                dragSourceId,
                onValuesChange: params => this.onValueChange(params),
                maxSelection: this.maxSelection,
            }));
            this.groupComp.addItem(this.valuePillSelect);
        } else {
            const params: AgSelectParams<ColState> = this.createValueSelectParams(columns);
            params.onValueChange = (updatedColState: ColState) => {
                columns.forEach(col => {
                    col.selected = false;
                });
                updatedColState.selected = true;
                // Clear the category aggregation function if the default ordinal category is selected
                if (updatedColState.colId === ChartDataModel.DEFAULT_CATEGORY) {
                    this.chartController.setAggFunc(undefined, true);
                }
                this.chartController.updateForPanelChange({ updatedColState, skipAnimation: skipAnimation?.() });
            };
            this.valueSelect = this.groupComp.createManagedBean(new AgSelect<ColState>(params));
            this.groupComp.addItem(this.valueSelect);
        }
    }

    protected refreshValueSelect(columns: ColState[]): void {
        if (!this.valueSelect) { return; }
        const { options, value } = this.createValueSelectParams(columns);
        this.valueSelect.clearOptions().addOptions(options).setValue(value, true);
    }

    private createValueSelectParams(columns: ColState[]): {
        options: ListOption<ColState>[],
        value: ColState
    } {
        let selectedValue: ColState;
        const options = columns.map(value => {
            const text = value.displayName ?? '';
            if (value.selected) {
                selectedValue = value;
            }
            return {
                value,
                text
            }
        });
        return {
            options,
            value: selectedValue!,
        };
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
                this.chartController.updateForPanelChange({ updatedColState: draggedColumnState });
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
        const eDragHandle = _.createIconNoSpan('columnDrag', this.gos)!;

        eDragHandle.classList.add('ag-drag-handle', 'ag-chart-data-column-drag-handle');

        comp.getGui().insertAdjacentElement('beforeend', eDragHandle);

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

    protected addChangeListener(component: AgRadioButton | AgCheckbox, updatedColState: ColState) {
        this.addManagedListener(component, Events.EVENT_FIELD_VALUE_CHANGED, () => {
            updatedColState.selected = component.getValue();
            this.chartController.updateForPanelChange({ updatedColState });
        });
    }

    protected isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.ChartPanel;
    }

    protected onValueChange({ added, updated, removed, selected }: AgPillSelectChangeParams<ColState>) {
        let updatedColState: ColState | undefined;
        let resetOrder: boolean | undefined
        const updateOrder = () => {
            selected.forEach((col, index) => {
                col.order = index;
            });
            resetOrder = true;
        }
        if (added.length) {
            updatedColState = added[0];
            updatedColState.selected = true;
            updateOrder();
        } else if (removed.length) {
            updatedColState = removed[0];
            updatedColState.selected = false;
        } else if (updated.length) {
            updateOrder();
            updatedColState = updated[0];
        }
        if (updatedColState) {
            this.chartController.updateForPanelChange({ updatedColState, resetOrder });
        }
    }

    protected destroy(): void {
        this.valuePillSelect = undefined;
        this.valueSelect = undefined;
        super.destroy();
    }
}
