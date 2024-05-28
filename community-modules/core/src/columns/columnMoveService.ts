import { BeanStub } from '../context/beanStub';
import type { BeanCollection, BeanName } from '../context/context';
import type { ColDef } from '../entities/colDef';
import type { InternalColumn } from '../entities/column';
import { isProvidedColumnGroup } from '../entities/providedColumnGroup';
import type { ColumnEventType } from '../events';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import { _moveInArray } from '../utils/array';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import { depthFirstOriginalTreeSearch } from './columnFactory';
import type { ColKey, ColumnModel } from './columnModel';

export class ColumnMoveService extends BeanStub {
    beanName: BeanName = 'columnMoveService';

    private columnModel: ColumnModel;
    private columnAnimationService: ColumnAnimationService;
    private eventDispatcher: ColumnEventDispatcher;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.columnModel = beans.columnModel;
        this.columnAnimationService = beans.columnAnimationService;
        this.eventDispatcher = beans.columnEventDispatcher;
    }

    public moveColumnByIndex(fromIndex: number, toIndex: number, source: ColumnEventType): void {
        const gridColumns = this.columnModel.getCols();
        if (!gridColumns) {
            return;
        }

        const column = gridColumns[fromIndex];
        this.moveColumns([column], toIndex, source);
    }

    public moveColumns(
        columnsToMoveKeys: ColKey[],
        toIndex: number,
        source: ColumnEventType,
        finished: boolean = true
    ): void {
        const gridColumns = this.columnModel.getCols();
        if (!gridColumns) {
            return;
        }

        this.columnAnimationService.start();

        if (toIndex > gridColumns.length - columnsToMoveKeys.length) {
            console.warn('AG Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn(
                'AG Grid: remember that you should not count the moving columns when calculating the new index'
            );
            return;
        }

        // we want to pull all the columns out first and put them into an ordered list
        const movedColumns = this.columnModel.getColsForKeys(columnsToMoveKeys);
        const failedRules = !this.doesMovePassRules(movedColumns, toIndex);

        if (failedRules) {
            return;
        }

        this.columnModel.moveInCols(movedColumns, toIndex, source);

        this.eventDispatcher.columnMoved({ movedColumns, source, toIndex, finished });
        this.columnAnimationService.finish();
    }

    private doesMovePassRules(columnsToMove: InternalColumn[], toIndex: number): boolean {
        // make a copy of what the grid columns would look like after the move
        const proposedColumnOrder = this.getProposedColumnOrder(columnsToMove, toIndex);
        return this.doesOrderPassRules(proposedColumnOrder);
    }

    public doesOrderPassRules(gridOrder: InternalColumn[]) {
        if (!this.doesMovePassMarryChildren(gridOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(gridOrder)) {
            return false;
        }
        return true;
    }

    public getProposedColumnOrder(columnsToMove: InternalColumn[], toIndex: number): InternalColumn[] {
        const gridColumns = this.columnModel.getCols();
        const proposedColumnOrder = gridColumns.slice();
        _moveInArray(proposedColumnOrder, columnsToMove as InternalColumn[], toIndex);
        return proposedColumnOrder;
    }

    private doesMovePassLockedPositions(proposedColumnOrder: InternalColumn[]): boolean {
        // Placement is a number indicating 'left' 'center' or 'right' as 0 1 2
        let lastPlacement = 0;
        let rulePassed = true;
        const lockPositionToPlacement = (position: ColDef['lockPosition']) => {
            if (!position) {
                // false or undefined
                return 1;
            }
            if (position === true) {
                return 0;
            }
            return position === 'left' ? 0 : 2; // Otherwise 'right'
        };

        proposedColumnOrder.forEach((col) => {
            const placement = lockPositionToPlacement(col.getColDef().lockPosition);
            if (placement < lastPlacement) {
                // If placement goes down, we're not in the correct order
                rulePassed = false;
            }
            lastPlacement = placement;
        });

        return rulePassed;
    }

    public doesMovePassMarryChildren(allColumnsCopy: InternalColumn[]): boolean {
        let rulePassed = true;
        const gridBalancedTree = this.columnModel.getColTree();

        depthFirstOriginalTreeSearch(null, gridBalancedTree, (child) => {
            if (!isProvidedColumnGroup(child)) {
                return;
            }

            const columnGroup = child;
            const colGroupDef = columnGroup.getColGroupDef();
            const marryChildren = colGroupDef && colGroupDef.marryChildren;

            if (!marryChildren) {
                return;
            }

            const newIndexes: number[] = [];
            columnGroup.getLeafColumns().forEach((col) => {
                const newColIndex = allColumnsCopy.indexOf(col);
                newIndexes.push(newColIndex);
            });

            // eslint-disable-next-line prefer-spread
            const maxIndex = Math.max.apply(Math, newIndexes);
            // eslint-disable-next-line prefer-spread
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

    public placeLockedColumns(cols: InternalColumn[]): InternalColumn[] {
        const left: InternalColumn[] = [];
        const normal: InternalColumn[] = [];
        const right: InternalColumn[] = [];
        cols.forEach((col: InternalColumn) => {
            const position = col.getColDef().lockPosition;
            if (position === 'right') {
                right.push(col);
            } else if (position === 'left' || position === true) {
                left.push(col);
            } else {
                normal.push(col);
            }
        });

        const isRtl = this.gos.get('enableRtl');
        if (isRtl) {
            return [...right, ...normal, ...left];
        }

        return [...left, ...normal, ...right];
    }
}
