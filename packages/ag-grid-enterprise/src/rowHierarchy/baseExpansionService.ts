import type { IsGroupOpenByDefaultParams, RowCtrl, RowGroupOpenedEvent, RowNode } from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _createGlobalRowEvent, _setAriaExpanded } from 'ag-grid-community';

export abstract class BaseExpansionService extends BeanStub {
    protected abstract dispatchExpandedEvent(event: RowGroupOpenedEvent, forceSync?: boolean): void;

    public addExpandedCss(classes: string[], rowNode: RowNode): void {
        if (rowNode.isExpandable()) {
            classes.push('ag-row-group');
            classes.push(rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }
    }

    public getRowExpandedListeners(rowCtrl: RowCtrl): {
        expandedChanged: () => void;
        hasChildrenChanged: () => void;
    } {
        const { rowNode } = rowCtrl;
        const updateExpandedCss = this.updateExpandedCss.bind(this, rowCtrl, rowNode);
        return {
            expandedChanged: updateExpandedCss,
            hasChildrenChanged: updateExpandedCss,
        };
    }

    public setExpanded(rowNode: RowNode, expanded: boolean, e?: MouseEvent | KeyboardEvent, forceSync?: boolean): void {
        if (rowNode.expanded === expanded) {
            return;
        }

        rowNode._expanded = expanded;

        rowNode.dispatchRowEvent('expandedChanged');

        const event = { ..._createGlobalRowEvent(rowNode, this.gos, 'rowGroupOpened'), expanded, event: e || null };

        this.dispatchExpandedEvent(event, forceSync);
    }

    public defaultExpanded(rowNode: RowNode): boolean {
        const beans = this.beans;
        const gos = beans.gos;
        const level = rowNode.level ?? 0;
        // see AG-11476 isGroupOpenByDefault callback doesn't apply to master/detail grid
        // We call isGroupOpenByDefault only for group nodes and not for master/detail leafs
        const isGroupOpenByDefault = rowNode.group && gos.get('isGroupOpenByDefault');
        if (!isGroupOpenByDefault) {
            const groupDefaultExpanded = gos.get('groupDefaultExpanded');
            return groupDefaultExpanded === -1 || level < groupDefaultExpanded;
        }
        const params = _addGridCommonParams<IsGroupOpenByDefaultParams>(gos, {
            rowNode,
            field: rowNode.field!,
            key: rowNode.key!,
            level,
            rowGroupColumn: rowNode.rowGroupColumn!,
        });
        return !!isGroupOpenByDefault(params);
    }

    public isExpandable(rowNode: RowNode): boolean {
        if (rowNode.footer) {
            return false;
        }

        if (this.beans.colModel.pivotMode) {
            // master detail and leaf groups aren't expandable in pivot mode.
            return rowNode.hasChildren() && !rowNode.leafGroup;
        }
        return rowNode.hasChildren() || rowNode.master;
    }

    private updateExpandedCss(rowCtrl: RowCtrl, rowNode: RowNode): void {
        const expandable = rowNode.isExpandable();
        const expanded = rowNode.expanded == true;

        rowCtrl.forEachGui(undefined, (gui) => {
            const rowComp = gui.rowComp;
            rowComp.toggleCss('ag-row-group', expandable);
            rowComp.toggleCss('ag-row-group-expanded', expandable && expanded);
            rowComp.toggleCss('ag-row-group-contracted', expandable && !expanded);
            _setAriaExpanded(gui.element, expandable && expanded);
        });
    }

    protected dispatchStateUpdatedEvent() {
        this.eventSvc.dispatchEvent({ type: 'rowExpansionStateChanged' });
    }
}
