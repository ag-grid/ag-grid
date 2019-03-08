import {
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    PostConstruct,
    Events,
    Column,
    ColumnRowGroupChangeRequestEvent,
    ColumnApi,
    GridApi,
    _
} from "ag-grid-community/main";
import { BaseDropZonePanel } from "../dropZone/baseDropZonePanel";

export class RowGroupDropZonePanel extends BaseDropZonePanel {

    @Autowired('columnController') private columnController:ColumnController;
    @Autowired('eventService') private eventService:EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper:GridOptionsWrapper;
    @Autowired('loggerFactory') private loggerFactory:LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService:DragAndDropService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    constructor(horizontal:boolean) {
        super(horizontal, false, 'row-group');
    }

    @PostConstruct
    private passBeansUp():void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('rowGroupPanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }

    protected isColumnDroppable(column: Column): boolean {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) { return false; }

        // we never allow grouping of secondary columns
        if (!column.isPrimary()) { return false; }

        const columnGroupable = column.isAllowRowGroup();
        const columnNotAlreadyGrouped = !column.isRowGroupActive();
        return columnGroupable && columnNotAlreadyGrouped;
    }

    protected updateColumns(columns:Column[]) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            const event: ColumnRowGroupChangeRequestEvent = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        } else {
            this.columnController.setRowGroupColumns(columns, "toolPanelUi");
        }
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getRowGroupColumns();
    }

}
