import { _setAriaExpanded } from 'ag-stack';

import type {
    IsGroupOpenByDefaultParams,
    IsMasterOpenByDefaultParams,
    RowCtrl,
    RowGroupOpenedEvent,
    RowNode,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _createGlobalRowEvent } from 'ag-grid-community';

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

        // Collapsing a sticky row: scroll so the row lands at the pixel it occupied
        // while sticky, otherwise the viewport keeps its old scrollTop and the user
        // loses sight of the group they just collapsed.
        if (!expanded && rowNode.sticky) {
            this.beans.ctrlsSvc.getScrollFeature().setVerticalScrollPosition(rowNode.rowTop! - rowNode.stickyRowTop);
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

        // see AG-11476. Master rows that are not groups (e.g. master/detail leaf rows) use the
        // master-specific callbacks, falling back to the group settings for backwards compatibility.
        if (rowNode.master && !rowNode.group) {
            const isMasterOpenByDefault = gos.get('isMasterOpenByDefault');
            if (isMasterOpenByDefault) {
                const params = _addGridCommonParams<IsMasterOpenByDefaultParams>(gos, {
                    rowNode,
                    data: rowNode.data,
                    level,
                });
                return !!isMasterOpenByDefault(params);
            }
            const masterDefaultExpanded = gos.get('masterDefaultExpanded') ?? gos.get('groupDefaultExpanded');
            return masterDefaultExpanded === -1 || level < masterDefaultExpanded;
        }

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
        return this.checkExpandable(rowNode, rowNode.hasChildren());
    }

    /** Shared expandability rule; callers pass hasChildren() for "expandable now" or the group flag for "could ever expand". */
    protected checkExpandable(rowNode: RowNode, hasChildren: boolean): boolean {
        if (rowNode.footer) {
            return false;
        }
        if (this.beans.colModel.pivotMode) {
            return hasChildren && !rowNode.leafGroup;
        }
        return hasChildren || rowNode.master;
    }

    private updateExpandedCss(rowCtrl: RowCtrl, rowNode: RowNode): void {
        const expandable = rowNode.isExpandable();
        const expanded = rowNode.expanded == true;
        const gui = rowCtrl.getGui();

        if (!gui) {
            return;
        }

        const rowComp = gui.rowComp;
        rowComp.toggleCss('ag-row-group', expandable);
        rowComp.toggleCss('ag-row-group-expanded', expandable && expanded);
        rowComp.toggleCss('ag-row-group-contracted', expandable && !expanded);
        _setAriaExpanded(gui.element, expandable && expanded);
    }

    protected dispatchStateUpdatedEvent() {
        this.eventSvc.dispatchEvent({ type: 'rowExpansionStateChanged' });
    }
}
