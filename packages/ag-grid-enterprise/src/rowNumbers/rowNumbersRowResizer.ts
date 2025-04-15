import { Component } from 'ag-grid-community';
import type { CellCtrl, ElementParams } from 'ag-grid-community';

const RowNumbersRowResizerElement: ElementParams = {
    tag: 'div',
    cls: 'ag-row-numbers-resizer',
    attrs: { draggable: 'true' },
};

export class AgRowNumbersRowResizer extends Component {
    constructor(private readonly cellCtrl: CellCtrl) {
        super(RowNumbersRowResizerElement);
    }
}
