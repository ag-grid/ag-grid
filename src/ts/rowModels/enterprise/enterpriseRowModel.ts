
import {IRowModel} from "../../interfaces/iRowModel";
import {RowNode} from "../../entities/rowNode";

export class EnterpriseRowModel implements IRowModel {

    public getRow(index: number): RowNode {
        return null;
    }

    public getRowCount(): number {
        return null;
    }

    public getRowIndexAtPixel(pixel: number): number {
        return 0;
    }

    public getRowCombinedHeight(): number {
        return 0;
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return false;
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {

    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {

    }

    public addItems(items: any[], skipRefresh: boolean): void {

    }

    public isEmpty(): boolean {
        return true;
    }

    public isRowsToRender(): boolean {
        return false;
    }

    public forEachNode(callback: (rowNode: RowNode)=>void): void {
    }

    public getType(): string {
        return null;
    }

}
