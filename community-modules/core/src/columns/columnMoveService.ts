import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import { _moveInArray } from '../utils/array';
import { _warnOnce } from '../utils/function';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import { depthFirstOriginalTreeSearch } from './columnFactory';
import type { ColKey, ColumnModel } from './columnModel';

enum Direction {
    LEFT = -1,
    NONE = 0,
    RIGHT = 1,
}
export class ColumnMoveService extends BeanStub implements NamedBean {
    beanName = 'columnMoveService' as const;

    private columnModel: ColumnModel;
    private columnAnimationService: ColumnAnimationService;
    private eventDispatcher: ColumnEventDispatcher;

    public wireBeans(beans: BeanCollection): void {
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
            _warnOnce('tried to insert columns in invalid location, toIndex = ', toIndex);
            _warnOnce('remember that you should not count the moving columns when calculating the new index');
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

    private doesMovePassRules(columnsToMove: AgColumn[], toIndex: number): boolean {
        // make a copy of what the grid columns would look like after the move
        const proposedColumnOrder = this.getProposedColumnOrder(columnsToMove, toIndex);
        return this.doesOrderPassRules(proposedColumnOrder);
    }

    public getMoveTargetIndex(
        currentColumns: AgColumn[] | null,
        lastHoveredColumn: AgColumn,
        isBefore: boolean
    ): number | null {
        if (!lastHoveredColumn || !currentColumns) {
            return null;
        }
        // if the target col is in the cols to be moved, no index to move.
        if (currentColumns.indexOf(lastHoveredColumn) !== -1) {
            return null;
        }

        const targetColumnIndex = this.columnModel.getCols().indexOf(lastHoveredColumn);
        const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        const diff = this.getMoveDiff(currentColumns, adjustedTarget);

        return adjustedTarget - diff;
    }

    private getMoveDiff(currentColumns: AgColumn[] | null, end: number): number {
        const allColumns = this.columnModel.getCols();

        if (!currentColumns) {
            return 0;
        }

        const targetColumn = currentColumns[0];
        const span = currentColumns.length;

        const currentIndex = allColumns.indexOf(targetColumn);

        if (currentIndex < end) {
            return span;
        }

        return 0;
    }

    public doesOrderPassRules(gridOrder: AgColumn[]) {
        if (!this.doesMovePassMarryChildren(gridOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(gridOrder)) {
            return false;
        }
        return true;
    }

    public getProposedColumnOrder(columnsToMove: AgColumn[], toIndex: number): AgColumn[] {
        const gridColumns = this.columnModel.getCols();
        const proposedColumnOrder = gridColumns.slice();
        _moveInArray(proposedColumnOrder, columnsToMove as AgColumn[], toIndex);
        return proposedColumnOrder;
    }

    private doesMovePassLockedPositions(proposedColumnOrder: AgColumn[]): boolean {
        const lockPositionToPlacement = (position: ColDef['lockPosition']) => {
            if (!position) {
                return Direction.NONE;
            }
            return position === 'left' || position === true ? Direction.LEFT : Direction.RIGHT;
        };

        const isRtl = this.gos.get('enableRtl');
        let lastPlacement = isRtl ? Direction.RIGHT : Direction.LEFT;
        let rulePassed = true;
        proposedColumnOrder.forEach((col) => {
            const placement = lockPositionToPlacement(col.getColDef().lockPosition);
            if (isRtl) {
                if (placement > lastPlacement) {
                    // If placement goes up, we're not in the correct order
                    rulePassed = false;
                }
            } else {
                if (placement < lastPlacement) {
                    // If placement goes down, we're not in the correct order
                    rulePassed = false;
                }
            }
            lastPlacement = placement;
        });

        return rulePassed;
    }

    public doesMovePassMarryChildren(allColumnsCopy: AgColumn[]): boolean {
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

    public placeLockedColumns(cols: AgColumn[]): AgColumn[] {
        const left: AgColumn[] = [];
        const normal: AgColumn[] = [];
        const right: AgColumn[] = [];
        cols.forEach((col: AgColumn) => {
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
