import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IsRowSelectable } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import {
    _getActiveDomElement,
    _getEnableDeselection,
    _getEnableSelection,
    _getEnableSelectionWithoutKeys,
    _getGroupSelectsDescendants,
    _getIsRowSelectable,
    _isRowSelection,
} from '../gridOptionsUtils';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import type { AriaAnnouncementService } from '../rendering/ariaAnnouncementService';
import type { RowCtrl, RowGui } from '../rendering/row/rowCtrl';
import { _setAriaSelected } from '../utils/aria';
import type { ChangedPath } from '../utils/changedPath';
import { CheckboxSelectionComponent } from './checkboxSelectionComponent';
import { SelectAllFeature } from './selectAllFeature';

export abstract class BaseSelectionService extends BeanStub {
    protected rowModel: IRowModel;
    private ariaAnnouncementService: AriaAnnouncementService;

    protected isRowSelectable?: IsRowSelectable;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
        this.ariaAnnouncementService = beans.ariaAnnouncementService;
    }

    public postConstruct(): void {
        this.addManagedPropertyListeners(['isRowSelectable', 'rowSelection'], () => {
            const callback = _getIsRowSelectable(this.gos);
            if (callback !== this.isRowSelectable) {
                this.isRowSelectable = callback;
                this.updateSelectable(false);
            }
        });

        this.isRowSelectable = _getIsRowSelectable(this.gos);
    }

    public createCheckboxSelectionComponent(): CheckboxSelectionComponent {
        return new CheckboxSelectionComponent();
    }

    public createSelectAllFeature(column: AgColumn): SelectAllFeature {
        return new SelectAllFeature(column);
    }

    public handleRowClick(rowNode: RowNode, mouseEvent: MouseEvent): void {
        const { gos } = this;

        // ctrlKey for windows, metaKey for Apple
        const isMultiKey = mouseEvent.ctrlKey || mouseEvent.metaKey;
        const isShiftKey = mouseEvent.shiftKey;

        const isSelected = rowNode.isSelected();

        // we do not allow selecting the group by clicking, when groupSelectChildren, as the logic to
        // handle this is broken. to observe, change the logic below and allow groups to be selected.
        // you will see the group gets selected, then all children get selected, then the grid unselects
        // the children (as the default behaviour when clicking is to unselect other rows) which results
        // in the group getting unselected (as all children are unselected). the correct thing would be
        // to change this, so that children of the selected group are not then subsequently un-selected.
        const groupSelectsChildren = _getGroupSelectsDescendants(gos);
        const rowDeselectionWithCtrl = _getEnableDeselection(gos);
        const rowClickSelection = _getEnableSelection(gos);
        if (
            // we do not allow selecting groups by clicking (as the click here expands the group), or if it's a detail row,
            // so return if it's a group row
            (groupSelectsChildren && rowNode.group) ||
            this.isRowSelectionBlocked(rowNode) ||
            // if selecting and click selection disabled, do nothing
            (!rowClickSelection && !isSelected) ||
            // if deselecting and click deselection disabled, do nothing
            (!rowDeselectionWithCtrl && isSelected)
        ) {
            return;
        }

        const multiSelectOnClick = _getEnableSelectionWithoutKeys(gos);
        const source = 'rowClicked';

        if (isSelected) {
            if (multiSelectOnClick) {
                rowNode.setSelectedParams({ newValue: false, event: mouseEvent, source });
            } else if (isMultiKey) {
                if (rowDeselectionWithCtrl) {
                    rowNode.setSelectedParams({ newValue: false, event: mouseEvent, source });
                }
            } else if (rowClickSelection) {
                // selected with no multi key, must make sure anything else is unselected
                rowNode.setSelectedParams({
                    newValue: true,
                    clearSelection: !isShiftKey,
                    rangeSelect: isShiftKey,
                    event: mouseEvent,
                    source,
                });
            }
        } else {
            const clearSelection = multiSelectOnClick ? false : !isMultiKey;
            rowNode.setSelectedParams({
                newValue: true,
                clearSelection: clearSelection,
                rangeSelect: isShiftKey,
                event: mouseEvent,
                source,
            });
        }
    }

    public onRowCtrlSelected(rowCtrl: RowCtrl, hasFocusFunc: (gui: RowGui) => void, gui?: RowGui): void {
        // Treat undefined as false, if we pass undefined down it gets treated as toggle class, rather than explicitly
        // setting the required value
        const selected = !!rowCtrl.getRowNode().isSelected();
        rowCtrl.forEachGui(gui, (gui) => {
            gui.rowComp.addOrRemoveCssClass('ag-row-selected', selected);
            _setAriaSelected(gui.element, selected);

            const hasFocus = gui.element.contains(_getActiveDomElement(this.gos));
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
        if (selected && !_getEnableDeselection(this.gos)) {
            return;
        }

        const translate = this.getLocaleTextFunc();
        const label = translate(
            selected ? 'ariaRowDeselect' : 'ariaRowSelect',
            `Press SPACE to ${selected ? 'deselect' : 'select'} this row.`
        );

        this.ariaAnnouncementService.announceValue(label, 'rowSelection');
    }

    protected dispatchSelectionChanged(source: SelectionEventSourceType): void {
        this.eventService.dispatchEvent({
            type: 'selectionChanged',
            source,
        });
    }

    private isRowSelectionBlocked(rowNode: RowNode): boolean {
        return !rowNode.selectable || !!rowNode.rowPinned || !_isRowSelection(this.gos);
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections?(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;

    public abstract setNodesSelected(params: ISetNodesSelectedParams): number;

    public abstract updateSelectable(skipLeafNodes: boolean): void;
}
