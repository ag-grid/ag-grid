import { ColumnModel } from "../../columns/columnModel";
import { UserCompDetails, UserComponentFactory } from "../../components/framework/userComponentFactory";
import { KeyCode } from "../../constants/keyCode";
import { BeanStub } from "../../context/beanStub";
import { Autowired } from "../../context/context";
import { CtrlsService } from "../../ctrlsService";
import { CellRendererSelectorFunc } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { removeAriaExpanded, setAriaExpanded } from "../../utils/aria";
import { isElementInEventPath, isStopPropagationForAgGrid, stopPropagationForAgGrid } from "../../utils/event";
import { doOnce } from "../../utils/function";
import { missing } from "../../utils/generic";
import { createIconNoSpan } from "../../utils/icon";
import { cloneObject } from "../../utils/object";
import { ExpressionService } from "../../valueService/expressionService";
import { CheckboxSelectionComponent } from "../checkboxSelectionComponent";
import { RowDragComp } from "../row/rowDragComp";
import { ValueFormatterService } from "../valueFormatterService";
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "./iCellRenderer";

export interface IGroupCellRenderer {
    setInnerRenderer(compDetails: UserCompDetails | undefined, valueToDisplay: any): void;
    setChildCount(count: string): void;
    setCheckboxVisible(value: boolean): void;
    setExpandedDisplayed(value: boolean): void;
    setContractedDisplayed(value: boolean): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
}

export interface FooterValueGetterFunc {
    (params: GroupCellRendererParams): any;
}

export interface GroupCellRendererParams<TData = any, TValue = any> extends ICellRendererParams<TData, TValue> {

    /**
     * Only when in fullWidth, this gives whether the comp is pinned or not.
     * If not doing fullWidth, then this is not provided, as pinned can be got from the column.
     */
    pinned?: "left" | "right" | null;
    /** 'true' if comp is showing full width. */
    fullWidth: boolean;

    /** Set to `true` to not include any padding (indentation) in the child rows. */
    suppressPadding: boolean;
    /** Set to `true` to suppress expand on double click. */
    suppressDoubleClickExpand: boolean;
    /** Set to `true` to suppress expand on <kbd>Enter</kbd> */
    suppressEnterExpand: boolean;
    /** The value getter for the footer text. Can be a function or expression. */
    footerValueGetter: string | FooterValueGetterFunc;
    /** If `true`, count is not displayed beside the name. */
    suppressCount: boolean;
    /** If `true`, a selection checkbox is included.  */
    checkbox: any;
    rowDrag?: boolean;

    /** The renderer to use for inside the cell (after grouping functions are added) */
    innerRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    /**
     * @deprecated as of v27, use innerRenderer for Framework components
     * Same as `innerRenderer` but for a framework component. */
    innerRendererFramework?: any;
    /** Additional params to customise to the `innerRenderer`. */
    innerRendererParams?: any;
    /** Callback to enable different innerRenderers to be used based of value of params. */
    innerRendererSelector?: CellRendererSelectorFunc;

    /** @deprecated */
    padding: number;
}

export class GroupCellRendererCtrl extends BeanStub {

    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired("ctrlsService") private ctrlsService: CtrlsService;

    private params: GroupCellRendererParams;

    // will be true if the node was pulled down
    private showingValueForOpenedParent: boolean;

    // this is normally the rowNode of this row, however when doing hideOpenParents, it will
    // be the parent who's details we are actually showing if the data was pulled down.
    private displayedGroupNode: RowNode;

    private cellIsBlank: boolean;

    private eGui: HTMLElement;
    private eExpanded: HTMLElement;
    private eContracted: HTMLElement;
    private eCheckbox: HTMLElement;
    private expandListener: (() => null) | null;

    // keep reference to this, so we can remove again when indent changes
    private indentClass: string;

    private comp: IGroupCellRenderer;
    private compClass: any;

    public init(comp: IGroupCellRenderer, eGui: HTMLElement, eCheckbox: HTMLElement, eExpanded: HTMLElement, eContracted: HTMLElement, compClass: any, params: GroupCellRendererParams): void {
        this.params = params;
        this.eGui = eGui;
        this.eCheckbox = eCheckbox;
        this.eExpanded = eExpanded;
        this.eContracted = eContracted;
        this.comp = comp;
        this.compClass = compClass;

        const topLevelFooter = this.isTopLevelFooter();

        const embeddedRowMismatch = this.isEmbeddedRowMismatch();
        // This allows for empty strings to appear as groups since
        // it will only return for null or undefined.
        const nullValue = params.value == null;
        let skipCell = false;

        // if the groupCellRenderer is inside of a footer and groupHideOpenParents is true
        // we should only display the groupCellRenderer if the current column is the rowGroupedColumn
        if (this.gridOptionsService.is('groupIncludeFooter') && this.gridOptionsService.is('groupHideOpenParents')) {
            const node = params.node;

            if (node.footer) {
                const showRowGroup = params.colDef && params.colDef.showRowGroup;
                const rowGroupColumnId = node.rowGroupColumn && node.rowGroupColumn.getColId();

                skipCell = showRowGroup !== rowGroupColumnId;
            }
        }

        this.cellIsBlank = topLevelFooter ? false : (embeddedRowMismatch || nullValue || skipCell);

        if (this.cellIsBlank) { return; }

        this.setupShowingValueForOpenedParent();
        this.findDisplayedGroupNode();
        this.addFullWidthRowDraggerIfNeeded();
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.setupIndent();
        this.refreshAriaExpanded();
    }

    protected destroy(): void {
        super.destroy();
        // property cleanup to avoid memory leaks
        this.expandListener = null;
    }

    private refreshAriaExpanded(): void {
        const { node, eParentOfValue } = this.params;

        if (this.expandListener) {
            this.expandListener = this.expandListener();
        }

        if (!this.isExpandable()) {
            removeAriaExpanded(eParentOfValue);
            return;
        }

        const listener = () => {
            // for react, we don't use JSX, as setting attributes via jsx is slower
            setAriaExpanded(eParentOfValue, !!node.expanded);
        };

        this.expandListener = this.addManagedListener(node, RowNode.EVENT_EXPANDED_CHANGED, listener) || null;
        listener();
    }

    private isTopLevelFooter(): boolean {
        if (!this.gridOptionsService.is('groupIncludeTotalFooter')) { return false; }

        if (this.params.value != null || this.params.node.level != -1) { return false; }

        // at this point, we know it's the root node and there is no value present, so it's a footer cell.
        // the only thing to work out is if we are displaying groups  across multiple
        // columns (groupDisplayType: 'multipleColumns'), we only want 'total' to appear in the first column.

        const colDef = this.params.colDef;
        const doingFullWidth = colDef == null;
        if (doingFullWidth) { return true; }

        if (colDef!.showRowGroup === true) { return true; }

        const rowGroupCols = this.columnModel.getRowGroupColumns();
        // this is a sanity check, rowGroupCols should always be present
        if (!rowGroupCols || rowGroupCols.length === 0) { return true; }

        const firstRowGroupCol = rowGroupCols[0];

        return firstRowGroupCol.getId() === colDef!.showRowGroup;
    }

    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    private isEmbeddedRowMismatch(): boolean {
        if (!this.params.fullWidth || !this.gridOptionsService.is('embedFullWidthRows')) { return false; }

        const pinnedLeftCell = this.params.pinned === 'left';
        const pinnedRightCell = this.params.pinned === 'right';
        const bodyCell = !pinnedLeftCell && !pinnedRightCell;

        if (this.gridOptionsService.is('enableRtl')) {
            if (this.columnModel.isPinningLeft()) {
                return !pinnedRightCell;
            }
            return !bodyCell;
        }

        if (this.columnModel.isPinningLeft()) {
            return !pinnedLeftCell;
        }

        return !bodyCell;
    }

    private findDisplayedGroupNode(): void {
        const column = this.params.column;
        const rowNode: RowNode = this.params.node;

        if (this.showingValueForOpenedParent) {
            let pointer = rowNode.parent;

            while (pointer != null) {
                if (pointer.rowGroupColumn && column!.isRowGroupDisplayed(pointer.rowGroupColumn.getId())) {
                    this.displayedGroupNode = pointer;
                    break;
                }
                pointer = pointer.parent;
            }
        }

        // if we didn't find a displayed group, set it to the row node
        if (missing(this.displayedGroupNode)) {
            this.displayedGroupNode = rowNode;
        }
    }

    private setupShowingValueForOpenedParent(): void {
        // note - this code depends on sortService.updateGroupDataForHiddenOpenParents, where group data
        // is updated to reflect the dragged down parents
        const rowNode: RowNode = this.params.node;
        const column = this.params.column as Column;

        if (!this.gridOptionsService.is('groupHideOpenParents')) {
            this.showingValueForOpenedParent = false;
            return;
        }

        // hideOpenParents means rowNode.groupData can have data for the group this column is displaying, even though
        // this rowNode isn't grouping by the column we are displaying

        // if no groupData at all, we are not showing a parent value
        if (!rowNode.groupData) {
            this.showingValueForOpenedParent = false;
            return;
        }

        // this is the normal case, in that we are showing a group for which this column is configured. note that
        // this means the Row Group is closed (if it was open, we would not be displaying it)
        const showingGroupNode = rowNode.rowGroupColumn != null;
        if (showingGroupNode) {
            const keyOfGroupingColumn = rowNode.rowGroupColumn!.getId();
            const configuredToShowThisGroupLevel = column.isRowGroupDisplayed(keyOfGroupingColumn);
            // if showing group as normal, we didn't take group info from parent
            if (configuredToShowThisGroupLevel) {
                this.showingValueForOpenedParent = false;
                return;
            }
        }

        // see if we are showing a Group Value for the Displayed Group. if we are showing a group value, and this Row Node
        // is not grouping by this Displayed Group, we must of gotten the value from a parent node
        const valPresent = rowNode.groupData[column.getId()] != null;

        this.showingValueForOpenedParent = valPresent;
    }

    private addValueElement(): void {
        if (this.displayedGroupNode.footer) {
            this.addFooterValue();
        } else {
            this.addGroupValue();
            this.addChildCount();
        }
    }

    private addGroupValue(): void {

        // we try and use the cellRenderer of the column used for the grouping if we can
        const paramsAdjusted = this.adjustParamsWithDetailsFromRelatedColumn();
        const innerCompDetails = this.getInnerCompDetails(paramsAdjusted);

        const { valueFormatted, value } = paramsAdjusted;
        const valueWhenNoRenderer = valueFormatted != null ? valueFormatted : value;

        this.comp.setInnerRenderer(innerCompDetails, valueWhenNoRenderer);
    }

    private adjustParamsWithDetailsFromRelatedColumn(): GroupCellRendererParams {

        const relatedColumn = this.displayedGroupNode.rowGroupColumn;
        const column = this.params.column;

        if (!relatedColumn) { return this.params; }

        const notFullWidth = column != null;
        if (notFullWidth) {
            const showingThisRowGroup = column!.isRowGroupDisplayed(relatedColumn.getId());
            if (!showingThisRowGroup) { return this.params; }
        }

        const params = this.params;

        const { value, node } = this.params;
        const valueFormatted = this.valueFormatterService.formatValue(relatedColumn, node, value);

        // we don't update the original params, as they could of come through React,
        // as react has RowGroupCellRenderer, which means the params could be props which
        // would be read only
        const paramsAdjusted = {
            ...params,
            valueFormatted: valueFormatted
        };

        return paramsAdjusted;
    }

    private addFooterValue(): void {
        const footerValueGetter = this.params.footerValueGetter;
        let footerValue = '';

        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            const paramsClone = cloneObject(this.params);
            paramsClone.value = this.params.value;

            if (typeof footerValueGetter === 'function') {
                footerValue = footerValueGetter(paramsClone);
            } else if (typeof footerValueGetter === 'string') {
                footerValue = this.expressionService.evaluate(footerValueGetter, paramsClone);
            } else {
                console.warn('AG Grid: footerValueGetter should be either a function or a string (expression)');
            }
        } else {
            footerValue = 'Total ' + (this.params.value != null ? this.params.value : '');
        }

        const innerCompDetails = this.getInnerCompDetails(this.params);

        this.comp.setInnerRenderer(innerCompDetails, footerValue);
    }

    private getInnerCompDetails(params: GroupCellRendererParams): UserCompDetails | undefined {

        // for full width rows, we don't do any of the below
        if (params.fullWidth) {
            return this.userComponentFactory.getFullWidthGroupRowInnerCellRenderer(
                this.gridOptionsService.get('groupRowRendererParams'), params);
        }

        // when grouping, the normal case is we use the cell renderer of the grouped column. eg if grouping by country
        // and then rating, we will use the country cell renderer for each country group row and likewise the rating
        // cell renderer for each rating group row.
        //
        // however if the user has innerCellRenderer defined, this gets preference and we don't use cell renderers
        // of the grouped columns.
        //
        // so we check and use in the following order:
        //
        // 1) thisColDef.cellRendererParams.innerRenderer of the column showing the groups (eg auto group column)
        // 2) groupedColDef.cellRenderer of the grouped column
        // 3) groupedColDef.cellRendererParams.innerRenderer

        // we check if cell renderer provided for the group cell renderer, eg colDef.cellRendererParams.innerRenderer
        const innerCompDetails = this.userComponentFactory
            .getInnerRendererDetails(params, params);

        // avoid using GroupCellRenderer again, otherwise stack overflow, as we insert same renderer again and again.
        // this covers off chance user is grouping by a column that is also configured with GroupCellRenderer
        const isGroupRowRenderer = (details: UserCompDetails | undefined) => details && details.componentClass == this.compClass;

        if (innerCompDetails && !isGroupRowRenderer(innerCompDetails)) {
            // use the renderer defined in cellRendererParams.innerRenderer
            return innerCompDetails;
        }

        const relatedColumn = this.displayedGroupNode.rowGroupColumn;
        const relatedColDef = relatedColumn ? relatedColumn.getColDef() : undefined;

        if (!relatedColDef) {
            return;
        }

        // otherwise see if we can use the cellRenderer of the column we are grouping by
        const relatedCompDetails = this.userComponentFactory
            .getCellRendererDetails(relatedColDef, params);

        if (relatedCompDetails && !isGroupRowRenderer(relatedCompDetails)) {
            // Only if the original column is using a specific renderer, it it is a using a DEFAULT one ignore it
            return relatedCompDetails;
        }

        if (isGroupRowRenderer(relatedCompDetails) &&
            relatedColDef.cellRendererParams &&
            relatedColDef.cellRendererParams.innerRenderer) {
            // edge case - this comes from a column which has been grouped dynamically, that has a renderer 'group'
            // and has an inner cell renderer
            const res = this.userComponentFactory.getInnerRendererDetails(relatedColDef.cellRendererParams, params);
            return res;
        }
    }

    private addChildCount(): void {
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) { return; }

        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, this.updateChildCount.bind(this));

        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    }

    private updateChildCount(): void {
        const allChildrenCount = this.displayedGroupNode.allChildrenCount;
        const showingGroupForThisNode = this.isShowRowGroupForThisRow();
        const showCount = showingGroupForThisNode && allChildrenCount != null && allChildrenCount >= 0;
        const countString = showCount ? `(${allChildrenCount})` : ``;
        this.comp.setChildCount(countString);
    }

    private isShowRowGroupForThisRow(): boolean {
        if (this.gridOptionsWrapper.isTreeData()) { return true; }

        const rowGroupColumn = this.displayedGroupNode.rowGroupColumn;

        if (!rowGroupColumn) { return false; }

        // column is null for fullWidthRows
        const column = this.params.column;
        const thisColumnIsInterested = column == null || column.isRowGroupDisplayed(rowGroupColumn.getId());

        return thisColumnIsInterested;
    }

    private addExpandAndContract(): void {
        const params = this.params;
        const eExpandedIcon = createIconNoSpan('groupExpanded', this.gridOptionsService, null);
        const eContractedIcon = createIconNoSpan('groupContracted', this.gridOptionsService, null);

        if (eExpandedIcon) {
            this.eExpanded.appendChild(eExpandedIcon);
        }

        if (eContractedIcon) {
            this.eContracted.appendChild(eContractedIcon);
        }

        const eGroupCell = params.eGridCell;

        // if editing groups, then double click is to start editing
        if (!this.gridOptionsService.is('enableGroupEdit') && this.isExpandable() && !params.suppressDoubleClickExpand) {
            this.addManagedListener(eGroupCell, 'dblclick', this.onCellDblClicked.bind(this));
        }

        this.addManagedListener(this.eExpanded, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eContracted, 'click', this.onExpandClicked.bind(this));

        // expand / contract as the user hits enter
        this.addManagedListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(params.node, RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));

        this.showExpandAndContractIcons();

        // because we don't show the expand / contract when there are no children, we need to check every time
        // the number of children change.
        const expandableChangedListener = this.onRowNodeIsExpandableChanged.bind(this);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_MASTER_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_GROUP_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_HAS_CHILDREN_CHANGED, expandableChangedListener);
    }

    private onExpandClicked(mouseEvent: MouseEvent): void {
        if (isStopPropagationForAgGrid(mouseEvent)) { return; }

        // so if we expand a node, it does not also get selected.
        stopPropagationForAgGrid(mouseEvent);

        this.onExpandOrContract(mouseEvent);
    }

    private onExpandOrContract(e: MouseEvent | KeyboardEvent): void {
        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        const rowNode: RowNode = this.displayedGroupNode;
        const nextExpandState = !rowNode.expanded;

        if (!nextExpandState && rowNode.sticky) {
            this.scrollToStickyNode(rowNode);
        }

        rowNode.setExpanded(nextExpandState, e);
    }

    private scrollToStickyNode(rowNode: RowNode): void {
        const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        const scrollFeature = gridBodyCtrl.getScrollFeature();

        scrollFeature.setVerticalScrollPosition(rowNode.rowTop! - rowNode.stickyRowTop);
    }

    private isExpandable(): boolean {
        if (this.showingValueForOpenedParent) { return true; }

        const rowNode = this.displayedGroupNode;
        const reducedLeafNode = this.columnModel.isPivotMode() && rowNode.leafGroup;
        const expandableGroup = rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode;

        if (!expandableGroup) { return false; }

        // column is null for fullWidthRows
        const column = this.params.column;
        const displayingForOneColumnOnly = column != null && typeof column.getColDef().showRowGroup === 'string';

        if (displayingForOneColumnOnly) {
            const showing = this.isShowRowGroupForThisRow();
            return showing;
        }

        return true;
    }

    private showExpandAndContractIcons(): void {
        const { params, displayedGroupNode: displayedGroup, columnModel } = this;
        const { node } = params;

        const isExpandable = this.isExpandable();

        if (isExpandable) {
            // if expandable, show one based on expand state.
            // if we were dragged down, means our parent is always expanded
            const expanded = this.showingValueForOpenedParent ? true : node.expanded;
            this.comp.setExpandedDisplayed(expanded);
            this.comp.setContractedDisplayed(!expanded);
        } else {
            // it not expandable, show neither
            this.comp.setExpandedDisplayed(false);
            this.comp.setContractedDisplayed(false);
        }

        // compensation padding for leaf nodes, so there is blank space instead of the expand icon
        const pivotMode = columnModel.isPivotMode();
        const pivotModeAndLeafGroup = pivotMode && displayedGroup.leafGroup;
        const addExpandableCss = isExpandable && !pivotModeAndLeafGroup;
        const isTotalFooterNode = node.footer && node.level === -1;

        this.comp.addOrRemoveCssClass('ag-cell-expandable', addExpandableCss);
        this.comp.addOrRemoveCssClass('ag-row-group', addExpandableCss);

        if (pivotMode) {
            this.comp.addOrRemoveCssClass('ag-pivot-leaf-group', pivotModeAndLeafGroup);
        } else if (!isTotalFooterNode) {
            this.comp.addOrRemoveCssClass('ag-row-group-leaf-indent', !addExpandableCss);
        }
    }

    private onRowNodeIsExpandableChanged(): void {
        // maybe if no children now, we should hide the expand / contract icons
        this.showExpandAndContractIcons();

        // if we have no children, this impacts the indent
        this.setIndent();

        this.refreshAriaExpanded();
    }

    private setupIndent(): void {
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        const node: RowNode = this.params.node;
        const suppressPadding = this.params.suppressPadding;

        if (!suppressPadding) {
            this.addManagedListener(node, RowNode.EVENT_UI_LEVEL_CHANGED, this.setIndent.bind(this));
            this.setIndent();
        }
    }

    private setIndent(): void {
        if (this.gridOptionsService.is('groupHideOpenParents')) { return; }

        const params = this.params;
        const rowNode: RowNode = params.node;
        // if we are only showing one group column, we don't want to be indenting based on level
        const fullWithRow = !!params.colDef;
        const treeData = this.gridOptionsWrapper.isTreeData();
        const manyDimensionThisColumn = !fullWithRow || treeData || params.colDef!.showRowGroup === true;
        const paddingCount = manyDimensionThisColumn ? rowNode.uiLevel : 0;
        const userProvidedPaddingPixelsTheDeprecatedWay = params.padding >= 0;

        if (userProvidedPaddingPixelsTheDeprecatedWay) {
            doOnce(() => console.warn('AG Grid: cellRendererParams.padding no longer works, it was deprecated in since v14.2 and removed in v26, configuring padding for groupCellRenderer should be done with Sass variables and themes. Please see the AG Grid documentation page for Themes, in particular the property $row-group-indent-size.'), 'groupCellRenderer->doDeprecatedWay');
        }

        if (this.indentClass) {
            this.comp.addOrRemoveCssClass(this.indentClass, false);
        }

        this.indentClass = 'ag-row-group-indent-' + paddingCount;
        this.comp.addOrRemoveCssClass(this.indentClass, true);
    }

    private addFullWidthRowDraggerIfNeeded(): void {
        if (!this.params.fullWidth || !this.params.rowDrag) { return; }

        const rowDragComp = new RowDragComp(() => this.params.value, this.params.node);
        this.createManagedBean(rowDragComp, this.context);

        this.eGui.insertAdjacentElement('afterbegin', rowDragComp.getGui());
    }

    private isUserWantsSelected(): boolean {
        const paramsCheckbox = this.params.checkbox;

        // if a function, we always return true as change detection can show or hide the checkbox.
        return typeof paramsCheckbox === 'function' || paramsCheckbox === true;
    }

    private addCheckboxIfNeeded(): void {
        const rowNode = this.displayedGroupNode;
        const checkboxNeeded = this.isUserWantsSelected() &&
            // footers cannot be selected
            !rowNode.footer &&
            // pinned rows cannot be selected
            !rowNode.rowPinned &&
            // details cannot be selected
            !rowNode.detail;

        if (checkboxNeeded) {
            const cbSelectionComponent = new CheckboxSelectionComponent();
            this.getContext().createBean(cbSelectionComponent);

            cbSelectionComponent.init({
                rowNode: rowNode,
                column: this.params.column,
                overrides: {
                    isVisible: this.params.checkbox,
                    callbackParams: this.params,
                    removeHidden: true,
                },
            });
            this.eCheckbox.appendChild(cbSelectionComponent.getGui());
            this.addDestroyFunc(() => this.getContext().destroyBean(cbSelectionComponent));
        }

        this.comp.setCheckboxVisible(checkboxNeeded);
    }

    private onKeyDown(event: KeyboardEvent): void {
        const enterKeyPressed = event.key === KeyCode.ENTER;

        if (!enterKeyPressed || this.params.suppressEnterExpand) { return; }

        const cellEditable = this.params.column && this.params.column.isCellEditable(this.params.node);

        if (cellEditable) { return; }

        this.onExpandOrContract(event);
    }

    private onCellDblClicked(mouseEvent: MouseEvent): void {
        if (isStopPropagationForAgGrid(mouseEvent)) { return; }

        // we want to avoid acting on double click events on the expand / contract icon,
        // as that icons already has expand / collapse functionality on it. otherwise if
        // the icon was double clicked, we would get 'click', 'click', 'dblclick' which
        // is open->close->open, however double click should be open->close only.
        const targetIsExpandIcon
            = isElementInEventPath(this.eExpanded, mouseEvent)
            || isElementInEventPath(this.eContracted, mouseEvent);

        if (!targetIsExpandIcon) {
            this.onExpandOrContract(mouseEvent);
        }
    }
}
