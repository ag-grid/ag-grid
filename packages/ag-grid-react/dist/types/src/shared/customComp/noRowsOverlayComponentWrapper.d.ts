import type { INoRowsOverlay, INoRowsOverlayParams } from 'ag-grid-community';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomNoRowsOverlayProps } from './interfaces';
export declare class NoRowsOverlayComponentWrapper extends CustomComponentWrapper<INoRowsOverlayParams, CustomNoRowsOverlayProps, object> implements INoRowsOverlay {
    refresh(params: INoRowsOverlayParams): void;
}
