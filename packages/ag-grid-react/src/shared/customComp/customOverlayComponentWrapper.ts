import type { IOverlay, IOverlayParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomOverlayProps } from './interfaces';

export class CustomOverlayComponentWrapper
    extends CustomComponentWrapper<IOverlayParams, CustomOverlayProps, object>
    implements IOverlay
{
    public refresh(params: IOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
