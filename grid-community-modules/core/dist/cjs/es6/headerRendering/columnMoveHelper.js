"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnMoveHelper = void 0;
const direction_1 = require("../constants/direction");
const array_1 = require("../utils/array");
class ColumnMoveHelper {
    static attemptMoveColumns(params) {
        const { isFromHeader, hDirection, xPosition, fromEnter, fakeEvent, pinned, gridOptionsService, columnModel } = params;
        const draggingLeft = hDirection === direction_1.HorizontalDirection.Left;
        const draggingRight = hDirection === direction_1.HorizontalDirection.Right;
        let { allMovingColumns } = params;
        if (isFromHeader) {
            // If the columns we're dragging are the only visible columns of their group, move the hidden ones too
            let newCols = [];
            allMovingColumns.forEach((col) => {
                var _a;
                let movingGroup = null;
                let parent = col.getParent();
                while (parent != null && parent.getDisplayedLeafColumns().length === 1) {
                    movingGroup = parent;
                    parent = parent.getParent();
                }
                if (movingGroup != null) {
                    const isMarryChildren = !!((_a = movingGroup.getColGroupDef()) === null || _a === void 0 ? void 0 : _a.marryChildren);
                    const columnsToMove = isMarryChildren
                        // when marry children is true, we also have to move hidden
                        // columns within the group, so grab them from the `providedColumnGroup`
                        ? movingGroup.getProvidedColumnGroup().getLeafColumns()
                        : movingGroup.getLeafColumns();
                    columnsToMove.forEach((newCol) => {
                        if (!newCols.includes(newCol)) {
                            newCols.push(newCol);
                        }
                    });
                }
                else if (!newCols.includes(col)) {
                    newCols.push(col);
                }
            });
            allMovingColumns = newCols;
        }
        // it is important to sort the moving columns as they are in grid columns, as the list of moving columns
        // could themselves be part of 'married children' groups, which means we need to maintain the order within
        // the moving list.
        const allMovingColumnsOrdered = allMovingColumns.slice();
        columnModel.sortColumnsLikeGridColumns(allMovingColumnsOrdered);
        const validMoves = this.calculateValidMoves({
            movingCols: allMovingColumnsOrdered,
            draggingRight,
            xPosition,
            pinned,
            gridOptionsService,
            columnModel
        });
        // if cols are not adjacent, then this returns null. when moving, we constrain the direction of the move
        // (ie left or right) to the mouse direction. however
        const oldIndex = this.calculateOldIndex(allMovingColumnsOrdered, columnModel);
        if (validMoves.length === 0) {
            return;
        }
        const firstValidMove = validMoves[0];
        // the two check below stop an error when the user grabs a group my a middle column, then
        // it is possible the mouse pointer is to the right of a column while been dragged left.
        // so we need to make sure that the mouse pointer is actually left of the left most column
        // if moving left, and right of the right most column if moving right
        // we check 'fromEnter' below so we move the column to the new spot if the mouse is coming from
        // outside the grid, eg if the column is moving from side panel, mouse is moving left, then we should
        // place the column to the RHS even if the mouse is moving left and the column is already on
        // the LHS. otherwise we stick to the rule described above.
        let constrainDirection = oldIndex !== null && !fromEnter;
        // don't consider 'fromEnter' when dragging header cells, otherwise group can jump to opposite direction of drag
        if (isFromHeader) {
            constrainDirection = oldIndex !== null;
        }
        // if the event was faked by a change in column pin state, then the original location of the column
        // is not reliable for dictating where the column may now be placed.
        if (constrainDirection && !fakeEvent) {
            // only allow left drag if this column is moving left
            if (draggingLeft && firstValidMove >= oldIndex) {
                return;
            }
            // only allow right drag if this column is moving right
            if (draggingRight && firstValidMove <= oldIndex) {
                return;
            }
        }
        // From when we find a move that passes all the rules
        // Remember what that move would look like in terms of displayed cols
        // keep going with further moves until we find a different result in displayed output
        // In this way potentialMoves contains all potential moves over 'hidden' columns
        const displayedCols = columnModel.getAllDisplayedColumns();
        let potentialMoves = [];
        let targetOrder = null;
        for (let i = 0; i < validMoves.length; i++) {
            const move = validMoves[i];
            const order = columnModel.getProposedColumnOrder(allMovingColumnsOrdered, move);
            if (!columnModel.doesOrderPassRules(order)) {
                continue;
            }
            const displayedOrder = order.filter((col) => displayedCols.includes(col));
            if (targetOrder === null) {
                targetOrder = displayedOrder;
            }
            else if (!(0, array_1.areEqual)(displayedOrder, targetOrder)) {
                break; // Stop looking for potential moves if the displayed result changes from the target
            }
            const fragCount = this.groupFragCount(order);
            potentialMoves.push({ move, fragCount });
        }
        if (potentialMoves.length === 0) {
            return;
        }
        // The best move is the move with least group fragmentation
        potentialMoves.sort((a, b) => a.fragCount - b.fragCount);
        return this.moveColumns(allMovingColumns, potentialMoves[0].move, 'uiColumnMoved', false, columnModel);
    }
    static moveColumns(columns, toIndex, source, finished, columnModel) {
        columnModel.moveColumns(columns, toIndex, source, finished);
        return finished ? null : { columns, toIndex };
    }
    // returns the index of the first column in the list ONLY if the cols are all beside
    // each other. if the cols are not beside each other, then returns null
    static calculateOldIndex(movingCols, columnModel) {
        const gridCols = columnModel.getAllGridColumns();
        const indexes = (0, array_1.sortNumerically)(movingCols.map(col => gridCols.indexOf(col)));
        const firstIndex = indexes[0];
        const lastIndex = (0, array_1.last)(indexes);
        const spread = lastIndex - firstIndex;
        const gapsExist = spread !== indexes.length - 1;
        return gapsExist ? null : firstIndex;
    }
    // A measure of how fragmented in terms of groups an order of columns is
    static groupFragCount(columns) {
        function parents(col) {
            let result = [];
            let parent = col.getOriginalParent();
            while (parent != null) {
                result.push(parent);
                parent = parent.getOriginalParent();
            }
            return result;
        }
        let count = 0;
        for (let i = 0; i < columns.length - 1; i++) {
            let a = parents(columns[i]);
            let b = parents(columns[i + 1]);
            // iterate over the longest one
            [a, b] = a.length > b.length ? [a, b] : [b, a];
            a.forEach((parent) => {
                if (b.indexOf(parent) === -1) {
                    count++; // More fragmented if other column doesn't share the parent
                }
            });
        }
        return count;
    }
    static calculateValidMoves(params) {
        const { movingCols, draggingRight, xPosition, pinned, gridOptionsService, columnModel } = params;
        const isMoveBlocked = gridOptionsService.get('suppressMovableColumns') || movingCols.some(col => col.getColDef().suppressMovable);
        if (isMoveBlocked) {
            return [];
        }
        // this is the list of cols on the screen, so it's these we use when comparing the x mouse position
        const allDisplayedCols = columnModel.getDisplayedColumns(pinned);
        // but this list is the list of all cols, when we move a col it's the index within this list that gets used,
        // so the result we return has to be and index location for this list
        const allGridCols = columnModel.getAllGridColumns();
        const movingDisplayedCols = allDisplayedCols.filter(col => (0, array_1.includes)(movingCols, col));
        const otherDisplayedCols = allDisplayedCols.filter(col => !(0, array_1.includes)(movingCols, col));
        const otherGridCols = allGridCols.filter(col => !(0, array_1.includes)(movingCols, col));
        // work out how many DISPLAYED columns fit before the 'x' position. this gives us the displayIndex.
        // for example, if cols are a,b,c,d and we find a,b fit before 'x', then we want to place the moving
        // col between b and c (so that it is under the mouse position).
        let displayIndex = 0;
        let availableWidth = xPosition;
        // if we are dragging right, then the columns will be to the left of the mouse, so we also want to
        // include the width of the moving columns
        if (draggingRight) {
            let widthOfMovingDisplayedCols = 0;
            movingDisplayedCols.forEach(col => widthOfMovingDisplayedCols += col.getActualWidth());
            availableWidth -= widthOfMovingDisplayedCols;
        }
        if (availableWidth > 0) {
            // now count how many of the displayed columns will fit to the left
            for (let i = 0; i < otherDisplayedCols.length; i++) {
                const col = otherDisplayedCols[i];
                availableWidth -= col.getActualWidth();
                if (availableWidth < 0) {
                    break;
                }
                displayIndex++;
            }
            // trial and error, if going right, we adjust by one, i didn't manage to quantify why, but it works
            if (draggingRight) {
                displayIndex++;
            }
        }
        // the display index is with respect to all the showing columns, however when we move, it's with
        // respect to all grid columns, so we need to translate from display index to grid index
        let firstValidMove;
        if (displayIndex > 0) {
            const leftColumn = otherDisplayedCols[displayIndex - 1];
            firstValidMove = otherGridCols.indexOf(leftColumn) + 1;
        }
        else {
            firstValidMove = otherGridCols.indexOf(otherDisplayedCols[0]);
            if (firstValidMove === -1) {
                firstValidMove = 0;
            }
        }
        const validMoves = [firstValidMove];
        const numberComparator = (a, b) => a - b;
        // add in other valid moves due to hidden columns and married children. for example, a particular
        // move might break a group that has married children (so move isn't valid), however there could
        // be hidden columns (not displayed) that we could jump over to make the move valid. because
        // they are hidden, user doesn't see any different, however it allows moves that would otherwise
        // not work. for example imagine a group with 9 columns and all columns are hidden except the
        // middle one (so 4 hidden to left, 4 hidden to right), then when moving 'firstValidMove' will
        // be relative to the not-shown column, however we need to consider the move jumping over all the
        // hidden children. if we didn't do this, then if the group just described was at the end (RHS) of the
        // grid, there would be no way to put a column after it (as the grid would only consider beside the
        // visible column, which would fail valid move rules).
        if (draggingRight) {
            // if dragging right, then we add all the additional moves to the right. so in other words
            // if the next move is not valid, find the next move to the right that is valid.
            let pointer = firstValidMove + 1;
            const lastIndex = allGridCols.length - 1;
            while (pointer <= lastIndex) {
                validMoves.push(pointer);
                pointer++;
            }
            // adding columns here means the order is now messed up
            validMoves.sort(numberComparator);
        }
        else {
            // if dragging left we do the reverse of dragging right, we add in all the valid moves to the
            // left. however we also have to consider moves to the right for all hidden columns first.
            // (this logic is hard to reason with, it was worked out with trial and error,
            // more observation rather than science).
            // add moves to the right
            let pointer = firstValidMove;
            const lastIndex = allGridCols.length - 1;
            let displacedCol = allGridCols[pointer];
            // takes into account visible=false and group=closed, ie it is not displayed
            while (pointer <= lastIndex && allDisplayedCols.indexOf(displacedCol) < 0) {
                pointer++;
                validMoves.push(pointer);
                displacedCol = allGridCols[pointer];
            }
            // add moves to the left
            pointer = firstValidMove - 1;
            const firstDisplayIndex = 0;
            while (pointer >= firstDisplayIndex) {
                validMoves.push(pointer);
                pointer--;
            }
            // adding columns here means the order is now messed up
            validMoves.sort(numberComparator).reverse();
        }
        return validMoves;
    }
    static normaliseX(x, pinned, fromKeyboard, gridOptionsService, ctrlsService) {
        const eViewport = ctrlsService.getHeaderRowContainerCtrl(pinned).getViewport();
        if (fromKeyboard) {
            x -= eViewport.getBoundingClientRect().left;
        }
        // flip the coordinate if doing RTL
        if (gridOptionsService.get('enableRtl')) {
            const clientWidth = eViewport.clientWidth;
            x = clientWidth - x;
        }
        // adjust for scroll only if centre container (the pinned containers don't scroll)
        if (pinned == null) {
            x += ctrlsService.getCenterRowContainerCtrl().getCenterViewportScrollLeft();
        }
        return x;
    }
}
exports.ColumnMoveHelper = ColumnMoveHelper;
