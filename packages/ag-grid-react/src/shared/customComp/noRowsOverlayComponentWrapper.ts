import type { INoRowsOverlay, INoRowsOverlayParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomNoRowsOverlayProps } from './interfaces';

export class NoRowsOverlayComponentWrapper
    extends CustomComponentWrapper<INoRowsOverlayParams, CustomNoRowsOverlayProps, object>
    implements INoRowsOverlay
{
    public refresh(params: INoRowsOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
