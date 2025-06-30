import { isColumnSelectionCol } from '../columns/columnUtils';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { IsRowSelectable } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import { _createGlobalRowEvent } from '../entities/rowNodeUtils';
import type { SelectionEventSourceType } from '../events';
import {
    _getActiveDomElement,
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
import { _isManualPinnedRow } from '../pinnedRowModel/pinnedRowUtils';
import type { RowCtrl, RowGui } from '../rendering/row/rowCtrl';
import { _setAriaSelected } from '../utils/aria';
import type { ChangedPath } from '../utils/changedPath';
import { CheckboxSelectionComponent } from './checkboxSelectionComponent';
import { RowRangeSelectionContext } from './rowRangeSelectionContext';
import { SelectAllFeature, isCheckboxSelection } from './selectAllFeature';

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

        this.addManagedEventListeners({
            cellValueChanged: (e) => this.updateRowSelectable(e.node as RowNode),
            rowNodeDataChanged: (e) => this.updateRowSelectable(e.node),
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

    public onRowCtrlSelected(rowCtrl: RowCtrl, hasFocusFunc: (gui: RowGui) => void, gui?: RowGui): void {
        // Treat undefined as false, if we pass undefined down it gets treated as toggle class, rather than explicitly
        // setting the required value
        const selected = !!rowCtrl.rowNode.isSelected();
        rowCtrl.forEachGui(gui, (gui) => {
            gui.rowComp.toggleCss('ag-row-selected', selected);
            const element = gui.element;
            _setAriaSelected(element, selected);

            const hasFocus = element.contains(_getActiveDomElement(this.beans));
            if (hasFocus) {
                hasFocusFunc(gui);
            }
        });
    }

    public announceAriaRowSelection(rowNode: RowNode): void {
        if (this.isRowSelectionBlocked(rowNode)) {
            return;
        }

        const selected = rowNode.isSelected()!;
        if (!rowNode.selectable) {
            return;
        }

        const translate = this.getLocaleTextFunc();
        const label = translate(
            selected ? 'ariaRowDeselect' : 'ariaRowSelect',
            `Press SPACE to ${selected ? 'deselect' : 'select'} this row`
        );

        this.beans.ariaAnnounce?.announceValue(label, 'rowSelection');
    }

    public updateGroupsFromChildrenSelections?(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;

    public abstract setNodesSelected(params: ISetNodesSelectedParams): number;

    protected abstract updateSelectable(changedPath?: ChangedPath): void;

    protected isRowSelectionBlocked(rowNode: RowNode): boolean {
        return !rowNode.selectable || (rowNode.rowPinned && !_isManualPinnedRow(rowNode)) || !_isRowSelection(this.gos);
    }

    public updateRowSelectable(rowNode: RowNode, suppressSelectionUpdate?: boolean): boolean {
        const selectable =
            rowNode.rowPinned && rowNode.pinnedSibling
                ? // If row node is pinned sibling, copy selectable status over from sibling row node
                  rowNode.pinnedSibling.selectable
                : // otherwise calculate selectable state directly
                  this.isRowSelectable?.(rowNode) ?? true;

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

        if (!rowNode.childrenAfterGroup?.length) {
            return rowNode.selectable ? rowNode.__selected : null;
        }

        for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
            const child = rowNode.childrenAfterGroup[i];

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
        if (pinnedSibling && pinnedSibling.rowPinned && pinnedSibling.__localEventService) {
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
        source: SelectionEventSourceType
    ): null | NodeSelection {
        const { gos, selectionCtx } = this;
        const currentSelection = node.isSelected();
        const groupSelectsDescendants = _getGroupSelectsDescendants(gos);
        const enableClickSelection = _getEnableSelection(gos);
        const enableDeselection = _getEnableDeselection(gos);
        const isMultiSelect = this.isMultiSelect();
        const isRowClicked = source === 'rowClicked';

        if (isRowClicked && !(enableClickSelection || enableDeselection)) return null;

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
            if (isRowClicked) {
                const newValue = !currentSelection;

                const selectingWhenDisabled = newValue && !enableClickSelection;
                const deselectingWhenDisabled = !newValue && !enableDeselection;

                if (selectingWhenDisabled || deselectingWhenDisabled) return null;

                selectionCtx.setRoot(node);

                return {
                    node,
                    newValue,
                    clearSelection: false,
                };
            }

            selectionCtx.setRoot(node);

            return {
                node,
                newValue: !currentSelection,
                clearSelection: !isMultiSelect,
            };
        } else {
            // Otherwise we just do normal selection of a single node
            selectionCtx.setRoot(node);
            const enableSelectionWithoutKeys = _getEnableSelectionWithoutKeys(gos);
            const groupSelectsFiltered = _getGroupSelection(gos) === 'filteredDescendants';
            const shouldClear = isRowClicked && (!enableSelectionWithoutKeys || !enableClickSelection);

            // Indeterminate states need to be handled differently if `groupSelects: 'filteredDescendants'` in CSRM.
            // Specifically, clicking should toggle them _off_ instead of _on_
            if (groupSelectsFiltered && currentSelection === undefined && _isClientSideRowModel(gos)) {
                return {
                    node,
                    newValue: false,
                    clearSelection: !isMultiSelect || shouldClear,
                };
            }

            if (isRowClicked) {
                const newValue = currentSelection ? !enableSelectionWithoutKeys : enableClickSelection;

                // if selecting, only proceed if not disabled by grid options
                const selectingWhenDisabled = newValue && !enableClickSelection;
                // if deselecting, only proceed if not disabled by grid options
                const deselectingWhenDisabled = !newValue && !enableDeselection;
                // only transistion to same state if we also want to clear other selected nodes
                const wouldStateBeUnchanged = newValue === currentSelection && !shouldClear;

                if (wouldStateBeUnchanged || selectingWhenDisabled || deselectingWhenDisabled) return null;

                return {
                    node,
                    newValue,
                    clearSelection: !isMultiSelect || shouldClear,
                    keepDescendants: node.group && groupSelectsDescendants,
                };
            }

            return {
                node,
                newValue: !currentSelection,
                clearSelection: !isMultiSelect || shouldClear,
            };
        }
    }
}

interface SingleNodeSelection {
    node: RowNode;
    newValue: boolean;
    clearSelection: boolean;
    keepDescendants?: boolean;
}

interface MultiNodeSelection {
    select: readonly RowNode[];
    deselect: readonly RowNode[];
    reset: boolean;
}
type NodeSelection = SingleNodeSelection | MultiNodeSelection;
