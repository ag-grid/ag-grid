import type { ICellRenderer, ICellRendererParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomCellRendererProps } from './interfaces';

// used for set filter and rich select
export class CellRendererComponentWrapper
    extends CustomComponentWrapper<ICellRendererParams, CustomCellRendererProps, object>
    implements ICellRenderer
{
    public refresh(params: ICellRendererParams): boolean {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }
}
