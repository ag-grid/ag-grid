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
        | 'suppressHeaderContextMenu'
        | 'suppressHeaderKeyboardEvent'
        | 'tooltipField'
        | 'tooltipValueGetter'
        | 'tooltipComponent'
        | 'tooltipComponentParams'
        | 'valueGetter'
        | 'valueFormatter'
        | 'width'
        | 'initialWidth'
        | 'maxWidth'
        | 'minWidth'
        | 'flex'
        | 'initialFlex'
        | 'resizable'
    > {
    /**
     * Set to `true` to prevent the automatic integration with Cell Selection
     */
    suppressCellSelectionIntegration?: boolean;
}

export interface IRowNumbersService extends IColumnCollectionService {
    setupForHeader(comp: HeaderComp): void;
    handleMouseDownOnCell(cell: CellPosition, mouseEvent: MouseEvent): boolean;
}
