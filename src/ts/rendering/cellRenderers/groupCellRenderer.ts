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
import {MouseEventService} from "../../gridPanel/mouseEventService";

export interface GroupCellRendererParams extends ICellRendererParams{
    pinned:string,
    padding:number,
    suppressPadding:boolean,
    footerValueGetter:any,
    suppressCount:boolean,
    fullWidth:boolean,
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
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;

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

    private cellIsBlank: boolean;

    // keep reference to this, so we can remove again when indent changes
    private indentClass: string;

    constructor() {
        super(GroupCellRenderer.TEMPLATE);
    }

    public init(params: GroupCellRendererParams): void {

        this.params = params;

        let embeddedRowMismatch = this.isEmbeddedRowMismatch();
        // This allows for empty strings to appear as groups since
        // it will only return for null or undefined.
        let cellIsEmpty = params.value==null;

        this.cellIsBlank = embeddedRowMismatch || cellIsEmpty;

        if (this.cellIsBlank) { return; }

        this.setupDragOpenParents();

        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.setupIndent();
    }

    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    private isEmbeddedRowMismatch(): boolean {
        if (this.params.fullWidth && this.gridOptionsWrapper.isEmbedFullWidthRows()) {

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

    private setIndent(): void {

        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }

        let params = this.params;
        let rowNode: RowNode = params.node;

        // let paddingPx: number;
        let paddingCount = rowNode.uiLevel;

        let pivotModeAndLeafGroup = this.columnController.isPivotMode() && params.node.leafGroup;

        let notExpandable = !rowNode.isExpandable();
        if (rowNode.footer || notExpandable || pivotModeAndLeafGroup) {
            paddingCount += 1;
        }

        let userProvidedPaddingPixelsTheDeprecatedWay = params.padding >= 0;
        if (userProvidedPaddingPixelsTheDeprecatedWay) {
            this.setPaddingDeprecatedWay(paddingCount, params.padding);
            return;
        }

        if (this.indentClass) {
            this.removeCssClass(this.indentClass);
        }

        this.indentClass = 'ag-row-group-indent-' + paddingCount;
        this.addCssClass(this.indentClass);
    }

    private setPaddingDeprecatedWay(paddingCount: number, padding: number): void {
        _.doOnce( () => console.warn('ag-Grid: since v14.2, configuring padding for groupCellRenderer should be done with Sass variables and themes. Please see the ag-Grid documentation page for Themes, in particular the property $row-group-indent-size.'), 'groupCellRenderer->doDeprecatedWay');

        let paddingPx = paddingCount * padding;

        if (this.gridOptionsWrapper.isEnableRtl()) {
            // if doing rtl, padding is on the right
            this.getGui().style.paddingRight = paddingPx + 'px';
        } else {
            // otherwise it is on the left
            this.getGui().style.paddingLeft = paddingPx + 'px';
        }
    }

    private setupIndent(): void {

        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        let node: RowNode = this.params.node;
        let suppressPadding = this.params.suppressPadding;

        if (!suppressPadding) {
            this.addDestroyableEventListener(node, RowNode.EVENT_UI_LEVEL_CHANGED, this.setIndent.bind(this));
            this.setIndent();
        }
    }

    private addValueElement(): void {
        let params = this.params;
        let rowNode = this.displayedGroup;
        if (rowNode.footer) {
            this.createFooterCell();
        } else if (
            rowNode.hasChildren() ||
            _.get(params.colDef, 'cellRendererParams.innerRenderer', null) ||
            _.get(params.colDef, 'cellRendererParams.innerRendererFramework', null)
        ) {
            this.createGroupCell();
            if (rowNode.hasChildren()){
                this.addChildCount();
            }
        } else {
            this.createLeafCell();
        }
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
        let valueFormatted = columnToUse ?
            this.valueFormatterService.formatValue(columnToUse, params.node, params.scope, groupName) : null;

        params.valueFormatted = valueFormatted;
        if (params.fullWidth == true) {
            this.cellRendererService.useFullWidthGroupRowInnerCellRenderer(this.eValue, params);
        } else {
            this.cellRendererService.useInnerCellRenderer(this.params.colDef.cellRendererParams, columnToUse.getColDef(), this.eValue, params);
        }
    }

    private addChildCount(): void {

        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) { return; }

        this.addDestroyableEventListener(this.displayedGroup, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, this.updateChildCount.bind(this));

        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    }

    private updateChildCount(): void {
        let allChildrenCount = this.displayedGroup.allChildrenCount;
        this.eChildCount.innerHTML = allChildrenCount >= 0 ? `(${allChildrenCount})` : ``;
    }

    private createLeafCell(): void {
        if (_.exists(this.params.value)) {
            this.eValue.innerHTML = this.params.valueFormatted ? this.params.valueFormatted : this.params.value;
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
                // details cannot be selected
                && !rowNode.detail;
        if (checkboxNeeded) {
            let cbSelectionComponent = new CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);
            cbSelectionComponent.init({rowNode: rowNode, column: this.params.column});
            this.eCheckbox.appendChild(cbSelectionComponent.getGui());
            this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );
        }
    }

    private addExpandAndContract(): void {
        let params = this.params;
        let eGroupCell = params.eGridCell;
        let eExpandedIcon = _.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null);
        let eContractedIcon = _.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null);
        this.eExpanded.appendChild(eExpandedIcon);
        this.eContracted.appendChild(eContractedIcon);

        this.addDestroyableEventListener(this.eExpanded, 'click', this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eContracted, 'click', this.onExpandClicked.bind(this));

        // expand / contract as the user hits enter
        this.addDestroyableEventListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(params.node, RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();

        // because we don't show the expand / contract when there are no children, we need to check every time
        // the number of children change.
        this.addDestroyableEventListener(this.displayedGroup, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED,
            this.onAllChildrenCountChanged.bind(this));

        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit() && this.isExpandable()) {
            this.addDestroyableEventListener(eGroupCell, 'dblclick', this.onCellDblClicked.bind(this));
        }
    }

    private onAllChildrenCountChanged(): void {
        // maybe if no children now, we should hide the expand / contract icons
        this.showExpandAndContractIcons();
        // if we have no children, this impacts the indent
        this.setIndent();
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
        } else if (!rowNode.hasChildren()) {
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

    public onExpandClicked(mouseEvent: MouseEvent): void {
        if (_.isStopPropagationForAgGrid(mouseEvent)) { return; }
        this.onExpandOrContract();
    }

    public onCellDblClicked(mouseEvent: MouseEvent): void {
        if (_.isStopPropagationForAgGrid(mouseEvent)) { return; }

        // we want to avoid acting on double click events on the expand / contract icon,
        // as that icons already has expand / collapse functionality on it. otherwise if
        // the icon was double clicked, we would get 'click', 'click', 'dblclick' which
        // is open->close->open, however double click should be open->close only.
        let targetIsExpandIcon
            = _.isElementInEventPath(this.eExpanded, mouseEvent)
            || _.isElementInEventPath(this.eContracted, mouseEvent);

        if (!targetIsExpandIcon) {
            this.onExpandOrContract();
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

    private isExpandable(): boolean {
        let rowNode = this.params.node;
        let reducedLeafNode = this.columnController.isPivotMode() && rowNode.leafGroup;
        return this.draggedFromHideOpenParents ||
                (rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode);
    }

    private showExpandAndContractIcons(): void {

        let rowNode = this.params.node;

        if (this.isExpandable()) {
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
