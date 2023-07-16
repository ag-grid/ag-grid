import { ColumnEventType } from "../../../events";
import { BeanStub } from "../../../context/beanStub";
import { ColumnPinnedType } from "../../../entities/column";
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
    private readonly horizontalResizeService;
    private readonly autoWidthCalculator;
    private readonly columnModel;
    constructor(comp: IHeaderGroupCellComp, eResize: HTMLElement, pinned: ColumnPinnedType, columnGroup: ColumnGroup);
    private postConstruct;
    onResizeStart(shiftKey: boolean): void;
    onResizing(finished: boolean, resizeAmount: any, source?: ColumnEventType): void;
    resizeLeafColumnsToFit(source: ColumnEventType): void;
    resizeColumns(totalWidth: number, source: ColumnEventType, finished?: boolean): void;
    private calculateInitialValues;
    private normaliseDragChange;
}
