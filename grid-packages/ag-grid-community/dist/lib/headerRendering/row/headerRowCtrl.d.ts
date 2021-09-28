import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { IHeaderColumn } from "../../entities/iHeaderColumn";
import { AbstractHeaderCellCtrl } from "../cells/abstractCell/abstractHeaderCellCtrl";
import { HeaderRowType } from "./headerRowComp";
export interface IHeaderRowComp {
    setTransform(transform: string): void;
    setTop(top: string): void;
    setHeight(height: string): void;
    setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[]): void;
    setWidth(width: string): void;
    setAriaRowIndex(rowIndex: number): void;
}
export declare class HeaderRowCtrl extends BeanStub {
    private columnModel;
    private focusService;
    private comp;
    private rowIndex;
    private pinned;
    private type;
    private instanceId;
    private headerCellCtrls;
    constructor(rowIndex: number, pinned: string | null, type: HeaderRowType);
    getInstanceId(): number;
    setComp(comp: IHeaderRowComp): void;
    private addEventListeners;
    getHtmlElementForColumnHeader(column: Column): HTMLElement | undefined;
    private onDisplayedColumnsChanged;
    getType(): HeaderRowType;
    private onColumnResized;
    private setWidth;
    private getWidthForRow;
    private onRowHeightChanged;
    getPinned(): string | null;
    getRowIndex(): number;
    private onVirtualColumnsChanged;
    private getColumnsInViewport;
    private getColumnsInViewportPrintLayout;
    private getActualDepth;
    private getColumnsInViewportNormalLayout;
    focusHeader(column: IHeaderColumn): boolean;
}
