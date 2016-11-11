import {
    SvgFactory,
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    PostConstruct,
    Utils,
    Events,
    Column
} from "ag-grid/main";
import {AbstractColumnDropPanel} from "./abstractColumnDropPanel";

var svgFactory = SvgFactory.getInstance();

export class RowGroupColumnsPanel extends AbstractColumnDropPanel {

    @Autowired('columnController') private columnController:ColumnController;
    @Autowired('eventService') private eventService:EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper:GridOptionsWrapper;
    @Autowired('context') private context:Context;
    @Autowired('loggerFactory') private loggerFactory:LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService:DragAndDropService;

    constructor(horizontal:boolean) {
        super(horizontal, false, 'row-group');
    }

    @PostConstruct
    private passBeansUp():void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        var title = localeTextFunc('groups', 'Row Groups');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: Utils.createIconNoSpan('rowGroupPanel', this.gridOptionsWrapper, null, svgFactory.createGroupIcon),
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }

    protected isColumnDroppable(column: Column): boolean {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) { return false; }

        // we never allow grouping of secondary columns
        if (!column.isPrimary()) { return false; }

        var columnGroupable = column.isAllowRowGroup();
        var columnNotAlreadyGrouped = !column.isRowGroupActive();
        return columnGroupable && columnNotAlreadyGrouped;
    }

    protected updateColumns(columns:Column[]) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST, {columns: columns});
        } else {
            this.columnController.setRowGroupColumns(columns);
        }
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getRowGroupColumns();
    }

}