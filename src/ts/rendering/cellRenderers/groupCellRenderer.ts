import {SvgFactory} from "../../svgFactory";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ExpressionService} from "../../valueService/expressionService";
import {EventService} from "../../eventService";
import {Constants} from "../../constants";
import {Utils as _} from "../../utils";
import {Autowired, Context} from "../../context/context";
import {Component} from "../../widgets/component";
import {ICellRenderer, ICellRendererParams} from "./iCellRenderer";
import {RowNode} from "../../entities/rowNode";
import {CellRendererService} from "../cellRendererService";
import {ValueFormatterService} from "../valueFormatterService";
import {CheckboxSelectionComponent} from "../checkboxSelectionComponent";
import {ColumnController} from "../../columnController/columnController";
import {Column} from "../../entities/column";
import {RefSelector} from "../../widgets/componentAnnotations";

let svgFactory = SvgFactory.getInstance();

export interface GroupCellRendererParams extends ICellRendererParams{
    pinned:string,
    padding:number,
    suppressPadding:boolean,
    innerRenderer:any,
    footerValueGetter:any,
    suppressCount:boolean,
    checkbox:any,
    scope:any,
    actualValue:string
}

export class GroupCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE =
        '<span>' +
         '<span class="ag-group-expanded" ref="eExpanded"></span>' +
         '<span class="ag-group-contracted" ref="eContracted"></span>' +
         '<span class="ag-group-checkbox" ref="eCheckbox"></span>' +
         '<span class="ag-group-value" ref="eValue"></span>' +
         '<span class="ag-group-child-count" ref="eChildCount"></span>' +
        '</span>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;

    @RefSelector('eExpanded') private eExpanded: HTMLElement;
    @RefSelector('eContracted') private eContracted: HTMLElement;
    @RefSelector('eCheckbox') private eCheckbox: HTMLElement;
    @RefSelector('eValue') private eValue: HTMLElement;
    @RefSelector('eChildCount') private eChildCount: HTMLElement;

    private params: GroupCellRendererParams;


    // will be true if the node was pulled down
    private draggedFromHideOpenParents: boolean;

    // this is normally the rowNode of this row, however when doing hideOpenParents, it will
    // be the parent who's details we are actually showing if the data was pulled down.
    private displayedGroup: RowNode;

    constructor() {
        super(GroupCellRenderer.TEMPLATE);
    }

    public init(params: GroupCellRendererParams): void {

        this.params = params;

        let embeddedRowMismatch = this.embeddedRowMismatch();
        if (embeddedRowMismatch) { return; }

        //This allows for empty strings to appear as groups since
        //it will only return for null or undefined.
        if (params.value==null) {
            return;
        }

        this.setupDragOpenParents();
        this.setupComponents();
    }

    private setupComponents(): void {
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.addPadding();
    }

    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    private embeddedRowMismatch(): boolean {
        if (this.gridOptionsWrapper.isEmbedFullWidthRows()) {

            let pinnedLeftCell = this.params.pinned === Column.PINNED_LEFT;
            let pinnedRightCell = this.params.pinned === Column.PINNED_RIGHT;
            let bodyCell = !pinnedLeftCell && !pinnedRightCell;

            if (this.gridOptionsWrapper.isEnableRtl()) {
                if (this.columnController.isPinningLeft()) {
                    return !pinnedRightCell;
                } else {
                    return !bodyCell;
                }
            } else {
                if (this.columnController.isPinningLeft()) {
                    return !pinnedLeftCell;
                } else {
                    return !bodyCell;
                }
            }
        } else {
            return false;
        }
    }

    private setPadding(): void {

        if (this.gridOptionsWrapper.isGroupHideOpenParents()) { return; }

        let params = this.params;
        let rowNode: RowNode = params.node;

        let paddingPx: number;

        // never any padding on top level nodes
        if (rowNode.uiLevel<=0) {
            paddingPx = 0;
        } else {
            let paddingFactor: number = (params.padding >= 0) ? params.padding : 10;
            paddingPx = rowNode.uiLevel * paddingFactor;

            let reducedLeafNode = this.columnController.isPivotMode() && params.node.leafGroup;
            if (rowNode.footer) {
                paddingPx += 15;
            } else if (!rowNode.isExpandable() || reducedLeafNode) {
                paddingPx += 10;
            }
        }

        if (this.gridOptionsWrapper.isEnableRtl()) {
            // if doing rtl, padding is on the right
            this.getGui().style.paddingRight = paddingPx + 'px';
        } else {
            // otherwise it is on the left
            this.getGui().style.paddingLeft = paddingPx + 'px';
        }
    }

    private addPadding(): void {

        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        let node: RowNode = this.params.node;
        let suppressPadding = this.params.suppressPadding;

        if (!suppressPadding) {
            this.addDestroyableEventListener(node, RowNode.EVENT_UI_LEVEL_CHANGED, this.setPadding.bind(this));
            this.setPadding();
        }
    }

    private addValueElement(): void {
        let params = this.params;
        let rowNode = this.displayedGroup;
        if (params.innerRenderer) {
            this.createFromInnerRenderer();
        } else if (rowNode.footer) {
            this.createFooterCell();
        } else if (rowNode.group) {
            this.createGroupCell();
            this.addChildCount();
        } else {
            this.createLeafCell();
        }
    }

    private createFromInnerRenderer(): void {
        let innerComponent = this.cellRendererService.useCellRenderer(this.params.innerRenderer, this.eValue, this.params);
        this.addDestroyFunc( ()=> {
            if (innerComponent && innerComponent.destroy) {
                innerComponent.destroy();
            }
        });
    }

    private createFooterCell(): void {
        let footerValue: string;
        let footerValueGetter = this.params.footerValueGetter;
        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            let paramsClone: any = _.cloneObject(this.params);
            paramsClone.value = this.params.value;
            if (typeof footerValueGetter === 'function') {
                footerValue = footerValueGetter(paramsClone);
            } else if (typeof footerValueGetter === 'string') {
                footerValue = this.expressionService.evaluate(footerValueGetter, paramsClone);
            } else {
                console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
            }
        } else {
            footerValue = 'Total ' + this.params.value;
        }

        this.eValue.innerHTML = footerValue;
    }

    private createGroupCell(): void {
        let params = this.params;
        let rowGroupColumn = this.displayedGroup.rowGroupColumn;

        // we try and use the cellRenderer of the column used for the grouping if we can
        let columnToUse: Column = rowGroupColumn ? rowGroupColumn : params.column;

        let groupName = this.params.value;
        let valueFormatted = this.valueFormatterService.formatValue(columnToUse, params.node, params.scope, groupName);

        let groupedColCellRenderer = columnToUse.getCellRenderer();

        // reuse the params but change the value
        if (typeof groupedColCellRenderer === 'function') {
            // reuse the params but change the value
            params.value = groupName;
            params.valueFormatted = valueFormatted;

            let colDefOfGroupedCol = columnToUse.getColDef();
            let groupedColCellRendererParams = colDefOfGroupedCol ? colDefOfGroupedCol.cellRendererParams : null;

            // because we are talking about the different column to the original, any user provided params
            // are for the wrong column, so need to copy them in again.
            if (groupedColCellRendererParams) {
                _.assign(params, groupedColCellRenderer);
            }
            this.cellRendererService.useCellRenderer(colDefOfGroupedCol.cellRenderer, this.eValue, params);
        } else {
            let valueToRender = _.exists(valueFormatted) ? valueFormatted : groupName;
            if (_.exists(valueToRender) && valueToRender !== '') {
                this.eValue.appendChild(document.createTextNode(valueToRender));
            }
        }
    }

    private addChildCount(): void {

        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) { return; }

        this.addDestroyableEventListener(this.displayedGroup, RowNode.EVENT_ALL_CHILDREN_COUNT_CELL_CHANGED, this.updateChildCount.bind(this));

        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    }

    private updateChildCount(): void {
        let allChildrenCount = this.displayedGroup.allChildrenCount;
        this.eChildCount.innerHTML = allChildrenCount >= 0 ? `(${allChildrenCount})` : ``;
    }

    private createLeafCell(): void {
        if (_.exists(this.params.value)) {
            this.eValue.innerHTML = this.params.value;
        }
    }

    private isUserWantsSelected(): boolean {
        let paramsCheckbox = this.params.checkbox;
        if (typeof paramsCheckbox === 'function') {
            return paramsCheckbox(this.params);
        } else {
            return paramsCheckbox === true;
        }
    }

    private addCheckboxIfNeeded(): void {
        let rowNode = this.params.node;
        let checkboxNeeded = this.isUserWantsSelected()
                // footers cannot be selected
                && !rowNode.footer
                // pinned rows cannot be selected
                && !rowNode.rowPinned
                // flowers cannot be selected
                && !rowNode.flower;
        if (checkboxNeeded) {
            let cbSelectionComponent = new CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);
            cbSelectionComponent.init({rowNode: rowNode});
            this.eCheckbox.appendChild(cbSelectionComponent.getGui());
            this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );
        }
    }

    private addExpandAndContract(): void {
        let params = this.params;
        let eGroupCell: HTMLElement = params.eGridCell;
        let eExpandedIcon = _.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createGroupContractedIcon);
        let eContractedIcon = _.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedIcon);
        this.eExpanded.appendChild(eExpandedIcon);
        this.eContracted.appendChild(eContractedIcon);

        let expandOrContractListener = this.onExpandOrContract.bind(this);
        this.addDestroyableEventListener(this.eExpanded, 'click', expandOrContractListener);
        this.addDestroyableEventListener(this.eContracted, 'click', expandOrContractListener);

        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit()) {
            this.addDestroyableEventListener(eGroupCell, 'dblclick', expandOrContractListener);
        }

        // expand / contract as the user hits enter
        this.addDestroyableEventListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(params.node, RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (_.isKeyPressed(event, Constants.KEY_ENTER)) {
            let cellEditable = this.params.column.isCellEditable(this.params.node);
            if (cellEditable) {
                return;
            }
            event.preventDefault();
            this.onExpandOrContract();
        }
    }

    private setupDragOpenParents(): void {

        let column = this.params.column;
        let rowNode: RowNode = this.params.node;

        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            this.draggedFromHideOpenParents = false;
        } else if (!rowNode.group) {
            // if we are here, and we are not a group, then we must of been dragged down,
            // as otherwise the cell would be blank, and if cell is blank, this method is never called.
            this.draggedFromHideOpenParents = true;
        } else {
            let rowGroupColumn = rowNode.rowGroupColumn;
            // if the displayGroup column for this col matches the rowGroupColumn we grouped by for this node,
            // then nothing was dragged down
            this.draggedFromHideOpenParents = !column.isRowGroupDisplayed(rowGroupColumn.getId());
        }

        if (this.draggedFromHideOpenParents) {
            let pointer = rowNode.parent;
            while (true) {
                if (_.missing(pointer)) {
                    break;
                }
                if (pointer.rowGroupColumn && column.isRowGroupDisplayed(pointer.rowGroupColumn.getId())) {
                    this.displayedGroup = pointer;
                    break;
                }
                pointer = pointer.parent;
            }
        }

        // if we didn't find a displayed group, set it to the row node
        if (_.missing(this.displayedGroup)) {
            this.displayedGroup = rowNode;
        }
    }

    public onExpandOrContract(): void {

        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        let rowNode: RowNode = this.displayedGroup;

        rowNode.setExpanded(!rowNode.expanded);

        if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
            this.params.api.redrawRows({rowNodes: [rowNode]});
        }
    }

    private showExpandAndContractIcons(): void {
        let rowNode = this.params.node;

        let reducedLeafNode = this.columnController.isPivotMode() && rowNode.leafGroup;

        let expandable = this.draggedFromHideOpenParents || (rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode);

        if (expandable) {
            // if expandable, show one based on expand state.
            // if we were dragged down, means our parent is always expanded
            let expanded = this.draggedFromHideOpenParents ? true : rowNode.expanded;
            _.setVisible(this.eContracted, !expanded);
            _.setVisible(this.eExpanded, expanded);
        } else {
            // it not expandable, show neither
            _.setVisible(this.eExpanded, false);
            _.setVisible(this.eContracted, false);
        }
    }

    public refresh(): boolean {
        return false;
    }
}
