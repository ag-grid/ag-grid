import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { AgColumn } from '../entities/agColumn';
import { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
export declare class ColumnFactory extends BeanStub implements NamedBean {
    beanName: "columnFactory";
    private dataTypeService?;
    wireBeans(beans: BeanCollection): void;
    createColumnTree(defs: (ColDef | ColGroupDef)[] | null, primaryColumns: boolean, existingTree: (AgColumn | AgProvidedColumnGroup)[] | undefined, source: ColumnEventType): {
        columnTree: (AgColumn | AgProvidedColumnGroup)[];
        treeDept: number;
    };
    private extractExistingTreeData;
    createForAutoGroups(autoGroupCols: AgColumn[], liveTree: (AgColumn | AgProvidedColumnGroup)[]): [(AgColumn | AgProvidedColumnGroup)[], number];
    private findDepth;
    private balanceColumnTree;
    private findMaxDept;
    private recursivelyCreateColumns;
    private createColumnGroup;
    private createMergedColGroupDef;
    private createColumn;
    applyColumnState(column: AgColumn, colDef: ColDef, source: ColumnEventType): void;
    private findExistingColumn;
    private findExistingGroup;
    addColumnDefaultAndTypes(colDef: ColDef, colId: string): ColDef;
    private updateColDefAndGetColumnType;
    private assignColumnTypes;
    private isColumnGroup;
}
export declare function depthFirstOriginalTreeSearch(parent: AgProvidedColumnGroup | null, tree: (AgColumn | AgProvidedColumnGroup)[], callback: (treeNode: AgColumn | AgProvidedColumnGroup, parent: AgProvidedColumnGroup | null) => void): void;
