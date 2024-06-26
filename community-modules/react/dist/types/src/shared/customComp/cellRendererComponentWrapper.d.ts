import type { ICellRenderer, ICellRendererParams } from '@ag-grid-community/core';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomCellRendererProps } from './interfaces';
export declare class CellRendererComponentWrapper extends CustomComponentWrapper<ICellRendererParams, CustomCellRendererProps, object> implements ICellRenderer {
    refresh(params: ICellRendererParams): boolean;
}
