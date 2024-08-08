import type { BeanCollection } from '@ag-grid-community/core';
import { AgColumn } from '@ag-grid-community/core';
import type { RowNode } from '@ag-grid-community/core';
import type { BeanName, IRowNodeStage, NamedBean, StageExecuteParams } from '@ag-grid-community/core';
import { AgProvidedColumnGroup } from '@ag-grid-community/core';
import type { ColGroupDef } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

let createBean = (def: AgProvidedColumnGroup) => def;
class ColumnGroupNode {
    children: Map<string, ColumnGroupNode> = new Map();
    level: number;
    key: string;
    parent?: ColumnGroupNode;
    columns: AgColumn[];
    path: string[];

    constructor(key: string, level: number, parent?: ColumnGroupNode) {
        this.level = level;
        this.key = key;
        this.parent = parent;
        this.path = this.getPath();
    }

    traverse(key: string): ColumnGroupNode {
        const nextGroup = this.children.get(key);
        if (!nextGroup) {
            const newNode = new ColumnGroupNode(key, this.level + 1, this.level > 0 ? this : undefined);
            this.children.set(key, newNode);
            return newNode;
        }

        return nextGroup;
    }

    getPath(): string[] {
        const path: string[] = new Array(this.level);
        let node: ColumnGroupNode = this;
        for (let i = path.length - 1; i >= 0; i--) {
            path[i] = this.key;
            node = node.parent!;
        }
        return path;
    }

    forEachLeafGroup(callback: (group: ColumnGroupNode) => void) {
        if (this.children.size === 0) {
            callback(this);
            return;
        }

        this.children.forEach((child) => {
            child.forEachLeafGroup(callback);
        });
    }

    getProvidedColumnGroup(): AgProvidedColumnGroup {
        const def: ColGroupDef = {
            groupId: this.key,
            headerName: this.key,
            children: [],
        };
        const group = createBean(new AgProvidedColumnGroup(def, this.key, false, this.level));
        const children: (AgColumn | AgProvidedColumnGroup)[] = [];
        let next;
        const iterator = this.children.values();
        while ((next = iterator.next()?.value) != null) {
            children.push(next.getProvidedColumnGroup());
        }
        if (this.columns) {
            // add the func cols back in
            children.push(...this.columns);
        }
        children.forEach((child) => child.setOriginalParent(group));
        group.setChildren(children);
        return group;
    }

    setColumns(columns: AgColumn[]) {
        this.columns = columns;
    }
}

export class PivotStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName: BeanName = 'pivotStage';

    private beans: BeanCollection;

    wireBeans(beans: BeanCollection) {
        this.beans = beans;
        createBean = this.createBean.bind(this);
    }

    execute(params: StageExecuteParams<any>) {
        const pivotCols = this.beans.funcColsService.getPivotColumns();
        if (!pivotCols.length) {
            return;
        }

        const pivotRoot = new ColumnGroupNode(null!, 0);

        params.rowNode.allLeafChildren!.forEach((rowNode) => {
            rowNode.parent!.childrenMapped = {};
        });

        const aggFuncs = this.beans.funcColsService.getValueColumns();
        const allCols: AgColumn[] = [];
        const allColsMap: { [key: string]: AgColumn } = {};

        params.rowNode.allLeafChildren!.forEach((rowNode) => {
            let parentChildMapped = rowNode.parent!.childrenMapped!;

            let node: ColumnGroupNode = pivotRoot;
            for (let i = 0; i < pivotCols.length; i++) {
                const pivotCol = pivotCols[i];
                const pivotKey = this.beans.valueService.getValue(pivotCol, rowNode);
                node = node.traverse(pivotKey);

                if (pivotCols.length - 1 === i) {
                    parentChildMapped[pivotKey] ??= [];
                    parentChildMapped[pivotKey].push(rowNode);
                    continue;
                }
                parentChildMapped[pivotKey] ??= Object.create(null);
                parentChildMapped = parentChildMapped[pivotKey];
            }

            if (node.columns == null) {
                const path = node.getPath();
                const funcCols = aggFuncs.map((col) => {
                    const headerName = this.beans.columnNameService.getDisplayNameForColumn(col, 'header') ?? node.key;
                    const colId = `${node.key}-${col.getColId()}`;
                    const colDef = {
                        headerName,
                        field: node.key,
                        colId,
                        aggFunc: col.getAggFunc(),
                        pivotKeys: path,
                        pivotValueColumn: col,
                    };
                    const newCol = this.createBean(new AgColumn(colDef, null, colId, false));
                    allColsMap[colId] = newCol;
                    return newCol;
                });
                node.setColumns(funcCols);
                allCols.push(...funcCols);
            }
        });

        // pivotRoot.forEachLeafGroup((group) => {
        //     // console.log(group.level);
        // });

        const tree = Array.from(pivotRoot.children.values()).map((i) => i.getProvidedColumnGroup());
        const treeDepth = pivotCols.length;

        // console.log('aaahed4', tree, treeDepth, allCols, allColsMap, pivotRoot);
        this.beans.pivotResultColsService.overridePrc(
            {
                tree,
                treeDepth,
                list: allCols,
                map: allColsMap,
            },
            'rowModelUpdated'
        );

        // console.log(pivotRoot);
    }
}
