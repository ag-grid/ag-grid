import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { RowCtrl } from "../row/rowCtrl";
import { RowCtrlMap } from "../rowRenderer";
import { last } from "../../utils/array";
import { Constants } from "../../constants/constants";
import { doOnce } from "../../utils/function";
import { Beans } from "../beans";

export class StickyRowFeature extends BeanStub {

    private stickyRowCtrls: RowCtrl[] = [];

    constructor(private readonly beans: Beans) {
        super();
    }

    public getStickyTopHeight(includeSliding: boolean = true): number {
        return this.stickyRowCtrls.reduce((currentHeight, ctrl) => {
            const node = ctrl?.getRowNode();

            if (!node || (!includeSliding && node.stickySliding)) { return currentHeight; }

            return currentHeight + (node.rowHeight || 0);
        }, 0);
    }

    public getStickyRowCtrls(): RowCtrl[] {
        return this.stickyRowCtrls;
    }

    public checkStickyRows(
        createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean, sticky: boolean) => RowCtrl,
        destroyRowCtrls: (rowCtrlsMap: RowCtrlMap | null | undefined, animate: boolean) => void
    ): void {
        if (!this.gridOptionsWrapper.isGroupRowsSticky()) {
            this.stickyRowCtrls = [];
            return;
        }

        if (this.beans.rowModel.getType() != Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            doOnce(() => console.warn('AG Grid: The feature Sticky Row Groups only works with the Client Side Row Model'), 'rowRenderer.stickyWorksWithCsrmOnly');
        }

        const stickyRows = this.updateStickySlidingRows(this.getRowsThatShouldStick());

        const oldHash = this.stickyRowCtrls.map(ctrl => ctrl.getRowNode().__objectId).join('-');
        const newHash = stickyRows.map(row => row.__objectId).join('-');

        if (oldHash === newHash) { return; }

        const ctrlsToDestroy: RowCtrlMap = {};
        this.stickyRowCtrls.forEach(ctrl => ctrlsToDestroy[ctrl.getRowNode().id!] = ctrl);

        const newCtrls: RowCtrl[] = [];
        let nextRowTop = 0;
        stickyRows.forEach(rowNode => {
            rowNode.sticky = true;
            if (!rowNode.stickySliding) {
                rowNode.stickyRowTop = nextRowTop;
                rowNode.initialStickyRowTop = nextRowTop;
                nextRowTop += rowNode.rowHeight!;
            } else {
                nextRowTop += rowNode.rowHeight! - (rowNode.initialStickyRowTop - rowNode.stickyRowTop);
            }

            const rowNodeId = rowNode.id!;
            const oldCtrl = ctrlsToDestroy[rowNodeId];
            if (oldCtrl) {
                delete ctrlsToDestroy[rowNodeId];
                newCtrls.push(oldCtrl);
                return;
            }
            const newCtrl = createRowCon(rowNode, false, false, true);
            newCtrls.push(newCtrl);
        });

        Object.values(ctrlsToDestroy).forEach(ctrl => ctrl.getRowNode().sticky = false);
        destroyRowCtrls(ctrlsToDestroy, false);

        // we reverse, as we want the order of the rows in the DOM to
        // be reversed, otherwise they would not slide under the rows above
        // when sliding in and out
        this.stickyRowCtrls = newCtrls.reverse();
    }

    private getRowsThatShouldStick(): RowNode[] {
        const height = this.getStickyTopHeight();
        const firstVisibleVPixel = this.beans.rowRenderer.getFirstVisibleVerticalPixel();
        const firstVisibleIndex = this.beans.rowModel.getRowIndexAtPixel(firstVisibleVPixel + height);

        const ret: RowNode[] = [];

        let rowNode = this.beans.paginationProxy.getRow(firstVisibleIndex);
        while (rowNode && rowNode.level >= 0) {
            if (rowNode.group && rowNode.expanded) {
                ret.unshift(rowNode);
            }
            rowNode = rowNode.parent as RowNode;
        }

        return ret;
    }

    private updateStickySlidingRows(stickyRows: RowNode[]): RowNode[] {
        stickyRows.forEach(node => node.stickySliding = false);

        const currentRowNodes = this.stickyRowCtrls.map(ctrl => ctrl.getRowNode());
        const addedNodes = stickyRows.filter(node => currentRowNodes.indexOf(node) === -1);
        const removedNodes = currentRowNodes.filter(node => stickyRows.indexOf(node) === -1);

        this.updateStickySlidingRowsRemoved(removedNodes);
        this.updateStickySlidingRowsAdded(addedNodes);

        stickyRows.push(
            ...removedNodes.filter(node => node.stickySliding)
        );

        stickyRows.sort((a, b) => a.rowIndex! - b.rowIndex!);

        let isSliding = false;

        return stickyRows.filter(node => {
            if (isSliding && addedNodes.indexOf(node) != -1) { return false; }
            if (node.stickySliding) { isSliding = true; }
            return true;
        });
    }

    private updateStickySlidingRowsRemoved(stickyRows: RowNode[]): void {
        const lastNode = last(stickyRows);
        if (!lastNode) { return; }

        const firstVisibleVPixel = this.beans.rowRenderer.getFirstVisibleVerticalPixel();
        const bottomOfLastNode = lastNode.stickyRowTop + lastNode.rowHeight!;
        const firstVisibleIndex = this.beans.rowModel.getRowIndexAtPixel(firstVisibleVPixel + bottomOfLastNode);
        const nextNode = this.beans.paginationProxy.getRow(firstVisibleIndex);
        const diff = (nextNode!.rowTop! - bottomOfLastNode - firstVisibleVPixel);

        if (lastNode === nextNode) { return; }

        stickyRows.forEach(node => {
            const newTop = node.stickyRowTop + diff;
            const removeLimit = stickyRows.length * node.rowHeight!;
            if (newTop <= node.initialStickyRowTop) {
                if (node.initialStickyRowTop - newTop > removeLimit) {
                    node.stickySliding = false;
                    return;
                }
                const ctrl = this.stickyRowCtrls.find(ctrl => ctrl.getRowNode() === node);
                node.stickySliding = true;
                node.stickyRowTop = newTop;
                ctrl?.setRowTop(newTop);
            } else {
                // console.log('diff larger than height');
            }
        });
    }

    private updateStickySlidingRowsAdded(stickyRows: RowNode[]): void {
        // TODO: Logic to slideIn Sticky Row Groups when scrolling from bottom -> top.
        const lastNode = last(stickyRows);
        if (!lastNode) { return; }
    }
}