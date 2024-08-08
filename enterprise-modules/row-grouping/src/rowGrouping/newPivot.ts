import { BeanCollection } from '@ag-grid-community/core';
import { AgColumn } from '@ag-grid-community/core';
import { RowNode } from '@ag-grid-community/core';
import { ColumnGroup } from '@ag-grid-community/core';
import { BeanName, BeanStub, IRowNodeStage, NamedBean, StageExecuteParams } from '@ag-grid-community/core';

type Node = ColumnGroupNode | AgColumn;
class ColumnGroupNode {
    children: Map<string, Node> = new Map();
    columnGroup: ColumnGroup;
    nodes: RowNode[] = [];
    level: number;

    constructor(columnGroup: ColumnGroup, level: number) {
        this.columnGroup = columnGroup;
        this.level = level;
    }

    addNode(node: RowNode) {
        this.nodes.push(node);
    }

    traverse(path: string[]): ColumnGroupNode | null {
        if (path.length === this.level) {
            return this;
        }

        const nextGroup = this.children.get(path[this.level]);
        if (!nextGroup) {
            const newNode = new ColumnGroupNode(this.columnGroup, this.level + 1);
            this.children.set(path[this.level], newNode);
            return newNode.traverse(path);
        }

        if (nextGroup instanceof AgColumn) {
            throw new Error('ag-Grid: Oops!');
        }

        return nextGroup.traverse(path);
    }
}

export class NewPivot extends BeanStub implements NamedBean, IRowNodeStage {
    beanName: BeanName = 'pivotStage';

    private beans: BeanCollection;

    wireBeans(beans: BeanCollection) {
        this.beans = beans;
    }

    execute(params: StageExecuteParams<any>) {
        const pivotCols = this.beans.funcColsService.getPivotColumns();
        if (!pivotCols.length) {
            return;
        }

        const pivotRoot = new ColumnGroupNode(null!, 0);

        params.rowNode.allLeafChildren!.forEach((rowNode) => {
            const pivotKeys = pivotCols.map((col) => this.beans.valueService.getValue(col, rowNode));
            const pivotNode = pivotRoot.traverse(pivotKeys);
            pivotNode?.addNode(rowNode);
        });
        console.log(pivotRoot);
    }
}
