import {
    Column,
    DragAndDropService,
    DraggingEvent,
    Events,
    ITooltipParams,
    PostConstruct,
    WithoutGridCommon,
    _createIconNoSpan
} from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";

export class RowGroupDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean) {
        super(horizontal, 'rowGroup');
    }

    @PostConstruct
    private passBeansUp(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');

        super.init({
            icon: _createIconNoSpan('rowGroupPanel', this.gos, null)!,
            emptyMessage: emptyMessage,
            title
        });

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }

    protected getAriaLabel(): string {
        const translate = this.localeService.getLocaleTextFunc();
        const label = translate('ariaRowGroupDropZonePanelLabel', 'Row Groups');

        return label;
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'rowGroupColumnsList';

        return res;
    }

    protected isItemDroppable(column: Column, draggingEvent: DraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.gos.get('functionsReadOnly') || !column.isPrimary()) { return false; }

        return column.isAllowRowGroup() && (!column.isRowGroupActive() || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: Column[]) {
        this.funcColsService.setRowGroupColumns(columns, "toolPanelUi");
    }

    protected getIconName(): string {
        return this.isPotentialDndItems() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingItems(): Column[] {
        return this.funcColsService.getRowGroupColumns();
    }
}
