import type {
    BeanCollection,
    ColumnModel,
    RowCtrl,
    RowNode,
    RowNodeEventThrottle,
    RowRenderer,
} from 'ag-grid-community';
import { BeanStub, _createGlobalRowEvent, _setAriaExpanded } from 'ag-grid-community';

export abstract class BaseExpansionService extends BeanStub {
    private rowRenderer: RowRenderer;
    private rowNodeEventThrottle?: RowNodeEventThrottle;
    protected columnModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowRenderer = beans.rowRenderer;
        this.rowNodeEventThrottle = beans.rowNodeEventThrottle;
        this.columnModel = beans.columnModel;
    }

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
        const rowNode = rowCtrl.getRowNode();
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

        rowNode.expanded = expanded;

        rowNode.dispatchRowEvent('expandedChanged');

        const event = { ..._createGlobalRowEvent(rowNode, this.gos, 'rowGroupOpened'), expanded, event: e || null };

        // throttle used for CSRM only
        if (this.rowNodeEventThrottle) {
            this.rowNodeEventThrottle.dispatchExpanded(event, forceSync);
        } else {
            this.eventService.dispatchEvent(event);
        }

        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer, because the footer can be callback
        // we refresh regardless as the output of the callback could be a moving target
        this.rowRenderer.refreshCells({ rowNodes: [rowNode] });
    }

    public isExpandable(rowNode: RowNode): boolean {
        if (rowNode.footer) {
            return false;
        }

        if (this.columnModel.isPivotMode()) {
            // master detail and leaf groups aren't expandable in pivot mode.
            return rowNode.hasChildren() && !rowNode.leafGroup;
        }
        return rowNode.hasChildren() || rowNode.master;
    }

    private updateExpandedCss(rowCtrl: RowCtrl, rowNode: RowNode): void {
        const expandable = rowNode.isExpandable();
        const expanded = rowNode.expanded == true;

        rowCtrl.forEachGui(undefined, (gui) => {
            gui.rowComp.addOrRemoveCssClass('ag-row-group', expandable);
            gui.rowComp.addOrRemoveCssClass('ag-row-group-expanded', expandable && expanded);
            gui.rowComp.addOrRemoveCssClass('ag-row-group-contracted', expandable && !expanded);
            _setAriaExpanded(gui.element, expandable && expanded);
        });
    }
}
