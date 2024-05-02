import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";

export class ColumnUtilsFeature extends BeanStub {

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
}