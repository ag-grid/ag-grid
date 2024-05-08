import { Context } from "../context/context";
import { Column, ColumnInstanceId } from "../entities/column";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { depthFirstOriginalTreeSearch } from "./columnFactory";

export class ColumnUtilsFeature {

    // Possible candidate for reuse (alot of recursive traversal duplication)
    public getColumnsFromTree(rootColumns: IProvidedColumn[]): Column[] {
        const result: Column[] = [];

        const recursiveFindColumns = (childColumns: IProvidedColumn[]): void => {
            for (let i = 0; i < childColumns.length; i++) {
                const child = childColumns[i];
                if (child instanceof Column) {
                    result.push(child);
                } else if (child instanceof ProvidedColumnGroup) {
                    recursiveFindColumns(child.getChildren());
                }
            }
        };

        recursiveFindColumns(rootColumns);

        return result;
    }

    public getWidthOfColsInList(columnList: Column[]) {
        return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
    }

    public destroyColumns(context: Context, oldTree: IProvidedColumn[] | null, newTree?: IProvidedColumn[] | null): void {
        const oldObjectsById: {[id: ColumnInstanceId]: IProvidedColumn | null} = {};

        if (!oldTree) { return; }

        // add in all old columns to be destroyed
        depthFirstOriginalTreeSearch(null, oldTree, child => {
            oldObjectsById[child.getInstanceId()] = child;
        });

        // however we don't destroy anything in the new tree. if destroying the grid, there is no new tree
        if (newTree) {
            depthFirstOriginalTreeSearch(null, newTree, child => {
                oldObjectsById[child.getInstanceId()] = null;
            });
        }

        // what's left can be destroyed
        const colsToDestroy = Object.values(oldObjectsById).filter(item => item != null);
        context.destroyBeans(colsToDestroy);
    }
}