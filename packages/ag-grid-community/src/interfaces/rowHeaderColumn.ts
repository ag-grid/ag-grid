import type { ColDef } from '../entities/colDef';

export interface RowHeaderColumnDef
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
        | 'cellRenderer'
        | 'cellRendererParams'
        | 'cellRendererSelector'
        | 'tooltipField'
        | 'tooltipValueGetter'
        | 'tooltipComponent'
        | 'tooltipComponentParams'
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
