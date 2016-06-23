import {
    Context,
    SvgFactory,
    Autowired,
    Component,
    ColumnController,
    DragAndDropService,
    GridOptionsWrapper,
    GridPanel,
    Column,
    Events,
    QuerySelector,
    PostConstruct,
    EventService,
    Utils,
    AgCheckbox,
    DragSource
} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

export class RenderedColumn extends Component {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '  <span class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-select-icon"></span>' +
        '  <ag-checkbox class="ag-column-select-checkbox"></ag-checkbox>' +
        '  <span class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;

    @QuerySelector('.ag-column-select-label') private eText: HTMLElement;
    @QuerySelector('.ag-column-select-indent') private eIndent: HTMLElement;
    @QuerySelector('.ag-column-select-checkbox') private cbSelect: AgCheckbox;
    @QuerySelector('.ag-column-select-icon') private eIcon: HTMLElement;

    private column: Column;
    private columnDept: number;

    private allowDragging: boolean;
    private displayName: string;

    private processingColumnStateChange = false;

    constructor(column: Column, columnDept: number, allowDragging: boolean) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {

        this.displayName = this.columnController.getDisplayNameForCol(this.column);
        this.eText.innerHTML = this.displayName;

        this.eIndent.style.width = (this.columnDept * 10) + 'px';

        // this.loadIcon();

        if (this.allowDragging) {
            this.addDragSource();
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));

        this.instantiate(this.context);

        this.onColumnStateChanged();

        this.addDestroyableEventListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onChange.bind(this));
        this.addDestroyableEventListener(this.eText, 'click', this.onClick.bind(this));
    }

    private loadIcon(): void {
        // if (this.column.isAllowRowGroup()) {
        //     this.eIcon.appendChild(Utils.createIconNoSpan('columnRowGroup', this.gridOptionsWrapper, null, svgFactory.createGroupIcon));
        // } else if (this.column.isAllowPivot()) {
        //     this.eIcon.appendChild(Utils.createIconNoSpan('columnPivot', this.gridOptionsWrapper, null, svgFactory.createPivotIcon));
        // } else if (this.column.isAllowValue()) {
        //     this.eIcon.appendChild(Utils.createIconNoSpan('columnValue', this.gridOptionsWrapper, null, svgFactory.createAggregationIcon));
        // } else {
        //     this.eIcon.appendChild(Utils.createIconNoSpan('columns', this.gridOptionsWrapper, null, svgFactory.createColumnIcon));
        // }

        // if (this.column.isAllowRowGroup()) {
        //     this.eIcon.innerHTML = 'G';
        // } else if (this.column.isAllowPivot()) {
        //     this.eIcon.innerHTML = 'P';
        // } else if (this.column.isAllowValue()) {
        //     this.eIcon.innerHTML = 'V';
        // } else {
        //     this.eIcon.innerHTML = '-';
        // }
    }

    private onClick(): void {
        this.cbSelect.toggle();
    }

    private onChange(): void {
        // only want to action if the user clicked the checkbox, not is we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) { return; }

        // action in a timeout, as the action takes some time, we want to update the icons first
        // so the user gets nice feedback when they click. otherwise there would be a lag and the
        // user would think the checkboxes were clunky
        if (this.cbSelect.isSelected()) {
            // setTimeout(this.actionChecked.bind(this), 0);
            this.actionChecked();
        } else {
            // setTimeout(this.actionUnChecked.bind(this), 0);
            this.actionUnChecked();
        }
    }

    private actionUnChecked(): void {
        // what we do depends on the reduce state
        if (this.columnController.isPivotMode()) {
            // remove pivot if column is pivoted
            if (this.column.isPivotActive()) {
                this.columnController.removePivotColumn(this.column);
            }
            // remove value if column is value
            if (this.column.isValueActive()) {
                this.columnController.removeValueColumn(this.column);
            }
            // remove group if column is grouped
            if (this.column.isRowGroupActive()) {
                this.columnController.removeRowGroupColumn(this.column);
            }
        } else {
            // if not reducing, then it's just column visibility
            this.columnController.setColumnVisible(this.column, false);
        }
    }

    private actionChecked(): void {
        // what we do depends on the reduce state
        if (this.columnController.isPivotMode()) {
            if (this.column.isAllowValue()) {
                if (!this.column.isValueActive()) {
                    this.columnController.addValueColumn(this.column);
                }
            } else {
                if (!this.column.isPivotActive() && !this.column.isRowGroupActive()) {
                    this.columnController.addRowGroupColumn(this.column);
                }
            }
        } else {
            this.columnController.setColumnVisible(this.column, true);
        }
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: [this.column]
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private onColumnStateChanged(): void {
        this.processingColumnStateChange = true;
        if (this.columnController.isPivotMode()) {
            // if reducing, checkbox means column is one of pivot, value or group
            var isPivot = this.column.isPivotActive();
            var isRowGroup = this.column.isRowGroupActive();
            var isAggregation = this.column.isValueActive();
            this.cbSelect.setSelected(isPivot || isRowGroup || isAggregation);
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setSelected(this.column.isVisible());
        }
        this.processingColumnStateChange = false;
    }

}