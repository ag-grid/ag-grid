import type { CellCtrl, CellPosition, CellRange, CellSelectionChangedEvent, RowPosition } from 'ag-grid-community';
import {
    Component,
    _areCellsEqual,
    _getCellPositionForEvent,
    _getPageBody,
    _isRowBefore,
    _isVisible,
    _last,
    _setDisplayed,
} from 'ag-grid-community';

import type { RangeService } from './rangeService';

export enum SelectionHandleType {
    FILL,
    RANGE,
}

export abstract class AbstractSelectionHandle extends Component {
    protected cellCtrl: CellCtrl;
    protected cellRange: CellRange;

    protected rangeStartRow: RowPosition;
    protected rangeEndRow: RowPosition;

    protected changedCalculatedValues: boolean = false;
    private lastCellHovered: CellPosition | null | undefined;
    private dragging: boolean = false;

    protected abstract type: SelectionHandleType;
    protected abstract shouldSkipCell(cell: CellPosition): boolean;
    protected shouldDestroyOnEndDragging: boolean = false;

    public postConstruct() {
        this.beans.dragSvc!.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragging: (e) => {
                let startingMove = false;
                if (!this.dragging) {
                    startingMove = true;
                    this.dragging = true;
                    const pageBody = _getPageBody(this.beans) as Partial<HTMLElement>;
                    pageBody.classList?.add(this.getDraggingCssClass());
                }

                this.updateValuesOnMove(e);

                // if this is simply starting the drag, we only need to call `updateValuesOnMove`
                // to update the last hovered cell. If we call `onDrag` here, then the range will be
                // updated and trigger events unnecessarily.
                if (startingMove) {
                    this.changedCalculatedValues = false;
                    return;
                }

                this.beans.rangeSvc!.autoScrollService.check(e);

                if (this.changedCalculatedValues) {
                    this.onDrag(e);
                    this.changedCalculatedValues = false;
                }
            },
            onDragStop: (e) => {
                this.dragging = false;
                this.onDragEnd(e);
                this.clearDragProperties();
            },
            onDragCancel: () => {
                this.dragging = false;
                this.onDragCancel();
                this.clearDragProperties();
            },
        });

        this.addManagedEventListeners({
            cellSelectionChanged: this.updateLocalRangeIfNeeded.bind(this),
        });

        this.addManagedElementListeners(this.getGui(), {
            pointerdown: stopEventPropagation,
            mousedown: stopEventPropagation,
        });
    }

    protected abstract onDrag(e: MouseEvent | Touch): void;
    protected abstract onDragEnd(e: MouseEvent | Touch): void;
    protected abstract onDragCancel(): void;

    protected getLastCellHovered(): CellPosition | null | undefined {
        return this.lastCellHovered;
    }

    private getDraggingCssClass(): string {
        return `ag-dragging-${this.type === SelectionHandleType.FILL ? 'fill' : 'range'}-handle`;
    }

    protected updateValuesOnMove(e: MouseEvent | Touch) {
        const cell = _getCellPositionForEvent(this.gos, e);

        if (
            !cell ||
            this.shouldSkipCell(cell) ||
            (this.lastCellHovered && _areCellsEqual(cell, this.lastCellHovered))
        ) {
            return;
        }

        this.lastCellHovered = cell;
        this.changedCalculatedValues = true;
    }

    private clearDragProperties(): void {
        this.clearValues();
        (this.beans.rangeSvc as RangeService).autoScrollService.ensureCleared();

        // TODO: this causes a bug where if there are multiple grids in the same page, all of them will
        // be affected by a drag on any. Move it to the root element.
        const pageBody = _getPageBody(this.beans) as Partial<HTMLElement>;
        pageBody.classList?.remove(this.getDraggingCssClass());

        if (this.shouldDestroyOnEndDragging) {
            this.destroy();
        }
    }

    public getType(): SelectionHandleType {
        return this.type;
    }

    public refresh(cellCtrl: CellCtrl, cellRange?: CellRange) {
        const oldCellComp = this.cellCtrl;
        const eGui = this.getGui();

        const cellRangeToUse = cellRange ?? _last(this.beans.rangeSvc!.getCellRanges());

        const start = cellRangeToUse.startRow;
        const end = cellRangeToUse.endRow;

        if (start && end) {
            const isBefore = _isRowBefore(end, start);

            if (isBefore) {
                this.rangeStartRow = end;
                this.rangeEndRow = start;
            } else {
                this.rangeStartRow = start;
                this.rangeEndRow = end;
            }
        }

        if (oldCellComp !== cellCtrl || !_isVisible(eGui)) {
            this.cellCtrl = cellCtrl;
            const eParentOfValue = cellCtrl.comp.getParentOfValue();
            if (eParentOfValue) {
                eParentOfValue.appendChild(eGui);
            }
        }

        this.cellRange = cellRangeToUse;
    }

    protected clearValues() {
        this.lastCellHovered = undefined;
    }

    public override destroy() {
        if (!this.shouldDestroyOnEndDragging && this.dragging) {
            _setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }

        this.shouldDestroyOnEndDragging = false;

        super.destroy();

        this.getGui()?.remove();
    }

    private updateLocalRangeIfNeeded(event: CellSelectionChangedEvent) {
        if (!this.cellRange) {
            return;
        }
        const { id, type } = this.cellRange;
        if (!id || id !== event.id) {
            return;
        }

        const newRange = this.beans.rangeSvc?.getCellRanges().find((range) => range.id === id && range.type === type);

        if (newRange && newRange !== this.cellRange) {
            this.cellRange = newRange;
        }
    }
}

const stopEventPropagation = (e: MouseEvent) => {
    e.stopPropagation();
};
