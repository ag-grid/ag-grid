import type {
    AgColumn,
    CellCtrl,
    CellPosition,
    CellRange,
    ElementParams,
    FillOperationParams,
    GridOptionsService,
    RowNode,
    RowPosition,
} from 'ag-grid-community';
import {
    _addGridCommonParams,
    _getCellByPosition,
    _getFillHandle,
    _getLastRow,
    _getNormalisedMousePosition,
    _getRowAbove,
    _getRowBelow,
    _getRowNode,
    _isRowBefore,
    _isSameRow,
    _last,
    _stopPropagationForAgGrid,
    _toStringOrNull,
    isRowNumberCol,
} from 'ag-grid-community';

import { AbstractSelectionHandle, SelectionHandleType } from './abstractSelectionHandle';
import { findLineByLeastSquares } from './utils';

const FILL_HANDLE_CSS_CLASS_TOP = 'ag-selection-fill-top';
const FILL_HANDLE_CSS_CLASS_BOTTOM = 'ag-selection-fill-bottom';
const FILL_HANDLE_CSS_CLASS_LEFT = 'ag-selection-fill-left';
const FILL_HANDLE_CSS_CLASS_RIGHT = 'ag-selection-fill-right';

interface FillValues {
    position: CellPosition;
    value: any;
}

interface ValueContext {
    value: any;
    column: AgColumn;
    rowNode: RowNode;
}

type FillDirection = 'x' | 'y';
const FillHandleElement: ElementParams = {
    tag: 'div',
    cls: 'ag-fill-handle',
};
export class AgFillHandle extends AbstractSelectionHandle {
    private initialPosition: CellPosition | undefined;
    private initialXY: { x: number; y: number } | null;
    private lastCellMarked: CellPosition | undefined;
    private readonly markedCells: CellCtrl[] = [];
    private readonly fillValues: FillValues[] = [];

    private dragAxis?: FillDirection;
    private isUp = false;
    private isLeft = false;
    private isReduce = false;

    protected type = SelectionHandleType.FILL;

    constructor() {
        super(FillHandleElement);
    }

    public override postConstruct(): void {
        super.postConstruct();

        this.addManagedElementListeners(this.getGui(), {
            dblclick: this.onDblClick.bind(this),
        });
    }

    private onDblClick(e: MouseEvent) {
        // Stop propagation here, we don't want other services (e.g. editing) reacting to this event
        _stopPropagationForAgGrid(e);

        const { cellRange: initialRange, rangeStartRow, beans } = this;
        const { rangeSvc, visibleCols, gos } = beans;
        const lastRow = _getLastRow(beans);

        if (!lastRow) {
            return;
        }

        const fillHandleDirection = getFillHandleDirection(gos);
        this.dragAxis = fillHandleDirection === 'xy' ? 'y' : fillHandleDirection;

        const finalRange = rangeSvc?.createCellRangeFromCellRangeParams({
            rowStartIndex: rangeStartRow.rowIndex,
            rowStartPinned: rangeStartRow.rowPinned,
            columnStart: initialRange.columns[0],
            rowEndIndex: this.dragAxis === 'x' ? initialRange.endRow?.rowIndex ?? null : lastRow.rowIndex,
            rowEndPinned: this.dragAxis === 'x' ? initialRange.endRow?.rowPinned : lastRow.rowPinned,
            columnEnd: this.dragAxis === 'x' ? _last(visibleCols.allCols) : _last(initialRange.columns),
        });

        this.isUp = false;
        this.isLeft = false;

        if (finalRange) {
            this.performFill({
                event: e,
                initialRange,
                finalRange,
            });
        }
        this.dragAxis = undefined;
    }

    protected override updateValuesOnMove(e: MouseEvent) {
        super.updateValuesOnMove(e);

        const { beans, gos } = this;

        this.initialXY ??= _getNormalisedMousePosition(beans, e);

        const { x, y } = this.initialXY;
        const { x: newX, y: newY } = _getNormalisedMousePosition(beans, e);
        const diffX = Math.abs(x - newX);
        const diffY = Math.abs(y - newY);
        const allowedDirection = getFillHandleDirection(gos);
        let direction: FillDirection;

        if (allowedDirection === 'xy') {
            direction = diffX > diffY ? 'x' : 'y';
        } else {
            direction = allowedDirection;
        }

        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
            this.changedCalculatedValues = true;
        }
    }

    protected override shouldSkipCell(cell: CellPosition): boolean {
        return isRowNumberCol(cell.column);
    }

    protected onDrag(e: MouseEvent) {
        this.initialPosition ??= this.cellCtrl.cellPosition;

        const lastCellHovered = this.getLastCellHovered();

        if (lastCellHovered) {
            this.markPathFrom(this.initialPosition, lastCellHovered);

            const finalRange = this.getFinalRange();
            if (finalRange) {
                this.performFill({
                    event: e,
                    initialRange: this.cellRange,
                    finalRange,
                    target: this.fillValues,
                });
            }
        }
    }

    protected onDragEnd(e: MouseEvent) {
        this.initialXY = null;
        if (!this.markedCells.length) {
            return;
        }

        const finalRange = this.getFinalRange();

        if (finalRange) {
            this.performFill({
                event: e,
                initialRange: this.cellRange,
                finalRange,
                shouldUpdateRange: true,
            });
        }
    }

    private getFinalRange(): CellRange | undefined {
        if (!this.lastCellMarked) {
            return;
        }

        const isX = this.dragAxis === 'x';
        const {
            cellRange: initialRange,
            rangeStartRow,
            rangeEndRow,
            beans: { rangeSvc },
        } = this;

        if (!this.isUp && !this.isLeft) {
            return rangeSvc!.createCellRangeFromCellRangeParams({
                rowStartIndex: rangeStartRow.rowIndex,
                rowStartPinned: rangeStartRow.rowPinned,
                columnStart: initialRange.columns[0],
                rowEndIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked!.rowIndex,
                rowEndPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked!.rowPinned,
                columnEnd: isX ? this.lastCellMarked!.column : _last(initialRange.columns),
            });
        } else {
            const startRow = isX ? rangeStartRow : this.lastCellMarked;

            return rangeSvc!.createCellRangeFromCellRangeParams({
                rowStartIndex: startRow!.rowIndex,
                rowStartPinned: startRow!.rowPinned,
                columnStart: isX ? this.lastCellMarked!.column : initialRange.columns[0],
                rowEndIndex: rangeEndRow.rowIndex,
                rowEndPinned: rangeEndRow.rowPinned,
                columnEnd: _last(initialRange.columns),
            });
        }
    }

    protected onDragCancel(): void {
        this.initialXY = null;
        if (!this.markedCells.length) {
            return;
        }

        this.clearMarkedPath();
    }

    private performFill({
        event,
        initialRange,
        finalRange,
        shouldUpdateRange,
        target,
    }: {
        event: MouseEvent;
        initialRange: CellRange;
        finalRange: CellRange;
        shouldUpdateRange?: boolean;
        target?: FillValues[];
    }): void {
        const { eventSvc, rangeSvc } = this.beans;

        if (!target) {
            // raising fill events for undo / redo
            eventSvc.dispatchEvent({ type: 'fillStart' });
        }

        if (target) {
            this.handleValueChanged(initialRange, finalRange, event, target);
        } else {
            this.fillValues.forEach(({ position, value }) => {
                const rowNode = this.beans.rowModel.getRow(position.rowIndex);
                if (!rowNode) {
                    return;
                }

                rowNode.setDataValue(position.column as AgColumn, value, 'rangeSvc');
            });
        }

        if (shouldUpdateRange) {
            rangeSvc!.setCellRanges([finalRange]);
        }

        if (!target) {
            eventSvc.dispatchEvent({
                type: 'fillEnd',
                initialRange,
                finalRange,
            });
        }
    }

    private handleValueChanged(initialRange: CellRange, finalRange: CellRange, e: MouseEvent, target?: FillValues[]) {
        const { beans } = this;
        const { rangeSvc, gos, valueSvc } = beans;
        const initialRangeEndRow = rangeSvc!.getRangeEndRow(initialRange);
        const initialRangeStartRow = rangeSvc!.getRangeStartRow(initialRange);
        const finalRangeEndRow = rangeSvc!.getRangeEndRow(finalRange);
        const finalRangeStartRow = rangeSvc!.getRangeStartRow(finalRange);
        const isVertical = this.dragAxis === 'y';

        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce && !_getFillHandle(gos)?.suppressClearOnFillReduction) {
            const columns = (
                isVertical
                    ? initialRange.columns
                    : initialRange.columns.filter((col) => finalRange.columns.indexOf(col) < 0)
            ) as AgColumn[];

            const startRow = isVertical ? _getRowBelow(beans, finalRangeEndRow) : finalRangeStartRow;

            if (startRow) {
                this.clearCellsInRange(startRow, initialRangeEndRow, columns);
            }
            return;
        }

        const values: ValueContext[] = [];
        const initialValues: any[] = [];
        const initialNonAggregatedValues: any[] = [];
        const initialFormattedValues: any[] = [];

        let withinInitialRange = true;
        let idx = 0;

        const resetValues = () => {
            values.length = 0;
            initialValues.length = 0;
            initialNonAggregatedValues.length = 0;
            initialFormattedValues.length = 0;
            idx = 0;
            if (target) {
                target.length = 0;
            }
        };

        const iterateAcrossCells = (column?: AgColumn, columns?: AgColumn[]) => {
            let currentRow: RowPosition | null = this.isUp ? initialRangeEndRow : initialRangeStartRow;
            let finished = false;

            if (isVertical) {
                withinInitialRange = true;
                resetValues();
            }

            while (!finished && currentRow) {
                const rowNode = _getRowNode(beans, currentRow);
                if (!rowNode) {
                    break;
                }

                if (isVertical && column) {
                    fillValues(
                        values,
                        column,
                        rowNode,
                        () => !_isSameRow(currentRow!, this.isUp ? initialRangeStartRow : initialRangeEndRow)
                    );
                } else if (columns) {
                    withinInitialRange = true;
                    resetValues();
                    for (const col of columns) {
                        fillValues(
                            values,
                            col,
                            rowNode,
                            () => col !== (this.isLeft ? initialRange.columns[0] : _last(initialRange.columns))
                        );
                    }
                }

                finished = _isSameRow(currentRow, this.isUp ? finalRangeStartRow : finalRangeEndRow);

                currentRow = this.isUp ? _getRowAbove(this.beans, currentRow) : _getRowBelow(beans, currentRow);
            }
        };

        const fillValues = (
            currentValues: ValueContext[],
            col: AgColumn,
            rowNode: RowNode,
            updateInitialSet: () => boolean
        ) => {
            let currentValue: any;
            let skipValue: boolean = false;

            if (withinInitialRange) {
                currentValue = valueSvc.getValue(col, rowNode, 'edit');
                initialValues.push(currentValue);
                initialNonAggregatedValues.push(valueSvc.getValue(col, rowNode, 'edit', true));
                initialFormattedValues.push(
                    valueSvc.getValueForDisplay({ column: col, node: rowNode, from: 'edit' }).valueFormatted
                );
                withinInitialRange = updateInitialSet();
            } else {
                const { value, fromUserFunction, sourceCol, sourceRowNode } = this.processValues({
                    event: e,
                    values: currentValues,
                    initialValues,
                    initialNonAggregatedValues,
                    initialFormattedValues,
                    col,
                    rowNode,
                    idx: idx++,
                });

                currentValue = value;
                if (col.isCellEditable(rowNode)) {
                    const cellValue = valueSvc.getValue(col, rowNode, 'edit');

                    if (!fromUserFunction) {
                        if (sourceCol) {
                            const sourceColDef = sourceCol.getColDef();
                            if (sourceColDef.useValueFormatterForExport !== false && sourceColDef.valueFormatter) {
                                const formattedValue = valueSvc.getValueForDisplay({
                                    column: sourceCol,
                                    node: sourceRowNode!,
                                    includeValueFormatted: true,
                                    from: 'edit',
                                }).valueFormatted;

                                if (formattedValue != null) {
                                    currentValue = formattedValue;
                                }
                            }
                        }
                        if (col.getColDef().useValueParserForImport !== false) {
                            currentValue = valueSvc.parseValue(
                                col,
                                rowNode,
                                // if no sourceCol, then currentValue is a number
                                sourceCol ? currentValue : _toStringOrNull(currentValue),
                                cellValue
                            );
                        }
                    }
                    if (!fromUserFunction || cellValue !== currentValue) {
                        if (target) {
                            target.push({
                                position: { column: col, rowIndex: rowNode.rowIndex!, rowPinned: rowNode.rowPinned },
                                value: currentValue,
                            });
                        } else {
                            rowNode.setDataValue(col, currentValue, 'rangeSvc');
                        }
                    } else {
                        skipValue = true;
                    }
                }
            }

            if (!skipValue) {
                currentValues.push({
                    value: currentValue,
                    column: col,
                    rowNode,
                });
            }
        };

        if (isVertical) {
            initialRange.columns.forEach((col: AgColumn) => iterateAcrossCells(col));
        } else {
            const columns = (this.isLeft ? [...finalRange.columns].reverse() : finalRange.columns) as AgColumn[];
            iterateAcrossCells(undefined, columns);
        }

        this.beans.editSvc?.stopEditing(undefined, { source: 'fillHandle' });
    }

    private clearCellsInRange(startRow: RowPosition, endRow: RowPosition, columns: AgColumn[]) {
        const cellRange: CellRange = {
            startRow,
            endRow,
            columns,
            startColumn: columns[0],
        };
        this.beans.rangeSvc!.clearCellRangeCellValues({ cellRanges: [cellRange], restoreSourceInBatch: true });
    }

    private processValues(params: {
        event: MouseEvent;
        values: ValueContext[];
        initialValues: any[];
        initialNonAggregatedValues: any[];
        initialFormattedValues: any[];
        col: AgColumn;
        rowNode: RowNode;
        idx: number;
    }): { value: any; fromUserFunction: boolean; sourceCol?: AgColumn; sourceRowNode?: RowNode } {
        const { formula, valueSvc, gos } = this.beans;
        const { event, values, initialValues, initialNonAggregatedValues, initialFormattedValues, col, rowNode, idx } =
            params;

        const userFillOperation = _getFillHandle(this.gos)?.setFillValue;
        const isVertical = this.dragAxis === 'y';
        let direction: 'up' | 'down' | 'left' | 'right';

        if (isVertical) {
            direction = this.isUp ? 'up' : 'down';
        } else {
            direction = this.isLeft ? 'left' : 'right';
        }

        if (userFillOperation) {
            const params = _addGridCommonParams<FillOperationParams>(gos, {
                event,
                values: values.map(({ value }) => value),
                initialValues,
                initialNonAggregatedValues,
                initialFormattedValues,
                currentIndex: idx,
                currentCellValue: valueSvc.getValue(col, rowNode, 'edit'),
                direction,
                column: col,
                rowNode: rowNode,
            });
            const userResult = userFillOperation(params);
            if (userResult !== false) {
                return { value: userResult, fromUserFunction: true };
            }
        }

        const isNumeric = (v: any) =>
            (typeof v === 'number' && Number.isFinite(v)) ||
            (typeof v === 'string' && /^[+-]?\d+(?:\.\d+)?$/.test(v.trim()));
        const allNumbers = values.every(({ value }) => isNumeric(value));

        // values should be copied in order if the alt key is pressed
        // or if the values contain strings and numbers
        // However, if we only have one initial value selected, and that
        // value is a number and we are also pressing alt, then we should
        // increment or decrement the value by 1 based on direction.
        if (event.altKey || !allNumbers) {
            // Use the last selected value as the candidate for numeric series and formula shifting
            const valueForFunctions = String(_last(values)?.value ?? '');

            // ALT + single numeric source: increment/decrement last value by 1
            if (allNumbers && initialValues.length === 1) {
                const multiplier = this.isUp || this.isLeft ? -1 : 1;
                return {
                    value: parseFloat(valueForFunctions) + 1 * multiplier,
                    fromUserFunction: false,
                };
            }

            // Compute the cyclic source for this target cell (fallback when not using a formula)
            const { value: cyclicValue, column: sourceCol, rowNode: sourceRowNode } = values[idx % values.length];

            let processedValue: any;
            const fromFormula = sourceCol.isAllowFormula() && formula?.isFormula(valueForFunctions);

            if (fromFormula) {
                // Compute the row and column delta based on drag direction
                const rowDelta = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
                const columnDelta = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
                processedValue = formula!.updateFormulaByOffset({ value: valueForFunctions, rowDelta, columnDelta });
            } else {
                processedValue = cyclicValue;
            }

            return {
                value: processedValue,
                fromUserFunction: false,
                sourceCol: fromFormula ? undefined : sourceCol,
                sourceRowNode,
            };
        }

        return {
            value: _last(findLineByLeastSquares(values.map(({ value }) => Number(value)))),
            fromUserFunction: false,
        };
    }

    protected override clearValues() {
        this.clearMarkedPath();

        this.lastCellMarked = undefined;

        super.clearValues();
    }

    private clearMarkedPath() {
        for (const cell of this.markedCells) {
            if (!cell.isAlive()) {
                continue;
            }
            const { comp } = cell;
            comp.toggleCss(FILL_HANDLE_CSS_CLASS_TOP, false);
            comp.toggleCss(FILL_HANDLE_CSS_CLASS_RIGHT, false);
            comp.toggleCss(FILL_HANDLE_CSS_CLASS_BOTTOM, false);
            comp.toggleCss(FILL_HANDLE_CSS_CLASS_LEFT, false);
        }

        this.markedCells.length = 0;

        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
        this.fillValues.length = 0;
    }

    private markPathFrom(initialPosition: CellPosition, currentPosition: CellPosition) {
        this.clearMarkedPath();

        if (this.dragAxis === 'y') {
            if (_isSameRow(currentPosition, initialPosition)) {
                return;
            }

            const isBefore = _isRowBefore(currentPosition, initialPosition);
            const { rangeStartRow, rangeEndRow } = this;

            if (
                isBefore &&
                ((currentPosition.rowPinned == rangeStartRow.rowPinned &&
                    currentPosition.rowIndex >= rangeStartRow.rowIndex) ||
                    (rangeStartRow.rowPinned != rangeEndRow.rowPinned &&
                        currentPosition.rowPinned == rangeEndRow.rowPinned &&
                        currentPosition.rowIndex <= rangeEndRow.rowIndex))
            ) {
                this.reduceVertical(initialPosition, currentPosition);
                this.isReduce = true;
            } else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
                this.isReduce = false;
            }
        } else {
            const initialColumn = initialPosition.column as AgColumn;
            const currentColumn = currentPosition.column as AgColumn;

            if (initialColumn === currentColumn) {
                return;
            }
            const displayedColumns = this.beans.visibleCols.allCols;
            const initialIndex = displayedColumns.indexOf(initialColumn);
            const currentIndex = displayedColumns.indexOf(currentColumn);

            if (
                currentIndex <= initialIndex &&
                currentIndex >= displayedColumns.indexOf(this.cellRange.columns[0] as AgColumn)
            ) {
                this.reduceHorizontal(initialPosition, currentPosition);
                this.isReduce = true;
            } else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
                this.isReduce = false;
            }
        }
        this.lastCellMarked = currentPosition;
    }

    private extendVertical(initialPosition: CellPosition, endPosition: CellPosition, isMovingUp?: boolean) {
        const beans = this.beans;
        const { rangeSvc } = beans;

        let row: RowPosition | null = initialPosition;

        do {
            const cellRange = this.cellRange;
            const colLen = cellRange.columns.length;

            for (let i = 0; i < colLen; i++) {
                const column = cellRange.columns[i];
                const isInitialRow = _isSameRow(row, initialPosition);

                if (isMovingUp) {
                    this.isUp = true;
                }

                if (!isInitialRow) {
                    const cellPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned, column };
                    const cell = _getCellByPosition(beans, cellPos);

                    if (cell) {
                        const cellInRange = rangeSvc!.isCellInSpecificRange(cellPos, cellRange);
                        this.markedCells.push(cell);
                        const cellComp = cell.comp;

                        if (!cellInRange) {
                            cellComp.toggleCss(FILL_HANDLE_CSS_CLASS_LEFT, i === 0);
                            cellComp.toggleCss(FILL_HANDLE_CSS_CLASS_RIGHT, i === colLen - 1);
                        }

                        cellComp.toggleCss(
                            isMovingUp ? FILL_HANDLE_CSS_CLASS_TOP : FILL_HANDLE_CSS_CLASS_BOTTOM,
                            _isSameRow(row, endPosition)
                        );
                    }
                }
            }

            if (_isSameRow(row, endPosition)) {
                break;
            }
        } while (
            // tslint:disable-next-line
            (row = isMovingUp ? _getRowAbove(this.beans, row) : _getRowBelow(beans, row))
        );
    }

    private reduceVertical(initialPosition: CellPosition, endPosition: CellPosition) {
        let row: RowPosition | null = initialPosition;
        const beans = this.beans;

        do {
            const cellRange = this.cellRange;
            const colLen = cellRange.columns.length;
            const isLastRow = _isSameRow(row, endPosition);

            for (let i = 0; i < colLen; i++) {
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const celPos = { ...rowPos, column: cellRange.columns[i] };
                const cell = _getCellByPosition(beans, celPos);

                if (cell) {
                    this.markedCells.push(cell);

                    cell.comp.toggleCss(FILL_HANDLE_CSS_CLASS_BOTTOM, _isSameRow(row, endPosition));
                }
            }
            if (isLastRow) {
                break;
            }
            // tslint:disable-next-line
        } while ((row = _getRowAbove(beans, row)));
    }

    private extendHorizontal(initialPosition: CellPosition, endPosition: CellPosition, isMovingLeft?: boolean) {
        const beans = this.beans;
        const { visibleCols } = beans;
        const allCols = visibleCols.allCols;
        const startCol = allCols.indexOf((isMovingLeft ? endPosition.column : initialPosition.column) as AgColumn);
        const endCol = allCols.indexOf((isMovingLeft ? this.cellRange.columns[0] : endPosition.column) as AgColumn);
        const offset = isMovingLeft ? 0 : 1;

        const colsToMark = allCols.slice(startCol + offset, endCol + offset);
        const { rangeStartRow, rangeEndRow } = this;

        for (const column of colsToMark) {
            let row: RowPosition = rangeStartRow;
            let isLastRow = false;

            do {
                isLastRow = _isSameRow(row, rangeEndRow);
                const cell = _getCellByPosition(beans, {
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column,
                });

                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.comp;

                    cellComp.toggleCss(FILL_HANDLE_CSS_CLASS_TOP, _isSameRow(row, rangeStartRow));
                    cellComp.toggleCss(FILL_HANDLE_CSS_CLASS_BOTTOM, _isSameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        this.isLeft = true;
                        cellComp.toggleCss(FILL_HANDLE_CSS_CLASS_LEFT, column === colsToMark[0]);
                    } else {
                        cellComp.toggleCss(FILL_HANDLE_CSS_CLASS_RIGHT, column === _last(colsToMark));
                    }
                }

                row = _getRowBelow(beans, row)!;
            } while (!isLastRow);
        }
    }

    private reduceHorizontal(initialPosition: CellPosition, endPosition: CellPosition) {
        const beans = this.beans;
        const { visibleCols } = beans;
        const allCols = visibleCols.allCols;
        const startCol = allCols.indexOf(endPosition.column as AgColumn);
        const endCol = allCols.indexOf(initialPosition.column as AgColumn);

        const colsToMark = allCols.slice(startCol, endCol);
        const { rangeStartRow, rangeEndRow } = this;

        for (const column of colsToMark) {
            let row: RowPosition = rangeStartRow;
            let isLastRow: boolean = false;

            do {
                isLastRow = _isSameRow(row, rangeEndRow);
                const cell = _getCellByPosition(this.beans, {
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column,
                });

                if (cell) {
                    this.markedCells.push(cell);
                    cell.comp.toggleCss(FILL_HANDLE_CSS_CLASS_RIGHT, column === colsToMark[0]);
                }

                row = _getRowBelow(beans, row)!;
            } while (!isLastRow);
        }
    }

    public override refresh(cellCtrl: CellCtrl, cellRange?: CellRange) {
        const cellRangeToUse = cellRange ?? this.beans.rangeSvc!.getCellRanges()[0];
        const isColumnRange = !cellRangeToUse.startRow || !cellRangeToUse.endRow;

        if (isColumnRange) {
            this.destroy();
            return;
        }

        super.refresh(cellCtrl, cellRangeToUse);
    }
}

function getFillHandleDirection(gos: GridOptionsService): 'x' | 'y' | 'xy' {
    return _getFillHandle(gos)?.direction ?? 'xy';
}
