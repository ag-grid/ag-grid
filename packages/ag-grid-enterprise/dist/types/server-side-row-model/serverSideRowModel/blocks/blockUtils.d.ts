import type { AgColumn, BeanCollection, IRowNode, NamedBean, NumberSequence, RowBounds } from 'ag-grid-community';
import { BeanStub, RowNode } from 'ag-grid-community';
export declare const GROUP_MISSING_KEY_ID: "ag-Grid-MissingKey";
export declare class BlockUtils extends BeanStub implements NamedBean {
    beanName: "ssrmBlockUtils";
    private valueService;
    private showRowGroupColsService?;
    private nodeManager;
    private beans;
    private expansionService;
    wireBeans(beans: BeanCollection): void;
    createRowNode(params: {
        group: boolean;
        leafGroup: boolean;
        level: number;
        parent: RowNode;
        field: string;
        rowGroupColumn: AgColumn;
        rowHeight?: number;
    }): RowNode;
    destroyRowNodes(rowNodes: RowNode[]): void;
    destroyRowNode(rowNode: RowNode, preserveStore?: boolean): void;
    private setTreeGroupInfo;
    private setRowGroupInfo;
    private setMasterDetailInfo;
    updateDataIntoRowNode(rowNode: RowNode, data: any): void;
    setDataIntoRowNode(rowNode: RowNode, data: any, defaultId: string, cachedRowHeight: number | undefined): void;
    private setChildCountIntoRowNode;
    private setGroupDataIntoRowNode;
    clearDisplayIndex(rowNode: RowNode): void;
    setDisplayIndex(rowNode: RowNode, displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    binarySearchForDisplayIndex(displayRowIndex: number, rowNodes: RowNode[]): IRowNode | undefined;
    extractRowBounds(rowNode: RowNode, index: number): RowBounds | undefined;
    getIndexAtPixel(rowNode: RowNode, pixel: number): number | null;
    createNodeIdPrefix(parentRowNode: RowNode): string | undefined;
    checkOpenByDefault(rowNode: RowNode): void;
}
