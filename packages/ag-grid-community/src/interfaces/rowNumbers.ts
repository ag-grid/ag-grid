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
        | 'maxWidth'
    > {
    /**
     * Set to `true` to prevent selecting all the currently visible cells in the row when clicking a Row Number.
     * @default false
     */
    suppressCellSelectionIntegration?: boolean;

    /**
     * The minimum width for the row number column.
     * @default 60
     */
    minWidth?: number;

    /**
     * The default width for the row number column.
     * @default 60
     */
    width?: number;

    /**
     * Whether this column is resizable.
     * @default false
     */
    resizable?: boolean;
}

export interface IRowNumbersService extends IColumnCollectionService {
    setupForHeader(comp: HeaderComp): void;
    handleMouseDownOnCell(cell: CellPosition, mouseEvent: MouseEvent): boolean;
}
