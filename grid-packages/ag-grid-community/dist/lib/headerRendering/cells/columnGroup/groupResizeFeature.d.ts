import { BeanStub } from "../../../context/beanStub";
import { ColumnGroup } from "../../../entities/columnGroup";
import { IHeaderGroupCellComp } from "./headerGroupCellCtrl";
export declare class GroupResizeFeature extends BeanStub {
    private eResize;
    private columnGroup;
    private comp;
    private pinned;
    private resizeCols;
    private resizeStartWidth;
    private resizeRatios;
    private resizeTakeFromCols;
    private resizeTakeFromStartWidth;
    private resizeTakeFromRatios;
    private horizontalResizeService;
    private columnModel;
    constructor(comp: IHeaderGroupCellComp, eResize: HTMLElement, pinned: string | null, columnGroup: ColumnGroup);
    private postConstruct;
    onResizeStart(shiftKey: boolean): void;
    onResizing(finished: boolean, resizeAmount: any): void;
    private normaliseDragChange;
}
