import type { ILoadingOverlay, ILoadingOverlayParams } from '@ag-grid-community/core';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomLoadingOverlayProps } from './interfaces';
export declare class LoadingOverlayComponentWrapper extends CustomComponentWrapper<ILoadingOverlayParams, CustomLoadingOverlayProps, object> implements ILoadingOverlay {
    refresh(params: ILoadingOverlayParams): void;
}
