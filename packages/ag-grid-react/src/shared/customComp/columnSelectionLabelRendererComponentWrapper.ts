import type { IColumnSelectionLabelRenderer, IColumnSelectionLabelRendererParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomColumnSelectionLabelProps } from './interfaces';

export class ColumnSelectionLabelRendererComponentWrapper
    extends CustomComponentWrapper<IColumnSelectionLabelRendererParams, CustomColumnSelectionLabelProps, object>
    implements IColumnSelectionLabelRenderer
{
    public refresh(params: IColumnSelectionLabelRendererParams): boolean {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }
}
