import {
    Utils,
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
    ColumnValueChangeRequestEvent,
    ColumnApi,
    GridApi
} from "ag-grid/main";
import {AbstractColumnDropPanel} from "./abstractColumnDropPanel";

export class ValuesColumnPanel extends AbstractColumnDropPanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    constructor(horizontal: boolean) {
        super(horizontal, true, 'values');
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        let title = localeTextFunc('values', 'Values');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_AGGREGATE,
            icon: Utils.createIconNoSpan('valuePanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_AGGREGATE : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected isColumnDroppable(column: Column): boolean {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) { return false; }

        // we never allow grouping of secondary columns
        if (!column.isPrimary()) { return false; }

        let columnValue = column.isAllowValue();
        let columnNotValue= !column.isValueActive();
        return columnValue && columnNotValue;
    }

    protected updateColumns(columns: Column[]): void {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            let event: ColumnValueChangeRequestEvent = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        } else {
            this.columnController.setValueColumns(columns, "toolPanelUi");
        }
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getValueColumns();
    }

}
