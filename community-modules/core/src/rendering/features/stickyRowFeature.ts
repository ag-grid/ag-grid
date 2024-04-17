import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { RowCtrl } from "../row/rowCtrl";
import { RowCtrlByRowNodeIdMap, RowRenderer } from "../rowRenderer";
import { Autowired, PostConstruct } from "../../context/context";
import { IRowModel } from "../../interfaces/iRowModel";
import { GridBodyCtrl } from "../../gridBodyComp/gridBodyCtrl";
import { CtrlsService } from "../../ctrlsService";
import { last } from "../../utils/array";

export class StickyRowFeature extends BeanStub {

    @Autowired("rowModel") private rowModel: IRowModel;
    @Autowired("rowRenderer") private rowRenderer: RowRenderer;
    @Autowired("ctrlsService") private ctrlsService: CtrlsService;

    private stickyTopRowCtrls: RowCtrl[] = [];
    private stickyBottomRowCtrls: RowCtrl[] = [];
    private gridBodyCtrl: GridBodyCtrl;
    private topContainerHeight = 0;
    private bottomContainerHeight = 0;
    private isClientSide: boolean;

    constructor(
        private readonly createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean) => RowCtrl,
        private readonly destroyRowCtrls: (rowCtrlsMap: RowCtrlByRowNodeIdMap | null | undefined, animate: boolean) => void
    ) {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        this.isClientSide = this.rowModel.getType() === 'clientSide';

        this.ctrlsService.whenReady(params => {
            this.gridBodyCtrl = params.gridBodyCtrl;
        });
    }

    public getStickyTopRowCtrls(): RowCtrl[] {
        return this.stickyTopRowCtrls;
    }

    public getStickyBottomRowCtrls(): RowCtrl[] {
        return this.stickyBottomRowCtrls;
    }

    /**
     * Get the last pixel of the group, this pixel is used to push the sticky node up out of the viewport.
     */
    private getLastPixelOfGroup(row: RowNode): number {
        return this.isClientSide ? this.getClientSideLastPixelOfGroup(row) : this.getServerSideLastPixelOfGroup(row);
    }

    /**
     * Get the first pixel of the group, this pixel is used to push the sticky node down out of the viewport
     */
    private getFirstPixelOfGroup(row: RowNode): number {
        if (row.footer) {
            return row.sibling!.rowTop! + row.sibling!.rowHeight! - 1;
        }

        if (row.group) {
            return row.rowTop! - 1;
        }

        // only footer nodes stick bottom, so shouldn't reach this.
        return 0;
    }
    private getServerSideLastPixelOfGroup(row: RowNode): number {
        if (this.isClientSide) {
            throw new Error('This func should only be called in server side row model.');
        }

        if (row.isExpandable() || row.footer) {
            if (row.master) {
                return row.detailNode.rowTop! + row.detailNode.rowHeight!;
            }

            const noOrContiguousSiblings = !row.sibling || Math.abs(row.sibling.rowIndex! - row.rowIndex!) === 1;
            if (noOrContiguousSiblings) {
                let storeBounds = row.childStore?.getStoreBounds();
                if (row.footer) {
                    storeBounds = row.sibling.childStore?.getStoreBounds();
                }
                return (storeBounds?.heightPx ?? 0) + (storeBounds?.topPx ?? 0);
            }

            if (row.footer) {
                return row.rowTop! + row.rowHeight!;
            }

            return row.sibling!.rowTop! + row.sibling!.rowHeight!;
        }
        // if not a group, then this row shouldn't be sticky currently.
        return Number.MAX_SAFE_INTEGER;
    }

    private getClientSideLastPixelOfGroup(row: RowNode): number {
        if (!this.isClientSide) {
            throw new Error('This func should only be called in client side row model.');
        }

        if (row.isExpandable() || row.footer) {
            const grandTotalAtTop = row.footer && row.rowIndex === 0;
            // if no siblings, we search the children for the last displayed row, to get last px.
            // equally, if sibling but sibling is contiguous ('top') then sibling cannot be used
            // to find last px
            const noOrContiguousSiblings = !row.sibling || Math.abs(row.sibling.rowIndex! - row.rowIndex!) === 1;
            if (grandTotalAtTop || noOrContiguousSiblings) {
                let lastAncestor = row.footer ? row.sibling : row;
                while (lastAncestor.isExpandable() && lastAncestor.expanded) {
                    if (lastAncestor.master) {
                        lastAncestor = lastAncestor.detailNode;
                    } else if (lastAncestor.childrenAfterSort) {
                        // Tree Data will have `childrenAfterSort` without any nodes, but
                        // the current node will still be marked as expansible.
                        if (lastAncestor.childrenAfterSort.length === 0) { break; }
                        lastAncestor = last(lastAncestor.childrenAfterSort);
                    }
                }
                return lastAncestor.rowTop! + lastAncestor.rowHeight!
            }

            // if siblings not contiguous, footer is last row and easiest way for last px
            if (row.footer) {
                return row.rowTop! + row.rowHeight!;
            }
            return row.sibling!.rowTop! + row.sibling!.rowHeight!;
        }
        // if not expandable, then this row shouldn't be sticky currently.
        return Number.MAX_SAFE_INTEGER;
    }

    private updateStickyTopRows(): boolean {
        let topHeight = 0;

        if (!this.gos.isGroupRowsSticky()) {
            return this.refreshNodesAndContainerHeight('top', [], topHeight);
        }

        // Group and footer nodes are sticky when the children are in viewport, but they are not.
        const firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();
        const stickyRowsTop: RowNode[] = [];
        const addStickyRow = (stickyRow: RowNode) => {
            stickyRowsTop.push(stickyRow);

            // get the pixel which stops this node being sticky.
            let lastChildBottom: number = this.getLastPixelOfGroup(stickyRow);

            const stickRowBottom = firstPixel + topHeight + stickyRow.rowHeight!;
            if (lastChildBottom < stickRowBottom) {
                stickyRow.stickyRowTop = topHeight + (lastChildBottom - stickRowBottom);
            } else {
                stickyRow.stickyRowTop = topHeight;
            }

            // have to recalculate height after each row has been added, to allow
            // calculating the next sticky row
            topHeight = 0;
            stickyRowsTop.forEach(rowNode => {
                const thisRowLastPx = rowNode.stickyRowTop + rowNode.rowHeight!;
                if (topHeight < thisRowLastPx) {
                    topHeight = thisRowLastPx;
                }
            });

        };

        let counter = 0;
        while (true) {
            const firstPixelAfterStickyRows = firstPixel + topHeight;
            const firstIndex = this.rowModel.getRowIndexAtPixel(firstPixelAfterStickyRows);
            const firstRow = this.rowModel.getRow(firstIndex);

            if (firstRow == null) {  break; }

            // added logic to break out of the loop when the row calculation
            // changes while rows are becoming sticky (happens with auto height)
            if (counter++ === 100) { break; }

            const parents: RowNode[] = [];
            let p = firstRow.footer ? firstRow.sibling : firstRow.parent;
            while (p) {
                if (p.sibling) {
                    parents.push(p.sibling);
                }
                parents.push(p);
                p = p.parent!;
            }

            const suppressFootersSticky = this.gos.get('suppressStickyTotalRow');
            const suppressGroupsSticky = this.gos.get('suppressGroupRowsSticky');
            const isRowSticky = (row: RowNode) => {
                if (row.footer) {
                    if (suppressFootersSticky === true) { return false; }
                    if (suppressFootersSticky === 'grand' && row.level === -1) { return false };
                    if (suppressFootersSticky === 'group' && row.level > -1) { return false };

                    const alreadySticking = stickyRowsTop.indexOf(row) >= 0;
                    return !alreadySticking && row.displayed;
                }

                if (row.isExpandable()) {
                    if (suppressGroupsSticky === true) { return false };
                    const alreadySticking = stickyRowsTop.indexOf(row) >= 0;
                    return !alreadySticking && row.displayed && row.expanded;
                }

                return false;
            }
            const firstMissingParent = parents.reverse().find(parent => parent.rowIndex! < firstIndex && isRowSticky(parent));
            if (firstMissingParent) {
                addStickyRow(firstMissingParent);
                continue;
            }

            // if first row is an open group, and partially shown, it needs
            // to be stuck
            if (firstRow.rowTop! < firstPixelAfterStickyRows && isRowSticky(firstRow)) {
                addStickyRow(firstRow);
                continue;
            }

            break;
        }

        return this.refreshNodesAndContainerHeight('top', stickyRowsTop, topHeight);
    }

    private updateStickyBottomRows(): boolean {
        let bottomHeight = 0;

        if (!this.gos.isGroupRowsSticky()) {
            return this.refreshNodesAndContainerHeight('bottom', [], bottomHeight);
        }


        const lastPixel = this.rowRenderer.getLastVisibleVerticalPixel();
        let stickyRowsBottom: RowNode[] = [];
        const addStickyRowBottom = (stickyRow: RowNode) => {
            stickyRowsBottom.push(stickyRow);

            let firstChildTop: number = this.getFirstPixelOfGroup(stickyRow);

            const stickRowTop = lastPixel - (bottomHeight + stickyRow.rowHeight!);
            if (firstChildTop! > stickRowTop) {
                stickyRow.stickyRowTop = bottomHeight - (firstChildTop! - stickRowTop);
            } else {
                stickyRow.stickyRowTop = bottomHeight;
            }

            // need to keep the running height tally, to calculate next sticky row
            bottomHeight = 0;
            stickyRowsBottom.forEach(rowNode => {
                const thisRowLastPx = rowNode.stickyRowTop + rowNode.rowHeight!;
                if (bottomHeight < thisRowLastPx) {
                    bottomHeight = thisRowLastPx;
                }
            });
        };

        
        let count = 0;
        while (true) {
            const lastPixelBeforeStickyRows = lastPixel - bottomHeight;
            const lastIndex = this.rowModel.getRowIndexAtPixel(lastPixelBeforeStickyRows);
            const lastRow = this.rowModel.getRow(lastIndex);

            if (lastRow == null) {  break; }

            // added logic to break out of the loop when the row calculation
            // changes while rows are becoming sticky (happens with auto height)
            if (count++ === 100) { break; }

            const parents: RowNode[] = [];
            let p = lastRow.parent!;
            while (p) {
                if (p.sibling) {
                    parents.push(p.sibling);
                }
                p = p.parent!;
            }
 
            const suppressFootersSticky = this.gos.get('suppressStickyTotalRow');
            const suppressGroupsSticky = this.gos.get('suppressGroupRowsSticky');
            const isRowSticky = (row: RowNode) => {
                if (row.footer) {
                    if (suppressFootersSticky === true) { return false; }
                    if (suppressFootersSticky === 'grand' && row.level === -1) { return false };
                    if (suppressFootersSticky === 'group' && row.level > -1) { return false };

                    const alreadySticking = stickyRowsBottom.indexOf(row) >= 0;
                    return !alreadySticking && row.displayed;
                }

                if (row.isExpandable()) {
                    if (suppressGroupsSticky === true) { return false };
                    const alreadySticking = stickyRowsBottom.indexOf(row) >= 0;
                    return !alreadySticking && row.displayed && row.expanded;
                }

                return false;
            }
            const firstMissingTotal = parents.reverse().find(parent => parent.rowIndex! > lastIndex && isRowSticky(parent));
            if (firstMissingTotal) {
                addStickyRowBottom(firstMissingTotal);
                continue;
            }

            // if last row is a footer, and partially shown, it needs
            // to be stuck
            if ((lastRow.rowTop! + lastRow.rowHeight!) > lastPixelBeforeStickyRows && isRowSticky(lastRow)) {
                addStickyRowBottom(lastRow);
                continue;
            }

            break;
        }

        // Because sticky bottom rows are calculated inverted, we need to invert the top position
        stickyRowsBottom.forEach(rowNode => {
            rowNode.stickyRowTop = bottomHeight - (rowNode.stickyRowTop + rowNode.rowHeight!);
        });

        return this.refreshNodesAndContainerHeight('bottom', stickyRowsBottom, bottomHeight);
    }

    public checkStickyRows(): boolean {
        const hasTopUpdated = this.updateStickyTopRows();
        const hasBottomUpdated = this.updateStickyBottomRows();
        return hasTopUpdated || hasBottomUpdated;
    }

    public refreshStickyNode(stickRowNode:  RowNode): void {
        if (this.stickyTopRowCtrls.some(ctrl => ctrl.getRowNode() === stickRowNode)) {
            const allStickyNodes: RowNode[] = [];
            for (let i = 0; i < this.stickyTopRowCtrls.length; i++) {
                const currentNode = this.stickyTopRowCtrls[i].getRowNode();
                if (currentNode !== stickRowNode) {
                    allStickyNodes.push(currentNode);
                }
            }
    
            if (this.refreshNodesAndContainerHeight('top', allStickyNodes, this.topContainerHeight)) {
                this.checkStickyRows();
            }
            return;
        }

        const allStickyNodes: RowNode[] = [];
        for (let i = 0; i < this.stickyBottomRowCtrls.length; i++) {
            const currentNode = this.stickyBottomRowCtrls[i].getRowNode();
            if (currentNode !== stickRowNode) {
                allStickyNodes.push(currentNode);
            }
        }

        if (this.refreshNodesAndContainerHeight('bottom', allStickyNodes, this.bottomContainerHeight)) {
            this.checkStickyRows();
        }
    }

    private refreshNodesAndContainerHeight(topOrBottom: 'top' | 'bottom', allStickyNodes: RowNode[], height: number): boolean {
        let stickyRowsChanged = false;

        let ctrls = topOrBottom === 'top' ? this.stickyTopRowCtrls : this.stickyBottomRowCtrls;

        const removedCtrls = ctrls.filter(ctrl => allStickyNodes.indexOf(ctrl.getRowNode()) === -1);
        const addedNodes = allStickyNodes.filter(rowNode => ctrls.findIndex(ctrl => ctrl.getRowNode() === rowNode) === -1);

        if (removedCtrls.length || addedNodes.length) {
            stickyRowsChanged = true;
        }

        const ctrlsToDestroy: RowCtrlByRowNodeIdMap = {};
        removedCtrls.forEach(removedCtrl => {
            ctrlsToDestroy[removedCtrl.getRowNode().id!] = removedCtrl;
            if (topOrBottom === 'top') {
                this.stickyTopRowCtrls = ctrls.filter(ctrl => ctrl !== removedCtrl);
                ctrls = this.stickyTopRowCtrls;
            } else {
                this.stickyBottomRowCtrls = ctrls.filter(ctrl => ctrl !== removedCtrl);
                ctrls = this.stickyBottomRowCtrls;
            }
        });

        for (const ctrl of Object.values(ctrlsToDestroy)) {
            ctrl.getRowNode().sticky = false;
        }

        this.destroyRowCtrls(ctrlsToDestroy, false);

        const newCtrls = addedNodes.map(rowNode => {
            rowNode.sticky = true;
            return this.createRowCon(rowNode, false, false);
        });

        ctrls.push(...newCtrls);
        ctrls.forEach(ctrl => ctrl.setRowTop(ctrl.getRowNode().stickyRowTop));

        if (topOrBottom === 'top') {
            ctrls.sort((a, b) => b.getRowNode().rowIndex! - a.getRowNode().rowIndex!);
        } else {
            ctrls.sort((a, b) => a.getRowNode().rowIndex! - b.getRowNode().rowIndex!);
        }

        if ((topOrBottom === 'top' ? this.topContainerHeight : this.bottomContainerHeight) !== height) {
            if (topOrBottom === 'top') {
                this.topContainerHeight = height;
                this.gridBodyCtrl.setStickyTopHeight(height);
            } else {
                this.bottomContainerHeight = height;
                this.gridBodyCtrl.setStickyBottomHeight(height);
            }
            stickyRowsChanged = true;
        }

        return stickyRowsChanged;
    }
}