import { RowBounds, BeanStub, Column, RowNode, NumberSequence } from "@ag-grid-community/core";
export declare class BlockUtils extends BeanStub {
    private valueService;
    private columnModel;
    private nodeManager;
    private beans;
    private rowHeight;
    private usingTreeData;
    private usingMasterDetail;
    private postConstruct;
    createRowNode(params: {
        group: boolean;
        leafGroup: boolean;
        level: number;
        parent: RowNode;
        field: string;
        rowGroupColumn: Column;
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
    binarySearchForDisplayIndex(displayRowIndex: number, rowNodes: RowNode[]): RowNode | undefined;
    extractRowBounds(rowNode: RowNode, index: number): RowBounds | undefined;
    getIndexAtPixel(rowNode: RowNode, pixel: number): number | null;
    createNodeIdPrefix(parentRowNode: RowNode): string | undefined;
    checkOpenByDefault(rowNode: RowNode): void;
}
