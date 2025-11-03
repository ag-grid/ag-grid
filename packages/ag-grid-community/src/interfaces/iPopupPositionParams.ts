import type { AgColumn } from '../entities/agColumn';
import type { IRowNode } from './iRowNode';

export interface PopupPositionParams {
    column?: AgColumn | null;
    rowNode?: IRowNode | null;
}
