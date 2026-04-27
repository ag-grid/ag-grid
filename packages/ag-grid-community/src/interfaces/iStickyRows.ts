import type { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { RowCtrl } from '../rendering/row/rowCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IStickyRowFeature {
    stickyTopRowCtrls: RowCtrl[];

    stickyBottomRowCtrls: RowCtrl[];

    refreshStickyNode(stickRowNode: RowNode): void;

    checkStickyRows(): boolean;

    extraTopHeight: number;

    extraBottomHeight: number;

    resetOffsets(): void;

    destroyStickyCtrls(): void;

    ensureRowHeightsValid(): boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IStickyRowService {
    createStickyRowFeature(
        ctrl: BeanStub,
        createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean) => RowCtrl,
        destroyRowCtrls: (rowCtrlsMap: Record<string, RowCtrl> | null | undefined, animate: boolean) => void
    ): IStickyRowFeature | undefined;
}
