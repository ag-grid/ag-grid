import { ColDef, ColGroupDef } from "../entities/colDef";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { ColumnEventType } from '../events';
export declare class ColumnFactory extends BeanStub {
    private dataTypeService;
    private logger;
    private setBeans;
    createColumnTree(defs: (ColDef | ColGroupDef)[] | null, primaryColumns: boolean, existingTree: IProvidedColumn[] | undefined, source: ColumnEventType): {
        columnTree: IProvidedColumn[];
        treeDept: number;
    };
    private extractExistingTreeData;
    createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: IProvidedColumn[]): IProvidedColumn[];
    private createAutoGroupTreeItem;
    private findDepth;
    private balanceColumnTree;
    private findMaxDept;
    private recursivelyCreateColumns;
    private createColumnGroup;
    private createMergedColGroupDef;
    private createColumn;
    applyColumnState(column: Column, colDef: ColDef, source: ColumnEventType): void;
    private findExistingColumn;
    private findExistingGroup;
    addColumnDefaultAndTypes(colDef: ColDef, colId: string): ColDef;
    private assignColumnTypes;
    private isColumnGroup;
}
export declare function depthFirstOriginalTreeSearch(parent: ProvidedColumnGroup | null, tree: IProvidedColumn[], callback: (treeNode: IProvidedColumn, parent: ProvidedColumnGroup | null) => void): void;
