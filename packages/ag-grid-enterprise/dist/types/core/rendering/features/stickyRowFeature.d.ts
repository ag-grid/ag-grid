import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { RowCtrl } from "../row/rowCtrl";
import { RowCtrlByRowNodeIdMap } from "../rowRenderer";
export declare class StickyRowFeature extends BeanStub {
    private readonly createRowCon;
    private readonly destroyRowCtrls;
    private rowModel;
    private rowRenderer;
    private ctrlsService;
    private stickyTopRowCtrls;
    private stickyBottomRowCtrls;
    private gridBodyCtrl;
    private topContainerHeight;
    private bottomContainerHeight;
    private isClientSide;
    constructor(createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean) => RowCtrl, destroyRowCtrls: (rowCtrlsMap: RowCtrlByRowNodeIdMap | null | undefined, animate: boolean) => void);
    private postConstruct;
    getStickyTopRowCtrls(): RowCtrl[];
    getStickyBottomRowCtrls(): RowCtrl[];
    /**
     * Get the last pixel of the group, this pixel is used to push the sticky node up out of the viewport.
     */
    private getLastPixelOfGroup;
    /**
     * Get the first pixel of the group, this pixel is used to push the sticky node down out of the viewport
     */
    private getFirstPixelOfGroup;
    private getServerSideLastPixelOfGroup;
    private getClientSideLastPixelOfGroup;
    private updateStickyRows;
    private areFooterRowsStickySuppressed;
    private canRowsBeSticky;
    private getStickyAncestors;
    checkStickyRows(): boolean;
    destroyStickyCtrls(): void;
    refreshStickyNode(stickRowNode: RowNode): void;
    /**
     * Destroy old ctrls and create new ctrls where necessary.
     */
    private refreshNodesAndContainerHeight;
}
