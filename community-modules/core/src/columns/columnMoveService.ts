import { Autowired, Bean } from "../context/context";
import { Column } from "../entities/column";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { depthFirstOriginalTreeSearch } from "./columnFactory";
import { ColumnModel } from "./columnModel";

@Bean('columnMoveService')
export class ColumnMoveService {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    public doesMovePassMarryChildren(allColumnsCopy: Column[]): boolean {
        let rulePassed = true;
        const gridBalancedTree = this.columnModel.getGridBalancedTree();

        depthFirstOriginalTreeSearch(null, gridBalancedTree, child => {
            if (!(child instanceof ProvidedColumnGroup)) { return; }

            const columnGroup = child;
            const colGroupDef = columnGroup.getColGroupDef();
            const marryChildren = colGroupDef && colGroupDef.marryChildren;

            if (!marryChildren) { return; }

            const newIndexes: number[] = [];
            columnGroup.getLeafColumns().forEach(col => {
                const newColIndex = allColumnsCopy.indexOf(col);
                newIndexes.push(newColIndex);
            });

            const maxIndex = Math.max.apply(Math, newIndexes);
            const minIndex = Math.min.apply(Math, newIndexes);

            // spread is how far the first column in this group is away from the last column
            const spread = maxIndex - minIndex;
            const maxSpread = columnGroup.getLeafColumns().length - 1;

            // if the columns
            if (spread > maxSpread) {
                rulePassed = false;
            }

            // console.log(`maxIndex = ${maxIndex}, minIndex = ${minIndex}, spread = ${spread}, maxSpread = ${maxSpread}, fail = ${spread > (count-1)}`)
            // console.log(allColumnsCopy.map( col => col.getColDef().field).join(','));
        });

        return rulePassed;
    }

    public placeLockedColumns(cols: Column[]): Column[] {
        const left: Column[] = [];
        const normal: Column[] = [];
        const right: Column[] = [];
        cols.forEach((col) => {
            const position = col.getColDef().lockPosition;
            if (position === 'right') {
                right.push(col);
            } else if (position === 'left' || position === true) {
                left.push(col);
            } else {
                normal.push(col);
            }
        });
        return [...left, ...normal, ...right];
    }

}