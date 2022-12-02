import { IHeaderColumn } from "../entities/iHeaderColumn";
import { ColumnGroup } from "../entities/columnGroup";
import { IProvidedColumn } from "../entities/iProvidedColumn";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Column } from "../entities/column";
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { attrToNumber } from "../utils/generic";
import { ColDef } from "../entities/colDef";

// takes in a list of columns, as specified by the column definitions, and returns column groups
@Bean('columnUtils')
export class ColumnUtils extends BeanStub {

    public calculateColMinWidth(colDef: ColDef): number {
        return colDef.minWidth != null ? colDef.minWidth : this.environment.getMinColWidth();
    }

    public calculateColMaxWidth(colDef: ColDef): number {
        return colDef.maxWidth != null ? colDef.maxWidth : Number.MAX_SAFE_INTEGER;
    }

    public calculateColInitialWidth(colDef: ColDef): number {
        const minColWidth = this.calculateColMinWidth(colDef);
        const maxColWidth = this.calculateColMaxWidth(colDef);

        let width : number;
        const colDefWidth = attrToNumber(colDef.width);
        const colDefInitialWidth = attrToNumber(colDef.initialWidth);

        if (colDefWidth != null) {
            width = colDefWidth;
        } else if (colDefInitialWidth != null) {
            width = colDefInitialWidth;
        } else {
            width = 200;
        }

        return Math.max(Math.min(width, maxColWidth), minColWidth);
    }

    public getOriginalPathForColumn(column: Column, originalBalancedTree: IProvidedColumn[]): ProvidedColumnGroup[] | null {
        const result: ProvidedColumnGroup[] = [];
        let found = false;

        const recursePath = (balancedColumnTree: IProvidedColumn[], dept: number): void => {
            for (let i = 0; i < balancedColumnTree.length; i++) {
                if (found) { return; }
                    // quit the search, so 'result' is kept with the found result

                const node = balancedColumnTree[i];
                if (node instanceof ProvidedColumnGroup) {
                    const nextNode = node;
                    recursePath(nextNode.getChildren(), dept + 1);
                    result[dept] = node;
                } else if (node === column) {
                    found = true;
                }
            }
        };

        recursePath(originalBalancedTree, 0);

        // we should always find the path, but in case there is a bug somewhere, returning null
        // will make it fail rather than provide a 'hard to track down' bug
        return found ? result : null;
    }

    public depthFirstOriginalTreeSearch(parent: ProvidedColumnGroup | null, tree: IProvidedColumn[], callback: (treeNode: IProvidedColumn, parent: ProvidedColumnGroup | null) => void): void {
        if (!tree) { return; }

        tree.forEach((child: IProvidedColumn) => {
            if (child instanceof ProvidedColumnGroup) {
                this.depthFirstOriginalTreeSearch(child, child.getChildren(), callback);
            }
            callback(child, parent);
        });

    }

    public depthFirstAllColumnTreeSearch(tree: IHeaderColumn[] | null, callback: (treeNode: IHeaderColumn) => void): void {
        if (!tree) { return; }

        tree.forEach((child: IHeaderColumn) => {
            if (child instanceof ColumnGroup) {
                this.depthFirstAllColumnTreeSearch(child.getChildren(), callback);
            }
            callback(child);
        });

    }

    public depthFirstDisplayedColumnTreeSearch(tree: IHeaderColumn[] | null, callback: (treeNode: IHeaderColumn) => void): void {
        if (!tree) { return; }

        tree.forEach((child: IHeaderColumn) => {
            if (child instanceof ColumnGroup) {
                this.depthFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
            }
            callback(child);
        });
    }
}
