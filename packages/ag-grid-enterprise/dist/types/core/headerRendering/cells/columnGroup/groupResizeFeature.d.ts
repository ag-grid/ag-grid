import { ColumnEventType } from "../../../events";
import { BeanStub } from "../../../context/beanStub";
import { Column, ColumnPinnedType } from "../../../entities/column";
import { ColumnGroup } from "../../../entities/columnGroup";
import { IHeaderGroupCellComp } from "./headerGroupCellCtrl";
import { IHeaderResizeFeature } from "../abstractCell/abstractHeaderCellCtrl";
interface ColumnSizeAndRatios {
    columnsToResize: Column[];
    resizeStartWidth: number;
    resizeRatios: number[];
    groupAfterColumns?: Column[];
    groupAfterStartWidth?: number;
    groupAfterRatios?: number[];
}
export declare class GroupResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private eResize;
    private columnGroup;
    private comp;
    private pinned;
    private resizeCols?;
    private resizeStartWidth;
    private resizeRatios?;
    private resizeTakeFromCols?;
    private resizeTakeFromStartWidth?;
    private resizeTakeFromRatios?;
    private readonly horizontalResizeService;
    private readonly autoWidthCalculator;
    private readonly columnModel;
    constructor(comp: IHeaderGroupCellComp, eResize: HTMLElement, pinned: ColumnPinnedType, columnGroup: ColumnGroup);
    private postConstruct;
    private onResizeStart;
    onResizing(finished: boolean, resizeAmount: any, source?: ColumnEventType): void;
    getInitialValues(shiftKey?: boolean): ColumnSizeAndRatios;
    private storeLocalValues;
    private clearLocalValues;
    resizeLeafColumnsToFit(source: ColumnEventType): void;
    private resizeColumnsFromLocalValues;
    resizeColumns(initialValues: ColumnSizeAndRatios, totalWidth: number, source: ColumnEventType, finished?: boolean): void;
    toggleColumnResizing(resizing: boolean): void;
    private getColumnsToResize;
    private getInitialSizeOfColumns;
    private getSizeRatiosOfColumns;
    private normaliseDragChange;
    protected destroy(): void;
}
export {};
