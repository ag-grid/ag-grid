import { _getActiveDomElement, _setAriaSelected } from 'ag-stack';

import { isColumnSelectionCol } from '../columns/columnUtils';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { CheckboxSelectionCallbackParams } from '../entities/colDef';
import type { IsRowSelectable } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import { _createGlobalRowEvent } from '../entities/rowNodeUtils';
import type { SelectionEventSourceType } from '../events';
import {
    _addGridCommonParams,
    _getCheckboxLocation,
    _getCheckboxes,
    _getEnableDeselection,
    _getEnableSelection,
    _getEnableSelectionWithoutKeys,
    _getGroupSelection,
    _getGroupSelectsDescendants,
    _getIsRowSelectable,
    _isClientSideRowModel,
    _isMultiRowSelection,
    _isRowSelection,
} from '../gridOptionsUtils';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import { _isInternalFeatureFlagEnabled } from '../internalFeatureFlags/internalFeatureFlags';
import { _isManualPinnedRow } from '../pinnedRowModel/pinnedRowUtils';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { ChangedPath } from '../utils/changedPath';
import { CheckboxSelectionComponent } from './checkboxSelectionComponent';
import { RowRangeSelectionContext } from './rowRangeSelectionContext';
import { SelectAllFeature, isCheckboxSelection } from './selectAllFeature';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseSelectionService extends BeanStub {
    protected isRowSelectable?: IsRowSelectable;
    protected selectionCtx: RowRangeSelectionContext;

    public postConstruct(): void {
        const { gos, beans } = this;
        this.selectionCtx = new RowRangeSelectionContext(beans.rowModel, beans.pinnedRowModel);

        this.addManagedPropertyListeners(['isRowSelectable', 'rowSelection'], () => {
            const callback = _getIsRowSelectable(gos);
            if (callback !== this.isRowSelectable) {
                this.isRowSelectable = callback;
                this.updateSelectable();
            }
        });

        this.isRowSelectable = _getIsRowSelectable(gos);

        const rowModel = beans.rowModel;
        this.addManagedEventListeners({
            cellValueChanged: (e) => this.updateRowSelectable(e.node as RowNode),
            rowNodeDataChanged: (e) => {
                if (!rowModel.refreshingData) {
                    this.updateRowSelectable(e.node);
                }
            },
        });
    }

    public override destroy(): void {
        super.destroy();
        this.selectionCtx.reset();
    }

    public createCheckboxSelectionComponent(): CheckboxSelectionComponent {
        return new CheckboxSelectionComponent();
    }

    public createSelectAllFeature(column: AgColumn): SelectAllFeature | undefined {
        if (isCheckboxSelection(this.beans, column)) {
            return new SelectAllFeature(column);
        }
    }

    protected isMultiSelect(): boolean {
        return _isMultiRowSelection(this.gos);
    }

    public onRowCtrlSelected(rowCtrl: RowCtrl, hasFocusFunc: () => void): void {
        const gui = rowCtrl.getGui();
        if (!gui) {
            return;
        }

        // Treat undefined as false, if we pass undefined down it gets treated as toggle class, rather than explicitly
        // setting the required value
        const selected = !!rowCtrl.rowNode.isSelected();
        gui.rowComp.toggleCss('ag-row-selected', selected);
        const element = gui.element;
        _setAriaSelected(element, selected);

        const hasFocus = element.contains(_getActiveDomElement(this.beans));
        if (hasFocus) {
            hasFocusFunc();
        }
    }

    public announceAriaRowSelection(rowNode: RowNode, column: AgColumn | undefined): void {
        if (this.isRowSelectionBlocked(rowNode)) {
            return;
        }

        const { beans } = this;
        const selected = rowNode.isSelected()!;
        const isEditing = beans.editSvc?.isEditing({ rowNode });
        if (!rowNode.selectable || isEditing || this.isSpaceKeyBlocked(rowNode, column, !selected)) {
            return;
        }

        const translate = this.getLocaleTextFunc();
        const label = translate(
            selected ? 'ariaRowDeselect' : 'ariaRowSelect',
            `Press SPACE to ${selected ? 'deselect' : 'select'} this row`
        );

        beans.ariaAnnounce?.announceValue(label, 'rowSelection');
    }

    public updateGroupsFromChildrenSelections?(
        source: SelectionEventSourceType,
        changedPath?: ChangedPath,
        event?: Event
    ): boolean;

    public abstract setNodesSelected(params: ISetNodesSelectedParams): number;

    protected abstract isSoleSelection(node: RowNode): boolean;

    protected abstract updateSelectable(changedPath?: ChangedPath): void;

    protected isRowSelectionBlocked(rowNode: RowNode): boolean {
        return !rowNode.selectable || (rowNode.rowPinned && !_isManualPinnedRow(rowNode)) || !_isRowSelection(this.gos);
    }

    public updateRowSelectable(rowNode: RowNode, suppressSelectionUpdate?: boolean): boolean {
        const pinnedSibling = rowNode.pinnedSibling;
        const selectable =
            rowNode.rowPinned && pinnedSibling
                ? // If row node is pinned sibling, copy selectable status over from sibling row node
                  pinnedSibling.selectable
                : // otherwise calculate selectable state directly
                  (this.isRowSelectable?.(rowNode) ?? true);

        this.setRowSelectable(rowNode, selectable, suppressSelectionUpdate);
        return selectable;
    }

    protected setRowSelectable(rowNode: RowNode, newVal: boolean, suppressSelectionUpdate?: boolean): void {
        if (rowNode.selectable !== newVal) {
            rowNode.selectable = newVal;
            rowNode.dispatchRowEvent('selectableChanged');

            if (suppressSelectionUpdate) {
                return;
            }

            const isGroupSelectsChildren = _getGroupSelectsDescendants(this.gos);
            if (isGroupSelectsChildren) {
                const selected = this.calculateSelectedFromChildren(rowNode);
                this.setNodesSelected({ nodes: [rowNode], newValue: selected ?? false, source: 'selectableChanged' });
                return;
            }

            // if row is selected but shouldn't be selectable, then deselect.
            if (rowNode.isSelected() && !rowNode.selectable) {
                this.setNodesSelected({ nodes: [rowNode], newValue: false, source: 'selectableChanged' });
            }
        }
    }

    protected calculateSelectedFromChildren(rowNode: RowNode): boolean | undefined | null {
        let atLeastOneSelected = false;
        let atLeastOneDeSelected = false;

        const children = rowNode.childrenAfterGroup;
        if (!children?.length) {
            return rowNode.selectable ? rowNode.__selected : null;
        }

        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i];

            let childState = child.isSelected();
            // non-selectable nodes must be calculated from their children, or ignored if no value results.
            if (!child.selectable) {
                const selectable = this.calculateSelectedFromChildren(child);
                if (selectable === null) {
                    continue;
                }
                childState = selectable;
            }

            switch (childState) {
                case true:
                    atLeastOneSelected = true;
                    break;
                case false:
                    atLeastOneDeSelected = true;
                    break;
                default:
                    // If any child node has an indeterminate selection state, then its parent must also have an indeterminate state
                    // regardless of the state of the other children, so we can return early here
                    return undefined;
            }
        }

        if (atLeastOneSelected && atLeastOneDeSelected) {
            return undefined;
        }

        if (atLeastOneSelected) {
            return true;
        }

        if (atLeastOneDeSelected) {
            return false;
        }

        if (!rowNode.selectable) {
            return null;
        }

        return rowNode.__selected;
    }

    public selectRowNode(
        rowNode: RowNode,
        newValue?: boolean,
        e?: Event,
        source: SelectionEventSourceType = 'api'
    ): boolean {
        if (newValue && rowNode.destroyed) {
            return false; // cannot select destroyed nodes
        }

        // we only check selectable when newValue=true (ie selecting) to allow unselecting values,
        // as selectable is dynamic, need a way to unselect rows when selectable becomes false.
        const selectionNotAllowed = !rowNode.selectable && newValue;
        const selectionNotChanged = rowNode.__selected === newValue;

        if (selectionNotAllowed || selectionNotChanged) {
            return false;
        }

        rowNode.__selected = newValue;

        rowNode.dispatchRowEvent('rowSelected');

        // in case of root node, sibling may have service while this row may not
        const sibling = rowNode.sibling;
        if (sibling && sibling.footer && sibling.__localEventService) {
            sibling.dispatchRowEvent('rowSelected');
        }

        const pinnedSibling = rowNode.pinnedSibling;
        if (pinnedSibling?.rowPinned && pinnedSibling.__localEventService) {
            pinnedSibling.dispatchRowEvent('rowSelected');
        }

        this.eventSvc.dispatchEvent({
            ..._createGlobalRowEvent(rowNode, this.gos, 'rowSelected'),
            event: e || null,
            source,
        });

        return true;
    }

    public isCellCheckboxSelection(column: AgColumn, rowNode: IRowNode): boolean {
        const so = this.gos.get('rowSelection');

        if (so && typeof so !== 'string') {
            const checkbox = isColumnSelectionCol(column) && _getCheckboxes(so);
            return column.isColumnFunc(rowNode, checkbox);
        } else {
            return column.isColumnFunc(rowNode, column.colDef.checkboxSelection);
        }
    }

    protected inferNodeSelections(
        node: RowNode,
        shiftKey: boolean,
        metaKey: boolean,
        source: SelectionEventSourceType,
        column: AgColumn | undefined
    ): null | NodeSelection {
        const { gos, selectionCtx } = this;
        const currentSelection = node.isSelected();
        const groupSelectsDescendants = _getGroupSelectsDescendants(gos);
        const enableClickSelection = _getEnableSelection(gos);
        const enableDeselection = _getEnableDeselection(gos);
        const enableClickToggle = _isInternalFeatureFlagEnabled(this.beans, 'clickToggleSelection');
        const isMultiSelect = this.isMultiSelect();
        const isRowClicked = source === 'rowClicked';
        const isClickGated = isRowClicked || this.isSpaceKeyClickGated(source, node, column);

        if (isClickGated && !(enableClickSelection || enableDeselection)) {
            return null;
        }

        // whether `enableClickSelection` forbids moving the node to `newValue`
        const isBlockedByClickSelection = (newValue: boolean) =>
            isClickGated && (newValue ? !enableClickSelection : !enableDeselection);

        if (shiftKey && metaKey && isMultiSelect) {
            // SHIFT+CTRL or SHIFT+CMD is used for bulk deselection, except where the selection root
            // is still selected, in which case we default to normal bulk selection behaviour
            const root = selectionCtx.getRoot();
            if (!root) {
                // do nothing if there's no selection root
                return null;
            } else if (!root.isSelected()) {
                // range deselection mode
                const partition = selectionCtx.extend(node, groupSelectsDescendants);
                return {
                    select: [],
                    deselect: partition.keep,
                    reset: false,
                };
            } else {
                // default to range selection
                const partition = selectionCtx.isInRange(node)
                    ? selectionCtx.truncate(node)
                    : selectionCtx.extend(node, groupSelectsDescendants);
                return {
                    deselect: partition.discard,
                    select: partition.keep,
                    reset: false,
                };
            }
        } else if (shiftKey && isMultiSelect) {
            // SHIFT is used for bulk selection

            // When select-all is active either via UI or API, if there's
            // no actual selection root, we fallback to the first row node (if available)
            const fallback = selectionCtx.selectAll ? this.beans.rowModel.getRow(0) : undefined;
            const root = selectionCtx.getRoot(fallback);

            const partition = selectionCtx.isInRange(node)
                ? selectionCtx.truncate(node)
                : selectionCtx.extend(node, groupSelectsDescendants);
            return {
                select: partition.keep,
                deselect: partition.discard,
                reset: selectionCtx.selectAll || !!(root && !root.isSelected()),
            };
        } else if (metaKey) {
            // CTRL is used for deselection of a single node or adding a single node to selection
            const newValue = !currentSelection;
            if (isBlockedByClickSelection(newValue)) {
                return null;
            }

            selectionCtx.setRoot(node);

            return {
                node,
                newValue,
                clearSelection: !isRowClicked && !isMultiSelect,
            };
        } else {
            // Otherwise we just do normal selection of a single node
            selectionCtx.setRoot(node);
            const enableSelectionWithoutKeys = _getEnableSelectionWithoutKeys(gos);
            const groupSelectsFiltered = _getGroupSelection(gos) === 'filteredDescendants';
            const shouldClear = isRowClicked && (!enableSelectionWithoutKeys || !enableClickSelection);

            // Indeterminate states need to be handled differently if `groupSelects: 'filteredDescendants'` in CSRM...
            if (groupSelectsFiltered && currentSelection === undefined && _isClientSideRowModel(gos)) {
                // ...Specifically:
                // - when only nodes that pass the filter are selected, clicking the group node should toggle everything _off_ instead of _on_
                // - when some nodes that don't pass the filter are selected, clicking the group node should toggle everything _on_ instead of _off_
                // The necessity of this check is signalled to the caller via the `checkFilteredNodes` flag because this class is shared with SSRM selection
                // so we don't want to add too much CSRM-only code here.
                return {
                    node,
                    newValue: false,
                    checkFilteredNodes: true,
                    clearSelection: !isMultiSelect || shouldClear,
                };
            }

            if (isRowClicked) {
                // isSoleSelection matches by identity, so a pinned clone must resolve to its source row
                const newValue = currentSelection
                    ? !(enableSelectionWithoutKeys || (enableClickToggle && this.isSoleSelection(node.primaryRow)))
                    : enableClickSelection;

                // only transistion to same state if we also want to clear other selected nodes
                const wouldStateBeUnchanged = newValue === currentSelection && !shouldClear;

                if (wouldStateBeUnchanged || isBlockedByClickSelection(newValue)) {
                    return null;
                }

                return {
                    node,
                    newValue,
                    clearSelection: !isMultiSelect || shouldClear,
                    keepDescendants: node.group && groupSelectsDescendants,
                };
            }

            const newValue = !currentSelection;
            if (isBlockedByClickSelection(newValue)) {
                return null;
            }

            return {
                node,
                newValue,
                clearSelection: !isMultiSelect || shouldClear,
            };
        }
    }

    /** Whether Space is refused because `enableClickSelection` forbids moving the row to `newValue`. */
    private isSpaceKeyBlocked(rowNode: RowNode, column: AgColumn | undefined, newValue: boolean): boolean {
        const { gos } = this;
        return (
            this.isSpaceKeyClickGated('spaceKey', rowNode, column) &&
            (newValue ? !_getEnableSelection(gos) : !_getEnableDeselection(gos))
        );
    }

    /** Whether Space must obey `enableClickSelection`. On a selection checkbox cell it acts like clicking the checkbox. */
    private isSpaceKeyClickGated(
        source: SelectionEventSourceType,
        rowNode: RowNode,
        column: AgColumn | undefined
    ): boolean {
        return (
            source === 'spaceKey' &&
            _isInternalFeatureFlagEnabled(this.beans, 'spaceKeyFollowsClickSelection') &&
            !this.isSelectionCheckboxShown(rowNode, column)
        );
    }

    /** Whether `rowNode` shows a selection checkbox in `column`, or in its full-width row when there is no `column`. */
    private isSelectionCheckboxShown(rowNode: RowNode, column: AgColumn | undefined): boolean {
        if (column && this.isCellCheckboxSelection(column, rowNode)) {
            return true;
        }

        // mirrors `GroupCellRendererCtrl.addCheckbox`
        const rowSelection = this.gos.get('rowSelection');
        if (typeof rowSelection !== 'object' || _getCheckboxLocation(rowSelection) !== 'autoGroupColumn') {
            return false;
        }

        const checkboxes = _getCheckboxes(rowSelection);
        if (column) {
            return column.colDef.showRowGroup != null && column.isColumnFunc(rowNode, checkboxes);
        }
        if (!rowNode.group) {
            return false;
        }
        if (typeof checkboxes !== 'function') {
            return checkboxes;
        }
        // full-width rows have no column, as in `CheckboxSelectionComponent`
        const params = _addGridCommonParams(this.gos, { node: rowNode as IRowNode, data: rowNode.data });
        return checkboxes(params as CheckboxSelectionCallbackParams);
    }
}

interface SingleNodeSelection {
    node: RowNode;
    newValue: boolean;
    clearSelection: boolean;
    keepDescendants?: boolean;
    checkFilteredNodes?: boolean;
}

interface MultiNodeSelection {
    select: readonly RowNode[];
    deselect: readonly RowNode[];
    reset: boolean;
}
type NodeSelection = SingleNodeSelection | MultiNodeSelection;
