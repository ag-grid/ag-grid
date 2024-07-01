import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { BrandedType } from '../../interfaces/brandedType';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { AbstractHeaderCellCtrl } from '../cells/abstractCell/abstractHeaderCellCtrl';
import { HeaderCellCtrl } from '../cells/column/headerCellCtrl';
import { HeaderGroupCellCtrl } from '../cells/columnGroup/headerGroupCellCtrl';
import { HeaderRowType } from './headerRowComp';
export interface IHeaderRowComp {
    setTop(top: string): void;
    setHeight(height: string): void;
    setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[], forceOrder: boolean, afterScroll: boolean): void;
    setWidth(width: string): void;
}
export type HeaderRowCtrlInstanceId = BrandedType<number, 'HeaderRowCtrlInstanceId'>;
export declare class HeaderRowCtrl extends BeanStub {
    private beans;
    wireBeans(beans: BeanCollection): void;
    private comp;
    private rowIndex;
    private pinned;
    private type;
    private headerRowClass;
    private instanceId;
    private headerCellCtrls;
    private isPrintLayout;
    private isEnsureDomOrder;
    constructor(rowIndex: number, pinned: ColumnPinnedType, type: HeaderRowType);
    postConstruct(): void;
    getInstanceId(): HeaderRowCtrlInstanceId;
    /** Checks that every header cell that is currently visible has been rendered.
     * Can only be false under some circumstances when using React
     */
    areCellsRendered(): boolean;
    /**
     *
     * @param comp Proxy to the actual component
     * @param initCompState Should the component be initialised with the current state of the controller. Default: true
     */
    setComp(comp: IHeaderRowComp, initCompState?: boolean): void;
    getHeaderRowClass(): string;
    getAriaRowIndex(): number;
    private addEventListeners;
    getHeaderCellCtrl(column: AgColumnGroup): HeaderGroupCellCtrl | undefined;
    getHeaderCellCtrl(column: AgColumn): HeaderCellCtrl | undefined;
    private onDisplayedColumnsChanged;
    getType(): HeaderRowType;
    private onColumnResized;
    private setWidth;
    private getWidthForRow;
    private onRowHeightChanged;
    getTopAndHeight(): {
        topOffset: number;
        rowHeight: number;
    };
    getPinned(): ColumnPinnedType;
    getRowIndex(): number;
    private onVirtualColumnsChanged;
    getHeaderCtrls(): AbstractHeaderCellCtrl<any, any, any>[];
    private getHeaderCellCtrls;
    private recycleAndCreateHeaderCtrls;
    private getColumnsInViewport;
    private getColumnsInViewportPrintLayout;
    private getActualDepth;
    private getColumnsInViewportNormalLayout;
    findHeaderCellCtrl(column: AgColumn | AgColumnGroup): AbstractHeaderCellCtrl | undefined;
    focusHeader(column: AgColumn | AgColumnGroup, event?: KeyboardEvent): boolean;
    destroy(): void;
}
