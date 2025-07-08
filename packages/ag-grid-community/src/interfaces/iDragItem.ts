import type { ValidRowsDropPosition } from '../dragAndDrop/rowDragFeature/rowDragFeatureTypes';
import type { IAggFunc } from '../entities/colDef';
import type { Column, ColumnPinnedType } from './iColumn';
import type { IRowNode } from './iRowNode';

export interface DragItem<TValue = any> {
    /**
     * When dragging a row, this contains the row node being dragged
     * When dragging multiple rows, this contains the row that started the drag.
     */
    rowNode?: IRowNode;

    /** When dragging multiple rows, this contains all rows being dragged */
    rowNodes?: IRowNode[];

    /**
     * This contains information about the resulting drop position and the filtered rows being dragged.
     * See the grid option `isRowValidDropPosition` and `rowDragManaged` for more details.
     */
    rowsDrop?: ValidRowsDropPosition;

    /** When dragging columns, this contains the columns being dragged */
    columns?: Column[];

    /** When dragging column groups, this contains the columns in the current group split. */
    columnsInSplit?: Column[];

    /** When dragging columns, this contains the visible state of the columns */
    visibleState?: { [key: string]: boolean };

    /** The pinned type of the container that created the Drag Item */
    containerType?: ColumnPinnedType;

    /** When dragging columns, this contains the pivot state of the columns. This is only populated/used in column tool panel */
    pivotState?: {
        [key: string]: {
            pivot?: boolean;
            rowGroup?: boolean;
            aggFunc?: string | IAggFunc | null;
        };
    };

    /** Additional state */
    value?: TValue;
}
