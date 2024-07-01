import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { RowCtrl } from '../row/rowCtrl';
import type { RowCtrlByRowNodeIdMap } from '../rowRenderer';
export declare class StickyRowFeature extends BeanStub {
    private readonly createRowCon;
    private readonly destroyRowCtrls;
    private rowModel;
    private rowRenderer;
    private ctrlsService;
    private pageBoundsService;
    wireBeans(beans: BeanCollection): void;
    private stickyTopRowCtrls;
    private stickyBottomRowCtrls;
    private gridBodyCtrl;
    private topContainerHeight;
    private bottomContainerHeight;
    private isClientSide;
    private extraTopHeight;
    private extraBottomHeight;
    constructor(createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean) => RowCtrl, destroyRowCtrls: (rowCtrlsMap: RowCtrlByRowNodeIdMap | null | undefined, animate: boolean) => void);
    postConstruct(): void;
    getStickyTopRowCtrls(): RowCtrl[];
    getStickyBottomRowCtrls(): RowCtrl[];
    private setOffsetTop;
    private setOffsetBottom;
    resetOffsets(): void;
    getExtraTopHeight(): number;
    getExtraBottomHeight(): number;
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
    ensureRowHeightsValid(): boolean;
}
