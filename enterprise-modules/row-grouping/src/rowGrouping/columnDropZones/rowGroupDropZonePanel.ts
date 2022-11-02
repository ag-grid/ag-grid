import {
    _,
    Autowired,
    Column,
    ColumnModel,
    ColumnRowGroupChangeRequestEvent,
    DragAndDropService,
    Events,
    ITooltipParams,
    LoggerFactory,
    PostConstruct,
    WithoutGridCommon,
    getLocaleTextFunc
} from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";

export class RowGroupDropZonePanel extends BaseDropZonePanel {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    constructor(horizontal: boolean) {
        super(horizontal, 'rowGroup');
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        const localeTextFunc = getLocaleTextFunc(this.gridOptionsService);
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('rowGroupPanel', this.gridOptionsService, null)!,
            emptyMessage: emptyMessage,
            title
        });

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }

    protected getAriaLabel(): string {
        const translate = getLocaleTextFunc(this.gridOptionsService);
        const label = translate('ariaRowGroupDropZonePanelLabel', 'Row Groups');

        return label;
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'rowGroupColumnsList';

        return res;
    }

    protected isColumnDroppable(column: Column): boolean {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) { return false; }

        return column.isAllowRowGroup() && !column.isRowGroupActive();
    }

    protected updateColumns(columns: Column[]) {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event: WithoutGridCommon<ColumnRowGroupChangeRequestEvent> = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns
            };

            this.eventService.dispatchEvent(event);
        } else {
            this.columnModel.setRowGroupColumns(columns, "toolPanelUi");
        }
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingColumns(): Column[] {
        return this.columnModel.getRowGroupColumns();
    }
}
