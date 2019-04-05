import {
    Autowired,
    PopupComponent,
    PopupService,
    CellRange,
    RowRenderer,
    IFillHandle,
    _,
    PostConstruct
} from 'ag-grid-community';

export class FillHandle extends PopupComponent implements IFillHandle<any> {

    @Autowired("popupService") private popupService: PopupService;
    @Autowired("rowRenderer") private rowRenderer: RowRenderer;

    private close: () => void;

    static TEMPLATE = '<div class="ag-fill-handle"></div>';

    constructor() {
        super(FillHandle.TEMPLATE);
    }

    @PostConstruct
    private renderPopup() {
        this.close = this.popupService.addPopup(false, this.getGui(), false);
    }

    public syncPosition(range: CellRange) {
        const eGui = this.getGui();
        const { startRow, columns } = range;
        let endRow = range.endRow;
        const isFullColumn = (!startRow || !endRow);

        _.addOrRemoveCssClass(eGui, 'ag-hidden', isFullColumn);

        if (isFullColumn) { return; }

        if (startRow!.rowIndex > endRow!.rowIndex) {
            endRow = startRow;
        }

        const cellComp = this.rowRenderer.getComponentForCell({
            column: columns[columns.length - 1],
            rowIndex: endRow!.rowIndex,
            rowPinned: endRow!.rowPinned
        });

        this.popupService.positionPopupUnderComponent({
            type: 'fillHandle',
            ePopup: eGui,
            eventSource: cellComp.getGui(),
            alignSide: 'right',
            nudgeY: -2.5,
            nudgeX: 1.5
        });        
    }

    public destroy() {
        super.destroy();

        if (this.close) {
            this.close();
        }
    }
}