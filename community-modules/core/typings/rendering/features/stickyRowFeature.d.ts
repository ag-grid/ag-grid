import { RowNode } from "../../entities/rowNode";
import { BeanStub } from "../../context/beanStub";
import { RowCtrl } from "../row/rowCtrl";
import { RowCtrlMap } from "../rowRenderer";
export declare class StickyRowFeature extends BeanStub {
    private readonly createRowCon;
    private readonly destroyRowCtrls;
    private rowModel;
    private rowRenderer;
    private ctrlsService;
    private stickyRowCtrls;
    private gridBodyCtrl;
    private containerHeight;
    constructor(createRowCon: (rowNode: RowNode, animate: boolean, afterScroll: boolean) => RowCtrl, destroyRowCtrls: (rowCtrlsMap: RowCtrlMap | null | undefined, animate: boolean) => void);
    private postConstruct;
    getStickyRowCtrls(): RowCtrl[];
    checkStickyRows(): void;
    private refreshNodesAndContainerHeight;
}
