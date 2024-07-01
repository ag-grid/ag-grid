import { BeanStub } from '../../../context/beanStub';
import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { ColumnPinnedType } from '../../../interfaces/iColumn';
import type { IHeaderResizeFeature } from '../abstractCell/abstractHeaderCellCtrl';
import type { HeaderCellCtrl, IHeaderCellComp } from './headerCellCtrl';
export declare class ResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private horizontalResizeService;
    private pinnedWidthService;
    private ctrlsService;
    private columnSizeService;
    private columnAutosizeService;
    wireBeans(beans: BeanCollection): void;
    private pinned;
    private column;
    private eResize;
    private comp;
    private lastResizeAmount;
    private resizeStartWidth;
    private resizeWithShiftKey;
    private ctrl;
    constructor(pinned: ColumnPinnedType, column: AgColumn, eResize: HTMLElement, comp: IHeaderCellComp, ctrl: HeaderCellCtrl);
    postConstruct(): void;
    private onResizing;
    private onResizeStart;
    toggleColumnResizing(resizing: boolean): void;
    private normaliseResizeAmount;
}
