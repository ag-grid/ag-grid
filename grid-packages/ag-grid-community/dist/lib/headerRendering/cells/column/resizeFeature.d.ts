import { BeanStub } from "../../../context/beanStub";
import { Column, ColumnPinnedType } from "../../../entities/column";
import { IHeaderResizeFeature } from "../abstractCell/abstractHeaderCellCtrl";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";
export declare class ResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private horizontalResizeService;
    private pinnedWidthService;
    private ctrlsService;
    private columnModel;
    private pinned;
    private column;
    private eResize;
    private comp;
    private lastResizeAmount;
    private resizeStartWidth;
    private resizeWithShiftKey;
    private ctrl;
    constructor(pinned: ColumnPinnedType, column: Column, eResize: HTMLElement, comp: IHeaderCellComp, ctrl: HeaderCellCtrl);
    private postConstruct;
    private onResizing;
    private onResizeStart;
    toggleColumnResizing(resizing: boolean): void;
    private normaliseResizeAmount;
}
