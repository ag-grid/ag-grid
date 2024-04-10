import {
    _,
    Column,
    ColumnValueChangeRequestEvent,
    DragAndDropService,
    DraggingEvent,
    Events,
    ITooltipParams,
    PostConstruct,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";

export class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean) {
        super(horizontal, 'aggregation');
    }

    @PostConstruct
    private passBeansUp(): void {
        const localeTextFunc = this.beans.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        const title = localeTextFunc('values', 'Values');

        super.init({
            icon: _.createIconNoSpan('valuePanel', this.beans.gos, null)!,
            emptyMessage: emptyMessage,
            title: title
        });

        this.addManagedEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    }

    protected getAriaLabel(): string {
        const translate = this.beans.localeService.getLocaleTextFunc();
        const label = translate('ariaValuesDropZonePanelLabel', 'Values');

        return label;
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'valueColumnsList';
        return res;
    }

    protected getIconName(): string {
        return this.isPotentialDndItems() ? DragAndDropService.ICON_AGGREGATE : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected isItemDroppable(column: Column, draggingEvent: DraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.beans.gos.get('functionsReadOnly') || !column.isPrimary()) { return false; }

        return column.isAllowValue() && (!column.isValueActive() || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: Column[]): void {
        if (this.beans.gos.get('functionsPassive')) {
            const event: WithoutGridCommon<ColumnValueChangeRequestEvent> = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns
            };
            this.beans.eventService.dispatchEvent(event);
        } else {
            this.beans.columnModel.setValueColumns(columns, "toolPanelUi");
        }
    }

    protected getExistingItems(): Column[] {
        return this.beans.columnModel.getValueColumns();
    }
}
