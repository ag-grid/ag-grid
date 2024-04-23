import { AgCheckbox, AgGroupComponent, AgRadioButton, AgSelect, AutoScrollService, Component, DragAndDropService, DraggingEvent, DragSourceType } from "ag-grid-community";
import { AgPillSelect, AgPillSelectChangeParams } from "../../../../widgets/agPillSelect";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartTranslationKey, ChartTranslationService } from "../../services/chartTranslationService";
export declare abstract class DragDataPanel extends Component {
    protected readonly chartController: ChartController;
    private readonly autoScrollService;
    protected readonly allowMultipleSelection: boolean;
    private readonly maxSelection;
    protected dragAndDropService: DragAndDropService;
    protected readonly chartTranslationService: ChartTranslationService;
    private lastHoveredItem?;
    private lastDraggedColumn?;
    protected columnComps: Map<string, AgRadioButton | AgCheckbox>;
    protected groupComp: AgGroupComponent;
    protected valuePillSelect?: AgPillSelect<ColState>;
    protected valueSelect?: AgSelect<ColState>;
    constructor(chartController: ChartController, autoScrollService: AutoScrollService, allowMultipleSelection: boolean, maxSelection: number | undefined, template?: string);
    refreshColumnComps(cols: ColState[]): boolean;
    protected createGroup(columns: ColState[], valueFormatter: (colState: ColState) => string, selectLabelKey: ChartTranslationKey, dragSourceId: string, skipAnimation?: () => boolean): void;
    protected refreshValueSelect(columns: ColState[]): void;
    private createValueSelectParams;
    protected onDragging(draggingEvent: DraggingEvent): void;
    protected checkHoveredItem(draggingEvent: DraggingEvent): {
        comp: AgCheckbox;
        position: 'top' | 'bottom';
    } | null;
    protected onDragLeave(): void;
    protected onDragStop(): void;
    protected clearHoveredItems(): void;
    protected addDragHandle(comp: AgCheckbox, col: ColState): void;
    protected addChangeListener(component: AgRadioButton | AgCheckbox, updatedColState: ColState): void;
    protected isInterestedIn(type: DragSourceType): boolean;
    protected onValueChange({ added, updated, removed, selected }: AgPillSelectChangeParams<ColState>): void;
    protected destroy(): void;
}
