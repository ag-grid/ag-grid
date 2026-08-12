import type { IComponent } from 'ag-stack';

import type { Column, ProvidedColumnGroup } from './iColumn';
import type { AgGridCommon } from './iCommon';

export type ColumnSelectionPanelSource = 'columnsToolPanel' | 'columnChooser';

export interface IColumnSelectionPanelParams {
    /** To suppress updating the layout of columns as they are rearranged in the grid. */
    suppressSyncLayoutWithGrid?: boolean;
    /** To suppress the column search. */
    suppressColumnFilter?: boolean;
    /** To suppress the Select / Unselect All widget. */
    suppressColumnSelectAll?: boolean;
    /** To suppress the Expand / Collapse All widget. */
    suppressColumnExpandAll?: boolean;
    /** By default, column groups start expanded. Pass `true` to start with groups collapsed. */
    contractColumnSelection?: boolean;
    /**
     * Component used to render column and column group labels. The checkbox, drag handle and expand controls
     * remain grid managed.
     */
    columnLabelRenderer?: any;
    /** Additional parameters passed to the `columnLabelRenderer`. */
    columnLabelRendererParams?: any;
}

export interface IColumnSelectionLabelRendererParams<TData = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /** The text value resolved from the column or column group definition. */
    displayName: string | null;
    /** The column being rendered, or `null` when rendering a column group. */
    column: Column | null;
    /** The column group being rendered, or `null` when rendering a column. */
    columnGroup: ProvidedColumnGroup | null;
    /** The panel in which the label is rendered. */
    source: ColumnSelectionPanelSource;
}

export interface IColumnSelectionLabelRenderer {
    /** Return `true` when the renderer was refreshed, or `false` to recreate it. */
    refresh?(params: IColumnSelectionLabelRendererParams): boolean;
}

export interface IColumnSelectionLabelRendererComp
    extends IComponent<IColumnSelectionLabelRendererParams>, IColumnSelectionLabelRenderer {}

export type ColumnSelectionLabelRendererFunc = (params: IColumnSelectionLabelRendererParams) => HTMLElement | string;
