
import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { RowCtrl } from "../row/rowCtrl";
import { RowCtrlMap, RowRenderer } from "../rowRenderer";
import { last } from "../../utils/array";
import { Constants } from "../../constants/constants";
import { doOnce } from "../../utils/function";
import { Beans } from "../beans";
import { Autowired, PostConstruct } from "../../context/context";
import { IRowModel } from "../../interfaces/iRowModel";
import { GridBodyCtrl } from "../../gridBodyComp/gridBodyCtrl";
import { CtrlsService } from "../../ctrlsService";

export class NiallStickyRowFeature extends BeanStub {

    @Autowired("rowModel") private rowModel: IRowModel;
    @Autowired("rowRenderer") private rowRenderer: RowRenderer;
    @Autowired("ctrlsService") private ctrlsService: CtrlsService;

    private stickyRowCtrls: RowCtrl[] = [];

    private gridBodyCtrl: GridBodyCtrl;

    private containerHeight = 0;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(params => {
            this.gridBodyCtrl = params.gridBodyCtrl;
        });
    }

    public getStickyTopHeight(includeSliding: boolean = true): number {
        return 0;
    }

    public getStickyRowCtrls(): RowCtrl[] {
        return this.stickyRowCtrls;
    }

    
    public checkStickyRows(
        createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean, sticky: boolean) => RowCtrl,
        destroyRowCtrls: (rowCtrlsMap: RowCtrlMap | null | undefined, animate: boolean) => void
    ): void {
        let height = 0;

        const setResult = (res: RowNode[] = [])=> {            
            const ctrlsToDestroy: RowCtrlMap = {};
            this.stickyRowCtrls.forEach(ctrl => ctrlsToDestroy[ctrl.getRowNode().id!] = ctrl);
            destroyRowCtrls(ctrlsToDestroy, false);
            this.stickyRowCtrls = res
                        .map( stickyRow => createRowCon(stickyRow, false, false, true) )
                        .reverse();

            if (this.containerHeight!=height) {
                this.containerHeight = height;
                this.gridBodyCtrl.setStickyTopHeight(height);
            }
        }

        if (!this.gridOptionsWrapper.isGroupRowsSticky()) {
            setResult();
            return;
        }

        const stickyRows: RowNode[] = [];
        const firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();

        const addStikyRow = (stickyRow: RowNode) => {
            stickyRows.push(stickyRow);

            let lastAncester = stickyRow;
            while (lastAncester.expanded) {
                lastAncester = lastAncester.childrenAfterSort![lastAncester.childrenAfterSort!.length-1];
            }
            const lastChildBottom = lastAncester.rowTop! + lastAncester.rowHeight!;
            const stickRowBottom = firstPixel + height + stickyRow.rowHeight!;
            if (lastChildBottom < stickRowBottom) {
                stickyRow.stickyRowTop = height + (lastChildBottom - stickRowBottom - 1);
            } else {
                stickyRow.stickyRowTop = height;
            }

            height = 0;
            stickyRows.forEach(rowNode => {
                const thisRowLastPx = rowNode.stickyRowTop + rowNode.rowHeight!;
                if (height < thisRowLastPx) {
                    height = thisRowLastPx;
                }
            });

        };

        for (;;) {
            const firstPixelAfterStickyRows = firstPixel + height;
            const firstIndex = this.rowModel.getRowIndexAtPixel(firstPixelAfterStickyRows);
            let firstRow = this.rowModel.getRow(firstIndex);

            if (firstRow==null) {  break; }

            // only happens when pivoting, and we are showing root node
            if (firstRow.level<0) { break; }

            const parents: RowNode[] = [];
            let p = firstRow.parent!;
            while (p.level>=0) {
                parents.push(p);
                p = p.parent!;
            }
            const firstMissingParent = parents.reverse().find(parent => stickyRows.indexOf(parent)<0);
            if (firstMissingParent) {
                addStikyRow(firstMissingParent);
                continue;
            }

            // if first row is an open group, and partically shown, it needs
            // to be stuck
            if (firstRow.group && firstRow.expanded && firstRow.rowTop! < firstPixelAfterStickyRows) {
                addStikyRow(firstRow);
                continue;
            }

            break;
        }

        setResult(stickyRows);
    }


    public checkStickyRows2(
        createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean, sticky: boolean) => RowCtrl,
        destroyRowCtrls: (rowCtrlsMap: RowCtrlMap | null | undefined, animate: boolean) => void
    ): void {
        const setResult = (res: RowNode[] = [])=> {            
            const ctrlsToDestroy: RowCtrlMap = {};
            this.stickyRowCtrls.forEach(ctrl => ctrlsToDestroy[ctrl.getRowNode().id!] = ctrl);
            destroyRowCtrls(ctrlsToDestroy, false);
            this.stickyRowCtrls = res.map( stickyRow => createRowCon(stickyRow, false, false, true));

            let height = 0;
            res.forEach(rowNode => {
                const thisRowLastPx = rowNode.stickyRowTop + rowNode.rowHeight!;
                if (height < thisRowLastPx) {
                    height = thisRowLastPx;
                }
            });

            if (this.containerHeight!=height) {
                this.containerHeight = height;
                this.gridBodyCtrl.setStickyTopHeight(height);
            }
        }

        if (!this.gridOptionsWrapper.isGroupRowsSticky()) {
            setResult(); return;
        }

        const firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();
        const firstIndex = this.rowModel.getRowIndexAtPixel(firstPixel);
        let firstRow = this.rowModel.getRow(firstIndex);

        if (firstRow==null) { setResult(); return; }

        // if (firstRow.rowTop! < firstPixel) {
        //     firstRow = this.rowModel.getRow(firstIndex + 1);
        // }

        // if (firstRow==null) { setResult(); return; }

        // only happens when pivoting, and we are showing root node
        if (firstRow.level<0) { setResult(); return; }

        const stickyRows: RowNode[] = [];

        // if first row is an open group, and partically shown, it needs
        // to be stuck
        if (firstRow.group && firstRow.expanded && firstRow.rowTop! < firstPixel) {
            stickyRows.push(firstRow);
        }

        const stickyRow = firstRow.level == 0 ? firstRow : firstRow.parent!;
        
        stickyRows.push(stickyRow);
        
        const lastChild = stickyRow.childrenAfterSort![stickyRow.childrenAfterSort!.length-1];
        const lastChildBottom = lastChild.rowTop! + lastChild.rowHeight!;
        const stickRowBottom = firstPixel + stickyRow.rowHeight!;
        if (lastChildBottom < stickRowBottom) {
            stickyRow.stickyRowTop = (lastChildBottom - stickRowBottom - 1);
        } else {
            stickyRow.stickyRowTop = 0;
        }

        setResult(stickyRows);
    }
}