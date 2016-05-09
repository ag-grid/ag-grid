import {
    Utils as _,
    SvgFactory,
    Autowired,
    Column,
    Component,
    GridOptionsWrapper,
    ColumnController,
    GridPanel,
    DragSource,
    DragAndDropService,
    OriginalColumnGroup,
    PostConstruct
} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

export class RenderedGroup extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private static TEMPLATE =
        '<div class="ag-column-select-column-group">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eGroupOpenedIcon" class="ag-column-group-closed-icon"></span>' +
        '    <span id="eGroupClosedIcon" class="ag-column-group-opened-icon"></span>' +
        '    <span class="ag-column-visible-icon"></span>' +
        '    <span class="ag-column-hidden-icon"></span>' +
        '    <span class="ag-column-half-icon"></span>' +
        '  </span>' +
        '  <span id="eText" class="ag-column-select-column-group-label"></span>' +
        '</div>';

    private columnGroup: OriginalColumnGroup;
    private expanded = true;
    private columnDept: number;

    private eGroupClosedIcon: HTMLElement;
    private eGroupOpenedIcon: HTMLElement;

    private expandedCallback: ()=>void;

    private allowDragging: boolean;

    private displayName: string;

    private eAllVisibleIcon: HTMLInputElement;
    private eAllHiddenIcon: HTMLInputElement;
    private eHalfVisibleIcon: HTMLInputElement;

    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: ()=>void, allowDragging: boolean) {
        super(RenderedGroup.TEMPLATE);
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.expandedCallback = expandedCallback;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        var eText = this.queryForHtmlElement('#eText');

        this.displayName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        if (_.missing(this.displayName)) {
            this.displayName = '>>'
        }

        eText.innerHTML = this.displayName;
        eText.addEventListener('dblclick', this.onExpandOrContractClicked.bind(this));
        this.setupExpandContract();

        var eIndent = this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        this.setOpenClosedIcons();

        if (this.allowDragging) {
            this.addDragSource();
        }

        this.setupVisibleIcons();
        this.addVisibilityListenersToAllChildren();
    }

    private addVisibilityListenersToAllChildren(): void {
        this.columnGroup.getLeafColumns().forEach( column => {
            this.addDestroyableEventListener(column, Column.EVENT_VISIBLE_CHANGED, this.setVisibleIcons.bind(this));
        });
    }

    private setupVisibleIcons(): void {
        this.eAllHiddenIcon = <HTMLInputElement> this.queryForHtmlElement('.ag-column-hidden-icon');
        this.eAllVisibleIcon = <HTMLInputElement> this.queryForHtmlElement('.ag-column-visible-icon');
        this.eHalfVisibleIcon = <HTMLInputElement> this.queryForHtmlElement('.ag-column-half-icon');

        this.eAllHiddenIcon.appendChild(svgFactory.createColumnHiddenIcon());
        this.eAllVisibleIcon.appendChild(svgFactory.createColumnVisibleIcon());
        this.eHalfVisibleIcon.appendChild(svgFactory.createColumnIndeterminateIcon());

        this.eAllHiddenIcon.addEventListener('click', this.setChildrenVisible.bind(this, true));
        this.eAllVisibleIcon.addEventListener('click', this.setChildrenVisible.bind(this, false));
        this.eHalfVisibleIcon.addEventListener('click', this.setChildrenVisible.bind(this, true));

        // var columnStateChangedListener = this.onColumnStateChangedListener.bind(this);
        // this.column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        // this.addDestroyFunc( ()=> this.column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener) );

        this.setVisibleIcons();
        // this.setIconVisibility();
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: this.columnGroup.getLeafColumns()
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon = this.queryForHtmlElement('#eGroupClosedIcon');
        this.eGroupOpenedIcon = this.queryForHtmlElement('#eGroupOpenedIcon');

        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsWrapper, null, svgFactory.createFolderClosed));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsWrapper, null, svgFactory.createFolderOpen));

        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
    }

    private setChildrenVisible(visible: boolean): void {
        var childColumns = this.columnGroup.getLeafColumns();
        this.columnController.setColumnsVisible(childColumns, visible);
    }

    private setVisibleIcons(): void {
        var visibleChildCount = 0;
        var hiddenChildCount = 0;
        this.columnGroup.getLeafColumns().forEach( (column: Column) => {
            if (column.isVisible()) {
                visibleChildCount++;
            } else {
                hiddenChildCount++;
            }
        });
        _.setVisible(this.eAllHiddenIcon, visibleChildCount===0);
        _.setVisible(this.eAllVisibleIcon, hiddenChildCount===0);
        _.setVisible(this.eHalfVisibleIcon, hiddenChildCount!==0 && visibleChildCount!==0);
    }

    private onExpandOrContractClicked(): void {
        this.expanded = !this.expanded;
        this.setOpenClosedIcons();
        this.expandedCallback();
    }

    private setOpenClosedIcons(): void {
        var folderOpen = this.expanded;
        _.setVisible(this.eGroupClosedIcon, !folderOpen);
        _.setVisible(this.eGroupOpenedIcon, folderOpen);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }
}