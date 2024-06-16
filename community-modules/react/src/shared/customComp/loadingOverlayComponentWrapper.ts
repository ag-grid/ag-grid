import type { ILoadingOverlay, ILoadingOverlayParams } from '@ag-grid-community/core';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomLoadingOverlayProps } from './interfaces';

export class LoadingOverlayComponentWrapper
    extends CustomComponentWrapper<ILoadingOverlayParams, CustomLoadingOverlayProps, object>
    implements ILoadingOverlay
{
    public refresh(params: ILoadingOverlayParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }
}
