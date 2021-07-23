import { PopupComponent } from '../widgets/popupComponent';
import { IComponent } from '../interfaces/iComponent';
import { escapeString } from '../utils/string';
import { GridApi } from '../gridApi';
import { ColumnApi } from '../columns/columnApi';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ColGroupDef, ColDef } from '../entities/colDef';

export interface ITooltipParams {
    location: string;
    api?: GridApi;
    columnApi?: ColumnApi;
    context?: any;
    colDef?: ColDef | ColGroupDef | null;
    column?: Column | ColumnGroup;
    value?: any;
    valueFormatted?: any;
    rowIndex?: number;
    node?: RowNode;
    data?: any;
}

export interface ITooltipComp extends IComponent<ITooltipParams> { }

export class TooltipComponent extends PopupComponent implements ITooltipComp {
    constructor() {
        super(/* html */`<div class="ag-tooltip"></div>`);
    }

    // will need to type params
    public init(params: ITooltipParams): void {
        const { value } = params;
        this.getGui().innerHTML = escapeString(value) as string;
    }
}
