import {
    Utils as _,
    SvgFactory,
    Autowired,
    Component,
    ColumnController,
    DragAndDropService,
    GridPanel,
    Column,
    PostConstruct,
    DragSource
} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

export class RenderedColumn extends Component {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eColumnVisibleIcon" class="ag-column-visible-icon"></span>' +
        '    <span id="eColumnHiddenIcon" class="ag-column-hidden-icon"></span>' +
        '  </span>' +
        '  <span id="eText" class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    private column: Column;
    private columnDept: number;

    private eColumnVisibleIcon: HTMLInputElement;
    private eColumnHiddenIcon: HTMLInputElement;
    private allowDragging: boolean;

    private displayName: string;

    constructor(column: Column, columnDept: number, allowDragging: boolean) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        this.displayName = this.columnController.getDisplayNameForCol(this.column);
        var eText = <HTMLElement> this.queryForHtmlElement('#eText');
        eText.innerHTML = this.displayName;
        eText.addEventListener('dblclick', this.onColumnVisibilityChanged.bind(this));

        this.setupVisibleIcons();

        var eIndent = <HTMLElement> this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        if (this.allowDragging) {
            this.addDragSource();
        }
    }

    private setupVisibleIcons(): void {
        this.eColumnHiddenIcon = <HTMLInputElement> this.queryForHtmlElement('#eColumnHiddenIcon');
        this.eColumnVisibleIcon = <HTMLInputElement> this.queryForHtmlElement('#eColumnVisibleIcon');

        this.eColumnHiddenIcon.appendChild(svgFactory.createColumnHiddenIcon());
        this.eColumnVisibleIcon.appendChild(svgFactory.createColumnVisibleIcon());

        this.eColumnHiddenIcon.addEventListener('click', this.onColumnVisibilityChanged.bind(this));
        this.eColumnVisibleIcon.addEventListener('click', this.onColumnVisibilityChanged.bind(this));

        var columnStateChangedListener = this.onColumnStateChangedListener.bind(this);
        this.column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        this.addDestroyFunc( ()=> this.column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener) );

        this.setIconVisibility();
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: [this.column]
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private onColumnStateChangedListener(): void {
        this.setIconVisibility();
    }

    private setIconVisibility(): void {
        var visible = this.column.isVisible();
        _.setVisible(this.eColumnVisibleIcon, visible);
        _.setVisible(this.eColumnHiddenIcon, !visible);
    }

    public onColumnVisibilityChanged(): void {
        var newValue = !this.column.isVisible();
        this.columnController.setColumnVisible(this.column, newValue);
    }

}