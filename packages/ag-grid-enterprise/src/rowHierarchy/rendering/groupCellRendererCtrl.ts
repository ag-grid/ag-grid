import type {
    AgColumn,
    CheckboxSelectionComponent,
    GroupCellRendererParams,
    IGroupCellRenderer,
    IGroupCellRendererCtrl,
    RowNode,
    UserCompDetails,
} from 'ag-grid-community';
import {
    BeanStub,
    KeyCode,
    _createIconNoSpan,
    _getCellRendererDetails,
    _getCheckboxLocation,
    _getCheckboxes,
    _getInnerCellRendererDetails,
    _isElementInEventPath,
    _isRowSelection,
    _isStopPropagationForAgGrid,
    _removeAriaExpanded,
    _setAriaExpanded,
    _stopPropagationForAgGrid,
} from 'ag-grid-community';

import { _isHiddenParent } from '../rowHierarchyUtils';

export class GroupCellRendererCtrl extends BeanStub implements IGroupCellRendererCtrl {
    private params: GroupCellRendererParams;

    private node: RowNode; // the node this cell is rendering for
    private displayedNode: RowNode; // the node to display instead of this.node for [groupHideOpenParents] and [showOpenedGroup]

    private eGui: HTMLElement;
    private eExpanded: HTMLElement;
    private eContracted: HTMLElement;
    private eCheckbox: HTMLElement;

    // keep reference to this, so we can remove again when indent changes
    private indentClass: string | null = null;

    private comp: IGroupCellRenderer;
    private compClass: any;
    private cbComp?: CheckboxSelectionComponent;

    public init(
        comp: IGroupCellRenderer,
        eGui: HTMLElement,
        eCheckbox: HTMLElement,
        eExpanded: HTMLElement,
        eContracted: HTMLElement,
        compClass: any,
        params: GroupCellRendererParams
    ): void {
        this.params = params;
        this.eGui = eGui;
        this.eCheckbox = eCheckbox;
        this.eExpanded = eExpanded;
        this.eContracted = eContracted;
        this.comp = comp;
        this.compClass = compClass;

        const { node, column } = params;

        this.node = node as RowNode;
        this.displayedNode = node as RowNode;

        // check full width row pinned left/right cell should be skipped
        const embeddedRowMismatch = this.isEmbeddedRowMismatch();
        if (embeddedRowMismatch) {
            return;
        }

        if (node.footer) {
            this.initFooterCell();
            return;
        }

        // if no column, this is a full width cell
        if (!column) {
            this.initFullWidthCell();
            return;
        }

        this.displayedNode =
            (this.beans.showRowGroupColValueSvc?.getDisplayedNode(node, column as AgColumn) as RowNode) ?? this.node;
        this.setupExpand();
        this.setupCheckbox();
        this.addGroupValue();
        this.setupIndent();
    }

    private initFooterCell(): void {
        const { node } = this.params;
        this.addGroupValue();
        this.setupIndent();

        const isGrandTotal = node.level === -1;
        if (!isGrandTotal) {
            this.comp.toggleCss('ag-row-group-leaf-indent', true);
        }
    }

    private initFullWidthCell(): void {
        const setupDragger = () => {
            const { rowDragSvc } = this.beans;
            if (!this.params.rowDrag || !rowDragSvc) {
                return;
            }

            const rowDragComp = rowDragSvc.createRowDragComp(() => this.params.value, this.params.node as RowNode);
            this.createManagedBean(rowDragComp);

            this.eGui.insertAdjacentElement('afterbegin', rowDragComp.getGui());
        };

        this.setupExpand();
        setupDragger();
        this.setupCheckbox();
        this.addGroupValue();
        this.setupIndent();
    }

    /**
     * Returns an aria "role" to place on full width group cells, or the parent wrapper.
     * @returns the aria role to place on the parent wrapper
     */
    public getCellAriaRole(): string {
        const colDefAriaRole = this.params.colDef?.cellAriaRole;
        const columnColDefAriaRole = this.params.column?.getColDef().cellAriaRole;
        return colDefAriaRole || columnColDefAriaRole || 'gridcell';
    }

    /**
     * Determines if this cell should be rendered, as when using embeddedFullWidthRows
     * only one group cell should be rendered.
     *
     * if [enableRTL] all but pinned right cells should be skipped if available
     * otherwise prioritise pinned left cell if available
     * otherwise center viewport.
     *
     * @returns whether the cell should be skipped due to embedded full width rows
     */
    private isEmbeddedRowMismatch(): boolean {
        if (!this.params.fullWidth || !this.gos.get('embedFullWidthRows')) {
            return false;
        }

        const { visibleCols } = this.beans;

        const pinnedLeftCell = this.params.pinned === 'left';
        const pinnedRightCell = this.params.pinned === 'right';
        const bodyCell = !pinnedLeftCell && !pinnedRightCell;

        if (this.gos.get('enableRtl')) {
            if (visibleCols.isPinningLeft()) {
                return !pinnedRightCell;
            }
            return !bodyCell;
        }

        if (visibleCols.isPinningLeft()) {
            return !pinnedLeftCell;
        }

        return !bodyCell;
    }

    /**
     * Displays the group value for the displayed node
     */
    private addGroupValue(): void {
        const {
            params: { value, valueFormatted },
        } = this;
        // if no formatted value and node key is '', then we replace this group with (Blanks)
        // this does not propagate down for [showOpenedGroup]
        const innerCompDetails = this.getInnerCompDetails();
        this.comp.setInnerRenderer(innerCompDetails, valueFormatted ?? value ?? null);
    }

    /**
     * Sets up expand/collapse:
     * Chevron
     * Aria-expanded
     * Child count
     */
    private setupExpand(): void {
        const { colModel } = this.beans;
        const { eGridCell, column, suppressDoubleClickExpand } = this.params;

        // Inserts the expand/collapse icons into the dom
        const addIconToDom = (iconName: 'groupExpanded' | 'groupContracted', element: HTMLElement) => {
            const icon = _createIconNoSpan(iconName, this.beans, null);
            if (icon) {
                element.appendChild(icon);
                this.addDestroyFunc(() => element.removeChild(icon));
            }
        };

        addIconToDom('groupExpanded', this.eExpanded);
        addIconToDom('groupContracted', this.eContracted);

        const comp = this.comp;
        const onExpandedChanged = () => {
            const expandable = this.isExpandable();
            if (!expandable) {
                return;
            }

            const expanded = this.displayedNode.expanded;
            comp.setExpandedDisplayed(expanded);
            comp.setContractedDisplayed(!expanded);

            _setAriaExpanded(eGridCell, !!this.displayedNode.expanded);
        };

        const onExpandableChanged = () => {
            const expandable = this.isExpandable();

            comp.toggleCss('ag-cell-expandable', expandable);
            comp.toggleCss('ag-row-group', expandable);

            // indent non-expandable cells so they correctly indent with expandable cells
            const pivotModeAndLeaf = !expandable && colModel.isPivotMode();
            comp.toggleCss('ag-pivot-leaf-group', pivotModeAndLeaf);
            const normalModeNotTotalFooter =
                !colModel.isPivotMode() && (!this.displayedNode.footer || this.displayedNode.level !== -1);
            comp.toggleCss('ag-row-group-leaf-indent', !expandable && normalModeNotTotalFooter);

            // update the child count component
            const count = this.getChildCount();
            const countString = count > 0 ? `(${count})` : ``;
            comp.setChildCount(countString);

            // configure chevrons/aria
            if (!expandable) {
                comp.setExpandedDisplayed(false);
                comp.setContractedDisplayed(false);
                _removeAriaExpanded(eGridCell);
            } else {
                onExpandedChanged();
            }
        };

        const setupListeners = () => {
            // Cell double clicked
            const isDoubleClickEdit = column?.isCellEditable(this.displayedNode) && this.gos.get('enableGroupEdit');
            if (!isDoubleClickEdit && !suppressDoubleClickExpand) {
                this.addManagedListeners(eGridCell, { dblclick: this.onCellDblClicked.bind(this) });
            }
            // Icons clicked
            this.addManagedListeners(this.eExpanded, { click: this.onExpandClicked.bind(this) });
            this.addManagedListeners(this.eContracted, { click: this.onExpandClicked.bind(this) });
            // keypress [Enter]
            this.addManagedListeners(eGridCell, { keydown: this.onKeyDown.bind(this) });

            this.addManagedListeners(this.displayedNode, {
                // Expandable state has changed
                allChildrenCountChanged: onExpandableChanged,
                masterChanged: onExpandableChanged,
                groupChanged: onExpandableChanged,
                hasChildrenChanged: onExpandableChanged,

                // Node expanded changed
                expandedChanged: onExpandedChanged,
            });
        };

        setupListeners();
        onExpandableChanged();
    }

    /**
     * Return the inner renderer details for the cell
     *
     * Prioritises:
     * 1. Group row renderer for group rows
     * 2. agFindCellRenderer for find results in group rows
     * 3. Provided innerRenderer (i.e, cellRendererParams.innerRenderer)
     * 4. Cell renderer of the grouped column
     * 5. Inner renderer of the grouped column
     * 6. agFindCellRenderer for find results
     */
    private getInnerCompDetails(): UserCompDetails | undefined {
        const { userCompFactory, findSvc } = this.beans;
        const params = this.params;

        // full width rows do not inherit the child group column renderer
        if (params.fullWidth) {
            const groupRowRendererParams = this.gos.get('groupRowRendererParams');
            const groupRowInnerCompDetails = _getInnerCellRendererDetails(
                userCompFactory,
                groupRowRendererParams,
                params
            );
            if (groupRowInnerCompDetails) {
                return groupRowInnerCompDetails;
            }
            // if no group row inner renderer, use find renderer if match
            if (findSvc?.isMatch(params.node, null)) {
                return _getInnerCellRendererDetails(
                    userCompFactory,
                    { ...groupRowRendererParams, innerRenderer: 'agFindCellRenderer' },
                    params
                );
            }
            return undefined;
        }

        const isGroupRowRenderer = (details: UserCompDetails | undefined) =>
            details && details.componentClass == this.compClass;

        /**
         * Prioritise user cell renderer
         */
        const innerCompDetails = _getInnerCellRendererDetails<GroupCellRendererParams>(userCompFactory, params, params);
        if (innerCompDetails && !isGroupRowRenderer(innerCompDetails)) {
            return innerCompDetails;
        }

        /**
         * Use the provided cellRenderer of the grouped column
         */
        const {
            displayedNode: { rowGroupColumn },
        } = this;
        const relatedColDef = rowGroupColumn?.colDef;
        const isShowingThisCol = rowGroupColumn && params.column?.isRowGroupDisplayed(rowGroupColumn.getId());
        if (relatedColDef && isShowingThisCol) {
            const relatedCompDetails = _getCellRendererDetails(userCompFactory, relatedColDef, params);
            if (relatedCompDetails) {
                // the column that was grouped might have been using `agGroupCellRenderer`, e.g. for master-detail chevrons, if so,
                // try to use inner renderer instead
                if (isGroupRowRenderer(relatedCompDetails)) {
                    if (relatedColDef?.cellRendererParams?.innerRenderer) {
                        return _getInnerCellRendererDetails<GroupCellRendererParams>(
                            userCompFactory,
                            relatedColDef.cellRendererParams,
                            params
                        );
                    }
                } else {
                    return relatedCompDetails;
                }
            }
        }

        /**
         * Use the find renderer
         */
        if (findSvc?.isMatch(params.node, params.column!)) {
            return _getCellRendererDetails(
                userCompFactory,
                { ...(relatedColDef ?? params.colDef), cellRenderer: 'agFindCellRenderer' },
                params
            );
        }
    }

    /**
     * Get the allChildCount of a given node
     * @param node the node to return the count for
     * @returns 0 if the count should not be displayed, otherwise the count
     */
    private getChildCount(): number {
        const { column, suppressCount } = this.params;
        if (suppressCount) {
            return 0;
        }

        const { allChildrenCount, rowGroupColumn } = this.displayedNode;

        // if this is the correct cell for displaying the row group value
        const isDisplayingRowGroupCell =
            (allChildrenCount ?? 0) > 0 &&
            (!rowGroupColumn || !column || column?.isRowGroupDisplayed(rowGroupColumn.getId()));
        if (!isDisplayingRowGroupCell) {
            return 0;
        }

        // if [showOpenedGroup] and not [groupHideOpenParents], then no child count
        const isRepresentingOtherNode = this.gos.get('showOpenedGroup') && this.displayedNode !== this.node;
        if (isRepresentingOtherNode && !_isHiddenParent(this.node, this.displayedNode, this.gos)) {
            return 0;
        }

        return allChildrenCount ?? 0;
    }

    /**
     * Checks whether the current cell is expandable, either due to [groupHideOpenParent] control or otherwise.
     * @returns whether this cell is expandable
     */
    private isExpandable(): boolean {
        const { node, column, colDef } = this.params;

        // checking the node expandable checks pivot leafGroup, footer etc.
        if (!this.displayedNode.isExpandable()) {
            return false;
        }

        // Manually pinned group rows cannot be expanded
        if (node.rowPinned) {
            return false;
        }

        const isFullWidth = !column;
        if (isFullWidth) {
            return true;
        }

        const hasChildren = (node as RowNode).hasChildren();
        if (hasChildren && colDef) {
            const { showRowGroup } = colDef;
            // if col has grouping/tree data children then only showRowGroup cols are expandable
            if (!showRowGroup) {
                return false;
            }

            // if single auto col, this is the correct col for displaying chevron
            if (showRowGroup === true) {
                return true;
            }
        }

        // if not showing adjusted node for [groupHideOpenParents]
        if (node === this.displayedNode) {
            if (node.rowGroupColumn) {
                const showingThisRowGroup = column?.isRowGroupDisplayed(node.rowGroupColumn.getId());
                if (showingThisRowGroup) {
                    return true;
                }
            }

            if (node.master) {
                // only show master on custom col or single group col
                return colDef?.showRowGroup === true || colDef?.showRowGroup == null;
            }

            return false;
        }

        // if showing for a hidden parent, we show expand/contract
        return _isHiddenParent(this.node, this.displayedNode, this.gos);
    }

    /**
     * For full width group cells & single group column, indents child groups based on uiLevel
     */
    private setupIndent(): void {
        const { suppressPadding, node, colDef } = this.params;
        if (suppressPadding) {
            return;
        }

        const setIndent = () => {
            let level = 0;
            // if multiple auto column, no indent.
            if (colDef && colDef.showRowGroup !== true) {
                level = 0;
            } else {
                level = node.uiLevel;
            }

            const newIndentClass = 'ag-row-group-indent-' + level;
            if (newIndentClass === this.indentClass) {
                return;
            }

            // if indent has already been set, remove it.
            if (this.indentClass) {
                this.comp.toggleCss(this.indentClass, false);
            }

            this.indentClass = newIndentClass;
            this.comp.toggleCss(newIndentClass, true);
            this.eGui.style.setProperty('--ag-indentation-level', String(level));
        };

        this.addManagedListeners(node, { uiLevelChanged: setIndent.bind(this) });
        setIndent();
    }

    /**
     * Selection checkboxes
     */
    private setupCheckbox(): void {
        const { node } = this.params;

        const isRowSelectable = !node.footer && !node.rowPinned && !node.detail;
        if (!isRowSelectable) {
            return;
        }

        this.addManagedPropertyListener('rowSelection', ({ currentValue, previousValue }) => {
            const curr = typeof currentValue === 'object' ? currentValue : undefined;
            const prev = typeof previousValue === 'object' ? previousValue : undefined;

            if (curr?.checkboxLocation !== prev?.checkboxLocation) {
                this.destroyCheckbox();
                this.addCheckbox();
            }
        });
        this.addCheckbox();
    }

    private addCheckbox(): void {
        const { selectionSvc } = this.beans;
        if (!selectionSvc || !_isRowSelection(this.gos)) {
            return;
        }

        const { node, column } = this.params;
        const rowSelection = this.gos.get('rowSelection');

        const checkboxLocation = _getCheckboxLocation(rowSelection);
        if (checkboxLocation === 'selectionColumn') {
            return;
        }

        if (checkboxLocation === 'autoGroupColumn') {
            const isGroupColumn = column?.getColDef().showRowGroup != null;
            const isFullWidthGroupRow = !column && node.group;
            const isApplicableCell = isGroupColumn || isFullWidthGroupRow;
            if (!isApplicableCell) {
                return;
            }
        }

        const checkboxes = typeof rowSelection === 'object' ? _getCheckboxes(rowSelection) : this.params.checkbox;

        const userWantsCheckboxes = typeof checkboxes === 'function' || checkboxes === true;
        if (!userWantsCheckboxes) {
            return;
        }

        // if user wants checkboxes, but this cell is wrong, add extra alignment padding
        const isMultiAutoCol = typeof column?.getColDef().showRowGroup === 'string';
        if (isMultiAutoCol && !this.isExpandable()) {
            this.comp.setCheckboxSpacing(true);
            return;
        }

        const cbSelectionComponent = selectionSvc.createCheckboxSelectionComponent();
        this.cbComp = cbSelectionComponent;
        this.createBean(cbSelectionComponent);

        cbSelectionComponent.init({
            rowNode: node as RowNode, // when groupHideOpenParents = true and group expanded, we want the checkbox to refer to leaf node state (not group node state)
            column: column as AgColumn,
            overrides: {
                isVisible: checkboxes,
                callbackParams: this.params,
                removeHidden: true,
            },
        });
        this.eCheckbox.appendChild(cbSelectionComponent.getGui());
        this.comp.setCheckboxVisible(true);
    }

    private destroyCheckbox(): void {
        this.comp.setCheckboxSpacing(false);
        this.comp.setCheckboxVisible(false);
        this.cbComp && this.eCheckbox.removeChild(this.cbComp.getGui());
        this.cbComp = this.destroyBean(this.cbComp);
    }

    /**
     * Called when the expand / contract icon is clicked.
     */
    private onExpandClicked(mouseEvent: MouseEvent): void {
        if (_isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        // so if we expand a node, it does not also get selected.
        _stopPropagationForAgGrid(mouseEvent);

        this.onExpandOrContract(mouseEvent);
    }

    /**
     * Called on cell key press - only handles 'Enter' key for expand/collapse
     */
    private onKeyDown(event: KeyboardEvent): void {
        const isEnterKey = event.key === KeyCode.ENTER;

        if (!isEnterKey || this.params.suppressEnterExpand) {
            return;
        }

        const cellEditable = this.params.column && this.params.column.isCellEditable(this.params.node);

        if (cellEditable) {
            return;
        }

        this.onExpandOrContract(event);
    }

    /**
     * Called on cell double click - only expands/collapses if the event is not on the expand / contract icon
     */
    private onCellDblClicked(mouseEvent: MouseEvent): void {
        if (_isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        // we want to avoid acting on double click events on the expand / contract icon,
        // as that icons already has expand / collapse functionality on it. otherwise if
        // the icon was double clicked, we would get 'click', 'click', 'dblclick' which
        // is open->close->open, however double click should be open->close only.
        const targetIsExpandIcon =
            _isElementInEventPath(this.eExpanded, mouseEvent) || _isElementInEventPath(this.eContracted, mouseEvent);

        if (!targetIsExpandIcon) {
            this.onExpandOrContract(mouseEvent);
        }
    }

    /**
     * Called when expand or contract is attempted, to scroll the row and update the node state
     * @param e originating event
     */
    private onExpandOrContract(e: MouseEvent | KeyboardEvent): void {
        if (!this.isExpandable()) {
            return;
        }

        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        const rowNode: RowNode = this.displayedNode;
        const nextExpandState = !rowNode.expanded;

        if (!nextExpandState && rowNode.sticky) {
            this.beans.ctrlsSvc.getScrollFeature().setVerticalScrollPosition(rowNode.rowTop! - rowNode.stickyRowTop);
        }

        rowNode.setExpanded(nextExpandState, e);
    }

    public override destroy(): void {
        super.destroy();
        // property cleanup to avoid memory leaks
        this.destroyCheckbox();
    }
}
