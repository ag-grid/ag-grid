import { BeanStub } from "../../context/beanStub";
import { Column, ColumnPinnedType } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { IHeaderColumn } from "../../interfaces/iHeaderColumn";
import { AbstractHeaderCellCtrl } from "../cells/abstractCell/abstractHeaderCellCtrl";
import { HeaderCellCtrl } from "../cells/column/headerCellCtrl";
import { HeaderGroupCellCtrl } from "../cells/columnGroup/headerGroupCellCtrl";
import { HeaderRowType } from "./headerRowComp";
import { BrandedType } from "../../utils";
export interface IHeaderRowComp {
    setTop(top: string): void;
    setHeight(height: string): void;
    setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[], forceOrder: boolean, afterScroll: boolean): void;
    setWidth(width: string): void;
}
export type HeaderRowCtrlInstanceId = BrandedType<number, 'HeaderRowCtrlInstanceId'>;
export declare class HeaderRowCtrl extends BeanStub {
    private beans;
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
    private postConstruct;
    getInstanceId(): HeaderRowCtrlInstanceId;
    /**
     *
     * @param comp Proxy to the actual component
     * @param initCompState Should the component be initialised with the current state of the controller. Default: true
     */
    setComp(comp: IHeaderRowComp, initCompState?: boolean): void;
    getHeaderRowClass(): string;
    getAriaRowIndex(): number;
    private addEventListeners;
    getHeaderCellCtrl(column: ColumnGroup): HeaderGroupCellCtrl | undefined;
    getHeaderCellCtrl(column: Column): HeaderCellCtrl | undefined;
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
    private recycleAndCreateHeaderCtrls;
    private getColumnsInViewport;
    private getColumnsInViewportPrintLayout;
    private getActualDepth;
    private getColumnsInViewportNormalLayout;
    focusHeader(column: IHeaderColumn, event?: KeyboardEvent): boolean;
    protected destroy(): void;
}
