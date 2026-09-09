import type { AgColumn } from '../entities/agColumn';
import type { TooltipLocation } from '../tooltip/tooltipComponent';
import type { IRowNode } from './iRowNode';

export interface PopupPositionParams {
    column?: AgColumn | null;
    rowNode?: IRowNode | null;
    tooltipLocation?: TooltipLocation;
}
