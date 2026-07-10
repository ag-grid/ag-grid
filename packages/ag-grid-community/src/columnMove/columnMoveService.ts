import type { HorizontalDirection } from 'ag-stack';
import { _last, _moveInArray, _removeFromArray } from 'ag-stack';

import { _setColsVisible } from '../columns/columnStateUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridDragSource } from '../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../dragAndDrop/dragAndDropService';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { isColumnGroup } from '../entities/agColumnGroup';
import type { ColDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { DragItem } from '../interfaces/iDragItem';
import { BodyDropTarget } from './columnDrag/bodyDropTarget';
import { doesMovePassMarryChildren } from './columnMoveUtils';
import { attemptMoveColumns, clientXToSectionX, normaliseX, setColumnsMoving } from './internalColumnMoveUtils';

enum MoveDirection {
    LEFT = -1,
    NONE = 0,
    RIGHT = 1,
}
export class ColumnMoveService extends BeanStub implements NamedBean {
    beanName = 'colMoves' as const;

    public moveColumnByIndex(fromIndex: number, toIndex: number, source: ColumnEventType): void {
        const column = this.beans.colModel.colsList[fromIndex];
        this.moveColumns([column], toIndex, source);
    }

    public moveColumns(
        columnsToMoveKeys: ColKey[],
        toIndex: number,
        source: ColumnEventType,
        finished: boolean = true
    ): void {
        const { colModel, visibleCols } = this.beans;
        const colAnimation = this.beans.colAnimation;
        const gridColumns = colModel.colsList;

        if (toIndex > gridColumns.length - columnsToMoveKeys.length) {
            // Trying to insert in invalid position
            this.warn(30, { toIndex });
            return;
        }

        colAnimation?.start();
        // we want to pull all the columns out first and put them into an ordered list
        const movedColumns: AgColumn[] = [];
        for (let i = 0, len = columnsToMoveKeys.length; i < len; ++i) {
            const col = colModel.getCol(columnsToMoveKeys[i]);
            if (col) {
                movedColumns.push(col);
            }
        }

        if (this.doesMovePassRules(movedColumns, toIndex)) {
            _moveInArray(colModel.colsList, movedColumns, toIndex);
            colModel.markColsListIndexDirty();
            visibleCols.refresh(source, false);
            this.eventSvc.dispatchEvent({
                type: 'columnMoved',
                columns: movedColumns,
                column: movedColumns.length === 1 ? movedColumns[0] : null,
                toIndex,
                finished,
                source,
            });
        }

        colAnimation?.finish();
    }

    private doesMovePassRules(columnsToMove: AgColumn[], toIndex: number): boolean {
        // make a copy of what the grid columns would look like after the move
        const proposedColumnOrder = this.getProposedColumnOrder(columnsToMove, toIndex);
        return this.doesOrderPassRules(proposedColumnOrder);
    }

    public doesOrderPassRules(gridOrder: AgColumn[]) {
        const { colModel, gos } = this.beans;
        if (colModel.hasMarryChildren && !doesMovePassMarryChildren(gridOrder, colModel.colsTree)) {
            return false;
        }

        const doesMovePassLockedPositions = (proposedColumnOrder: AgColumn[]) => {
            const lockPositionToPlacement = (position: ColDef['lockPosition']) => {
                if (!position) {
                    return MoveDirection.NONE;
                }
                return position === 'left' || position === true ? MoveDirection.LEFT : MoveDirection.RIGHT;
            };

            const isRtl = gos.get('enableRtl');
            let lastPlacement = isRtl ? MoveDirection.RIGHT : MoveDirection.LEFT;
            let rulePassed = true;
            for (const col of proposedColumnOrder) {
                const placement = lockPositionToPlacement(col.colDef.lockPosition);
                if (isRtl) {
                    if (placement > lastPlacement) {
                        // If placement goes up, we're not in the correct order
                        rulePassed = false;
                    }
                } else if (placement < lastPlacement) {
                    // If placement goes down, we're not in the correct order
                    rulePassed = false;
                }
                lastPlacement = placement;
            }

            return rulePassed;
        };

        if (!doesMovePassLockedPositions(gridOrder)) {
            return false;
        }
        return true;
    }

    public getProposedColumnOrder(columnsToMove: AgColumn[], toIndex: number): AgColumn[] {
        const proposedColumnOrder = this.beans.colModel.colsList.slice();
        _moveInArray(proposedColumnOrder, columnsToMove, toIndex);
        return proposedColumnOrder;
    }

    public createBodyDropTarget(dropContainer: HTMLElement): BodyDropTarget {
        return new BodyDropTarget(dropContainer);
    }

    public moveHeader(
        hDirection: HorizontalDirection,
        eGui: HTMLElement,
        column: AgColumn | AgColumnGroup,
        pinned: ColumnPinnedType,
        bean: BeanStub
    ): void {
        const { ctrlsSvc, gos, colModel, visibleCols, focusSvc } = this.beans;
        const rect = eGui.getBoundingClientRect();
        const left = rect.left;
        const isGroup = isColumnGroup(column);
        const width = isGroup ? rect.width : column.getActualWidth();
        const isRtl = gos.get('enableRtl');
        const isLeft = (hDirection === 'left') !== isRtl;

        const screenX = isLeft ? left - 20 : left + width + 20;
        const sectionX = clientXToSectionX(screenX, pinned, ctrlsSvc);
        const xPosition = normaliseX({ x: sectionX, pinned, isRtl, ctrlsSvc });
        const headerPosition = focusSvc.focusedHeader;

        attemptMoveColumns({
            allMovingColumns: isGroup ? column.getLeafColumns() : [column],
            isFromHeader: true,
            fromLeft: hDirection === 'right',
            xPosition,
            pinned,
            fromEnter: false,
            fakeEvent: false,
            gos,
            colModel,
            colMoves: this,
            visibleCols,
            finished: true,
        });

        let targetColumn: AgColumn;
        if (isGroup) {
            const displayedLeafColumns = column.getDisplayedLeafColumns();
            targetColumn = isLeft ? displayedLeafColumns[0] : _last(displayedLeafColumns);
        } else {
            targetColumn = column;
        }

        ctrlsSvc.getScrollFeature().ensureColumnVisible(targetColumn, 'auto');

        if ((!bean.isAlive() || gos.get('ensureDomOrder')) && headerPosition) {
            let restoreFocusColumn: AgColumn | AgColumnGroup | undefined;
            if (isGroup) {
                const groupId = column.getGroupId();
                const leafCols = column.getLeafColumns();
                if (!leafCols.length) {
                    return;
                }
                const parent = leafCols[0].parent;
                if (!parent) {
                    return;
                }

                restoreFocusColumn = findGroupWidthId(parent, groupId);
            } else {
                restoreFocusColumn = column;
            }
            if (restoreFocusColumn) {
                focusSvc.focusHeaderPosition({
                    headerPosition: {
                        ...headerPosition,
                        column: restoreFocusColumn,
                    },
                });
            }
        }
    }

    public setDragSourceForHeader(
        eSource: HTMLElement,
        column: AgColumn | AgColumnGroup,
        displayName: string | null
    ): GridDragSource {
        const beans = this.beans;
        const { gos, dragAndDrop, visibleCols } = beans;
        let hideColumnOnExit = !gos.get('suppressDragLeaveHidesColumns');
        const isGroup = isColumnGroup(column);
        const columns = isGroup ? column.getProvidedColumnGroup().getLeafColumns() : [column];
        const getDragItem = isGroup
            ? () => createDragItemForGroup(column, visibleCols.allCols)
            : () => createDragItem(column);
        const dragSource: GridDragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eSource,
            getDefaultIconName: () => (hideColumnOnExit ? 'hide' : 'notAllowed'),
            getDragItem,
            dragItemName: displayName,
            onDragStarted: () => {
                hideColumnOnExit = !gos.get('suppressDragLeaveHidesColumns');
                setColumnsMoving(columns, true);
            },
            onDragStopped: () => setColumnsMoving(columns, false),
            onDragCancelled: () => setColumnsMoving(columns, false),
            onGridEnter: (dragItem) => {
                if (hideColumnOnExit) {
                    const { columns = [], visibleState } = dragItem ?? {};
                    const visibleStateCols = isGroup
                        ? columns.filter((col: AgColumn) => !visibleState || visibleState[col.colId])
                        : columns;
                    _setColsVisible(beans, visibleStateCols as AgColumn[], true, 'uiColumnMoved', true);
                }
            },
            onGridExit: (dragItem) => {
                if (hideColumnOnExit) {
                    _setColsVisible(beans, (dragItem?.columns ?? []) as AgColumn[], false, 'uiColumnMoved', true);
                }
            },
        };

        dragAndDrop!.addDragSource(dragSource, true);

        return dragSource;
    }
}

function findGroupWidthId(columnGroup: AgColumnGroup | null, id: any): AgColumnGroup | undefined {
    while (columnGroup) {
        if (columnGroup.groupId === id) {
            return columnGroup;
        }
        columnGroup = columnGroup.parent;
    }

    return undefined;
}

function createDragItem(column: AgColumn): DragItem {
    const visibleState: { [key: string]: boolean } = Object.create(null);
    visibleState[column.getId()] = column.isVisible();

    return {
        columns: [column],
        visibleState: visibleState,
        containerType: column.pinned,
    };
}

// when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
// and in the order they are currently in the screen.
function createDragItemForGroup(columnGroup: AgColumnGroup, allCols: AgColumn[]): DragItem {
    const allColumnsOriginalOrder = columnGroup.getProvidedColumnGroup().getLeafColumns();

    // capture visible state, used when re-entering grid to dictate which columns should be visible
    const visibleState: { [key: string]: boolean } = Object.create(null);
    for (const column of allColumnsOriginalOrder) {
        visibleState[column.getId()] = column.isVisible();
    }

    const allColumnsCurrentOrder: AgColumn[] = [];
    for (const column of allCols) {
        if (allColumnsOriginalOrder.indexOf(column) >= 0) {
            allColumnsCurrentOrder.push(column);
            _removeFromArray(allColumnsOriginalOrder, column);
        }
    }

    // we are left with non-visible columns, stick these in at the end
    for (const column of allColumnsOriginalOrder) {
        allColumnsCurrentOrder.push(column);
    }

    const columnsInSplit: AgColumn[] = [];
    const columnGroupColumns = columnGroup.getLeafColumns();

    for (const col of allColumnsCurrentOrder) {
        if (columnGroupColumns.indexOf(col) !== -1) {
            columnsInSplit.push(col);
        }
    }

    // create and return dragItem
    return {
        columns: allColumnsCurrentOrder,
        columnsInSplit,
        visibleState: visibleState,
        containerType: columnsInSplit[0]?.pinned,
    };
}
