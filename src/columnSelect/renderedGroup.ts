import {
    Utils as _,
    SvgFactory,
    Autowired,
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
        '  <span class="ag-column-group-arrows">' +
        '    <span id="eGroupClosedArrow" class="ag-column-group-closed-arrow"></span>' +
        '    <span id="eGroupOpenedArrow" class="ag-column-group-opened-arrow"></span>' +
        '  </span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eGroupOpenedIcon" class="ag-column-group-closed-icon"></span>' +
        '    <span id="eGroupClosedIcon" class="ag-column-group-opened-icon"></span>' +
        '  </span>' +
        '    <span id="eText" class="ag-column-select-column-group-label"></span>' +
        '</div>';

    private columnGroup: OriginalColumnGroup;
    private expanded = true;
    private columnDept: number;

    private eGroupClosedIcon: HTMLElement;
    private eGroupClosedArrow: HTMLElement;
    private eGroupOpenedIcon: HTMLElement;
    private eGroupOpenedArrow: HTMLElement;

    private expandedCallback: ()=>void;

    private allowDragging: boolean;

    private displayName: string;

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

        this.setIconVisibility();

        if (this.allowDragging) {
            this.addDragSource();
        }
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
        this.eGroupClosedArrow = this.queryForHtmlElement('#eGroupClosedArrow');
        this.eGroupOpenedIcon = this.queryForHtmlElement('#eGroupOpenedIcon');
        this.eGroupOpenedArrow = this.queryForHtmlElement('#eGroupOpenedArrow');

        this.eGroupClosedArrow.appendChild(svgFactory.createSmallArrowRightSvg());
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsWrapper, null, svgFactory.createFolderClosed));
        this.eGroupOpenedArrow.appendChild(svgFactory.createSmallArrowDownSvg());
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsWrapper, null, svgFactory.createFolderOpen));

        this.eGroupClosedIcon.addEventListener('click', this.onExpandOrContractClicked.bind(this));
        this.eGroupClosedArrow.addEventListener('click', this.onExpandOrContractClicked.bind(this));
        this.eGroupOpenedIcon.addEventListener('click', this.onExpandOrContractClicked.bind(this));
        this.eGroupOpenedArrow.addEventListener('click', this.onExpandOrContractClicked.bind(this));
    }

    private onExpandOrContractClicked(): void {
        this.expanded = !this.expanded;
        this.setIconVisibility();
        this.expandedCallback();
    }

    private setIconVisibility(): void {
        var folderOpen = this.expanded;
        _.setVisible(this.eGroupClosedArrow, !folderOpen);
        _.setVisible(this.eGroupClosedIcon, !folderOpen);
        _.setVisible(this.eGroupOpenedArrow, folderOpen);
        _.setVisible(this.eGroupOpenedIcon, folderOpen);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }
}