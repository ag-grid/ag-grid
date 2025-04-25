import type { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent } from '../../events';
import type { CellPosition } from '../../interfaces/iCellPosition';
import { _setAriaRowIndex, _setAriaRowSpan } from '../../utils/aria';
import { _isCellFocusSuppressed } from '../../utils/focus';
import type { ICellComp } from '../cell/cellCtrl';
import { CellCtrl } from '../cell/cellCtrl';
import type { RowCtrl } from '../row/rowCtrl';
import type { CellSpan } from './rowSpanCache';

export class SpannedCellCtrl extends CellCtrl {
    private readonly SPANNED_CELL_CSS_CLASS = 'ag-spanned-cell';
    private eWrapper: HTMLElement;

    constructor(
        private readonly cellSpan: CellSpan,
        rowCtrl: RowCtrl,
        beans: BeanCollection
    ) {
        super(cellSpan.col, cellSpan.firstNode, beans, rowCtrl);
    }

    private focusedCellPosition: CellPosition | undefined;

    public override setComp(
        comp: ICellComp,
        eCell: HTMLElement,
        eWrapper: HTMLElement | undefined,
        eCellWrapper: HTMLElement | undefined,
        printLayout: boolean,
        startEditing: boolean,
        compBean: BeanStub<'destroyed'> | undefined
    ): void {
        this.eWrapper = eWrapper!;
        super.setComp(comp, eCell, eWrapper, eCellWrapper, printLayout, startEditing, compBean);
        this.setAriaRowSpan();
        this.refreshAriaRowIndex();
    }

    public override isCellSpanning(): boolean {
        return true;
    }

    public override getCellSpan(): CellSpan | undefined {
        return this.cellSpan;
    }

    /**
     * When cell is spanning, ensure row index is also available on the cell
     */
    public override refreshAriaRowIndex(): void {
        if (this.rowNode.rowIndex == null) {
            return;
        }
        _setAriaRowIndex(this.eGui, this.rowNode.rowIndex);
    }

    /**
     * When cell is spanning, ensure row index is also available on the cell
     */
    private setAriaRowSpan(): void {
        _setAriaRowSpan(this.eGui, this.cellSpan.spannedNodes.size);
    }

    // not ideal, for tabbing need to force the focused position
    public override setFocusedCellPosition(cellPos: CellPosition): void {
        this.focusedCellPosition = cellPos;
    }

    public override getFocusedCellPosition() {
        return this.focusedCellPosition ?? this.cellPosition;
    }

    protected override checkCellFocused(): boolean {
        const focusedCell = this.beans.focusSvc.getFocusedCell();
        return !!focusedCell && this.cellSpan.doesSpanContain(focusedCell);
    }

    protected override applyStaticCssClasses(): void {
        super.applyStaticCssClasses();
        this.comp.toggleCss(this.SPANNED_CELL_CSS_CLASS, true);
    }

    public override onCellFocused(event?: CellFocusedEvent): void {
        const { beans } = this;
        if (_isCellFocusSuppressed(beans)) {
            this.focusedCellPosition = undefined;
            return;
        }

        const cellFocused = this.isCellFocused();
        if (!cellFocused) {
            this.focusedCellPosition = undefined;
        }
        if (event && cellFocused) {
            // when a spanned cell is focused, remember the focused cell position
            this.focusedCellPosition = {
                rowIndex: event.rowIndex!,
                rowPinned: event.rowPinned!,
                column: event.column as AgColumn, // fix
            };
        }

        super.onCellFocused(event);
    }

    public override getRootElement() {
        return this.eWrapper;
    }
}
