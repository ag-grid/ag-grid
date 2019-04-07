import {
    Autowired,
    Component,
    CellComp,
    CellRange,
    RowRenderer,
    IFillHandle,
    _,
    RowPosition
} from 'ag-grid-community';

export class FillHandle extends Component implements IFillHandle<any> {

    @Autowired("rowRenderer") private rowRenderer: RowRenderer;

    private cellComp: CellComp;

    static TEMPLATE = '<div class="ag-fill-handle"></div>';

    constructor() {
        super(FillHandle.TEMPLATE);
    }

    public refresh(cellRange: CellRange) {
        const oldCellComp = this.cellComp;
        const eGui = this.getGui();

        const { startRow, endRow, columns } = cellRange;
        const isColumnRange = !startRow || !endRow;

        if (isColumnRange && oldCellComp) {
            oldCellComp.getGui().removeChild(eGui);
        }

        let start = startRow as RowPosition;
        let end = endRow as RowPosition;

        if (start.rowIndex > end.rowIndex) {
            start = endRow as RowPosition;
            end = startRow as RowPosition;
        }
        
        const cellComp = this.rowRenderer.getComponentForCell({
            rowIndex: end.rowIndex,
            rowPinned: end.rowPinned,
            column: columns[columns.length - 1]
        });

        if (oldCellComp !== cellComp) {
            cellComp.appendChild(eGui);
        }

    }

    public destroy() {
        super.destroy();

        const eGui = this.getGui();

        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}