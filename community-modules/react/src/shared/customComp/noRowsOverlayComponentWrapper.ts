import { INoRowsOverlay, INoRowsOverlayParams } from '@ag-grid-community/core';

import { CustomComponentWrapper } from './customComponentWrapper';
import { CustomNoRowsOverlayProps } from './interfaces';

export class NoRowsOverlayComponentWrapper
    extends CustomComponentWrapper<INoRowsOverlayParams, CustomNoRowsOverlayProps, {}>
    implements INoRowsOverlay
{
    public refresh(params: INoRowsOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
