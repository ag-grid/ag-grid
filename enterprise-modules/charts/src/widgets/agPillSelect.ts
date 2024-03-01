import {
    AgSelect,
    Component,
    DragAndDropService,
    DraggingEvent,
    DragItem,
    DragSourceType,
    DropTarget,
    PillDragComp,
    PillDropZonePanel,
    PostConstruct,
    _
} from "@ag-grid-community/core";

export interface AgPillSelectParams<TValue = string | null> {
    valueList?: TValue[];
    selectedValueList?: TValue[];
    valueFormatter?: (value: TValue) => string;
    ariaLabel?: string;
    selectPlaceholder?: string;
    onValuesChange?: (params: AgPillSelectChangeParams<TValue>) => void;
    dragSourceId?: string;
}

export interface AgPillSelectChangeParams<TValue> {
    added: TValue[],
    removed: TValue[],
    updated: TValue[],
    selected: TValue[]
}

export class AgPillSelect<TValue = string | null> extends Component {
    private static TEMPLATE = /* html */`<div class="ag-pill-select" role="presentation"></div>`;

    private dropZonePanel: PillSelectDropZonePanel<TValue>;
    private eSelect: AgSelect<TValue>;

    private readonly config: AgPillSelectParams<TValue>;
    private selectedValues: TValue[];
    private valueFormatter: (value: TValue) => string;
    private onValuesChange?: (params: AgPillSelectChangeParams<TValue>) => void;

    constructor(config?: AgPillSelectParams<TValue>) {
        super(AgPillSelect.TEMPLATE);
        this.config = config ?? {};

        const { selectedValueList, valueFormatter } = this.config;
        this.selectedValues = selectedValueList ?? [];
        this.valueFormatter = valueFormatter ?? (value => _.escapeString(value as any)!);
    }

    @PostConstruct
    private init(): void {
        const { ariaLabel, onValuesChange, dragSourceId } = this.config;
        this.dropZonePanel = this.createManagedBean(new PillSelectDropZonePanel(
            {
                getValues: () => this.selectedValues,
                setValues: values => this.updateValues(values),
                isDraggable: () => this.selectedValues.length > 1
            },
            this.valueFormatter,
            ariaLabel!,
            dragSourceId
        ));
        const eGui = this.getGui();
        eGui.appendChild(this.dropZonePanel.getGui());
        this.initSelect();
        if (onValuesChange != null) {
            this.onValuesChange = onValuesChange;
        }
    }

    private initSelect(): void {
        const { valueList, selectPlaceholder: placeholder } = this.config;
        const filteredValueList = valueList?.filter(value => !this.selectedValues.includes(value));
        const disabled = !filteredValueList?.length;
        this.eSelect = this.createBean(new AgSelect({
            options: filteredValueList?.map(value => ({value, text: this.valueFormatter(value)})),
            placeholder,
            onValueChange: value => this.addValue(value),
            disabled,
            pickerIcon: 'chartsMenuAdd'
        }));
        this.getGui().appendChild(this.eSelect.getGui());
    }

    private addValue(value: TValue): void {
        this.dropZonePanel.addItem(value);
    }

    private updateValues(values: TValue[]): void {
        const previousSelectedValues = this.selectedValues;
        this.selectedValues = values;
        const changes = this.getChanges(previousSelectedValues, values);
        const refreshSelect = changes.added.length || changes.removed.length;
        const activeElement = this.gridOptionsService.getDocument().activeElement;
        let hasFocus = this.eSelect.getGui().contains(activeElement);
        if (refreshSelect) {
            this.refreshSelect();
        }
        this.dropZonePanel.refreshGui();
        if (refreshSelect && hasFocus) {
            this.eSelect.getFocusableElement().focus();
        }
        this.onValuesChange?.(changes);
    }

    private getChanges(previousSelectedValues: TValue[], newSelectedValues: TValue[]): AgPillSelectChangeParams<TValue> {
        const added = newSelectedValues.filter(value => !previousSelectedValues.includes(value));
        const removed = previousSelectedValues.filter(value => !newSelectedValues.includes(value));
        const updated = newSelectedValues.filter((value, index) => previousSelectedValues[index] !== value);
        return { added, removed, updated, selected: newSelectedValues };
    }

    private refreshSelect(): void {
        _.removeFromParent(this.eSelect.getGui());
        this.destroyBean(this.eSelect);
        this.initSelect();
    }

    protected destroy(): void {
        this.destroyBean(this.eSelect);
        super.destroy();
    }
}

class PillSelectDragComp<TValue> extends PillDragComp<TValue> {
    constructor(
        private readonly value: TValue,
        dragSourceDropTarget: DropTarget,
        ghost: boolean,
        private readonly valueFormatter: (value: TValue) => string,
        private readonly draggable: boolean,
        private readonly sourceId?: string
    ) {
        super(dragSourceDropTarget, ghost, false);
    }

    public getItem(): TValue {
        return this.value;
    }

    protected getDisplayName(): string {
        return this.valueFormatter(this.value);
    }

    protected getAriaDisplayName(): string {
        return this.getDisplayName();
    }

    protected getTooltip(): string | null | undefined {
        return undefined;
    }

    protected createGetDragItem(): () => DragItem<TValue> {
        return () => ({
            value: this.value
        });
    }

    protected getDragSourceType(): DragSourceType {
        return DragSourceType.ChartPanel;
    }

    protected getDragSourceId(): string | undefined {
        return this.sourceId;
    }

    protected isDraggable(): boolean {
        return this.draggable;
    }
}

class PillSelectDropZonePanel<TValue> extends PillDropZonePanel<PillSelectDragComp<TValue>, TValue> {
    constructor(
        private readonly model: {
            getValues: () => TValue[],
            setValues: (values: TValue[]) => void
            isDraggable: () => boolean
        },
        private readonly valueFormatter: (value: TValue) => string,
        private readonly ariaLabel: string,
        private readonly sourceId?: string
    ) {
        super(false);
    }

    @PostConstruct
    private postConstruct(): void {
        super.init();
    }

    protected isItemDroppable(item: TValue, draggingEvent: DraggingEvent): boolean {
        return this.isSourceEventFromTarget(draggingEvent) || (this.sourceId != null && this.sourceId === draggingEvent.dragSource.sourceId);
    }

    protected updateItems(items: TValue[]): void {
        this.model.setValues(items);
    }

    protected getExistingItems(): TValue[] {
        return this.model.getValues();
    }

    protected getIconName(): string {
        return this.isPotentialDndItems() ? DragAndDropService.ICON_MOVE : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getAriaLabel(): string {
        return this.ariaLabel;
    }

    protected createPillComponent(item: TValue, dropTarget: DropTarget, ghost: boolean): PillSelectDragComp<TValue> {
        return new PillSelectDragComp(item, dropTarget, ghost, this.valueFormatter, this.model.isDraggable(), this.sourceId);
    }

    protected getItems(dragItem: DragItem): TValue[] {
        return [dragItem.value];
    }

    protected isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.ChartPanel;
    }
}
