import { IHeaderColumn } from "../entities/iHeaderColumn";
import { IProvidedColumn } from "../entities/iProvidedColumn";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { ColDef } from "../entities/colDef";
export declare class ColumnUtils extends BeanStub {
    calculateColMinWidth(colDef: ColDef): number;
    calculateColMaxWidth(colDef: ColDef): number;
    calculateColInitialWidth(colDef: ColDef): number;
    getOriginalPathForColumn(column: Column, originalBalancedTree: IProvidedColumn[]): ProvidedColumnGroup[] | null;
    depthFirstOriginalTreeSearch(parent: ProvidedColumnGroup | null, tree: IProvidedColumn[], callback: (treeNode: IProvidedColumn, parent: ProvidedColumnGroup | null) => void): void;
    depthFirstAllColumnTreeSearch(tree: IHeaderColumn[] | null, callback: (treeNode: IHeaderColumn) => void): void;
    depthFirstDisplayedColumnTreeSearch(tree: IHeaderColumn[] | null, callback: (treeNode: IHeaderColumn) => void): void;
}
