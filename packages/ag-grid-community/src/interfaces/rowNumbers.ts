import type { ColDef } from '../entities/colDef';
import type { HeaderComp } from '../headerRendering/cells/column/headerComp';
import type { CellPosition } from './iCellPosition';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface RowNumbersOptions
    extends Pick<
        ColDef,
        | 'contextMenuItems'
        | 'context'
        | 'onCellClicked'
        | 'onCellContextMenu'
        | 'onCellDoubleClicked'
        | 'headerTooltip'
        | 'headerStyle'
        | 'headerComponent'
        | 'headerComponentParams'
        | 'suppressHeaderKeyboardEvent'
        | 'tooltipField'
        | 'tooltipValueGetter'
        | 'tooltipComponent'
        | 'tooltipComponentParams'
        | 'valueGetter'
        | 'valueFormatter'
        | 'width'
        | 'maxWidth'
        | 'minWidth'
        | 'resizable'
    > {
    /**
     * Set to `true` to prevent selecting all the currently visible cells in the row when clicking a Row Number.
     * @default false
     */
    suppressCellSelectionIntegration?: boolean;
}

export interface IRowNumbersService extends IColumnCollectionService {
    setupForHeader(comp: HeaderComp): void;
    handleMouseDownOnCell(cell: CellPosition, mouseEvent: MouseEvent): boolean;
}
