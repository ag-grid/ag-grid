import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { RowRenderer } from '../../rendering/rowRenderer';
import { ViewportSizeFeature } from '../viewportSizeFeature';
export type RowContainerName = 'left' | 'right' | 'center' | 'fullWidth' | 'topLeft' | 'topRight' | 'topCenter' | 'topFullWidth' | 'stickyTopLeft' | 'stickyTopRight' | 'stickyTopCenter' | 'stickyTopFullWidth' | 'stickyBottomLeft' | 'stickyBottomRight' | 'stickyBottomCenter' | 'stickyBottomFullWidth' | 'bottomLeft' | 'bottomRight' | 'bottomCenter' | 'bottomFullWidth';
export type RowContainerType = 'left' | 'right' | 'center' | 'fullWidth';
type GetRowCtrls = (renderer: RowRenderer) => RowCtrl[];
export type RowContainerOptions = {
    type: RowContainerType;
    container: string;
    viewport?: string;
    pinnedType?: ColumnPinnedType;
    fullWidth?: boolean;
    getRowCtrls: GetRowCtrls;
};
export declare function _getRowContainerOptions(name: RowContainerName): RowContainerOptions;
export interface IRowContainerComp {
    setViewportHeight(height: string): void;
    setRowCtrls(params: {
        rowCtrls: RowCtrl[];
        useFlushSync?: boolean;
    }): void;
    setDomOrder(domOrder: boolean): void;
    setContainerWidth(width: string): void;
    setOffsetTop(offset: string): void;
}
export declare class RowContainerCtrl extends BeanStub {
    private dragService;
    private ctrlsService;
    private columnViewportService;
    private resizeObserverService;
    private rowRenderer;
    wireBeans(beans: BeanCollection): void;
    private readonly options;
    private readonly name;
    private comp;
    private eContainer;
    private eViewport;
    private enableRtl;
    private viewportSizeFeature;
    private pinnedWidthFeature;
    private visible;
    private EMPTY_CTRLS;
    constructor(name: RowContainerName);
    postConstruct(): void;
    private onStickyTopOffsetChanged;
    private registerWithCtrlsService;
    private forContainers;
    getContainerElement(): HTMLElement;
    getViewportSizeFeature(): ViewportSizeFeature | undefined;
    setComp(view: IRowContainerComp, eContainer: HTMLElement, eViewport: HTMLElement): void;
    private addListeners;
    private listenOnDomOrder;
    private stopHScrollOnPinnedRows;
    onDisplayedColumnsChanged(): void;
    private onDisplayedColumnsWidthChanged;
    private addPreventScrollWhileDragging;
    onHorizontalViewportChanged(afterScroll?: boolean): void;
    getCenterWidth(): number;
    getCenterViewportScrollLeft(): number;
    registerViewportResizeListener(listener: () => void): void;
    isViewportInTheDOMTree(): boolean;
    getViewportScrollLeft(): number;
    isHorizontalScrollShowing(): boolean;
    getViewportElement(): HTMLElement;
    setContainerTranslateX(amount: number): void;
    getHScrollPosition(): {
        left: number;
        right: number;
    };
    setCenterViewportScrollLeft(value: number): void;
    private isContainerVisible;
    private onPinnedWidthChanged;
    private onDisplayedRowsChanged;
}
export {};
