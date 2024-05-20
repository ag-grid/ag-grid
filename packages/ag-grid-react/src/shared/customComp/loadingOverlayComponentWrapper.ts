import { ILoadingOverlay, ILoadingOverlayParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import { CustomLoadingOverlayProps } from './interfaces';

export class LoadingOverlayComponentWrapper
    extends CustomComponentWrapper<ILoadingOverlayParams, CustomLoadingOverlayProps, {}>
    implements ILoadingOverlay
{
    public refresh(params: ILoadingOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
