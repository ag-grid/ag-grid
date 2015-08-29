/** The filter parameters for set filter */

module awk.grid {

    export interface SetFilterParameters {

        /** Same as cell renderer for grid (you can use the same one in both locations). Setting it separatly here allows for the value to be rendered differently in the filter. */
        cellRenderer ?: Function;

        /** The height of the cell. */
        cellHeight ?: number;

        /** The values to display in the filter. */
        values ?: any;

        /**  What to do when new rows are loaded. The default is to reset the filter, as the set of values to select from can have changed. If you want to keep the selection, then set this value to 'keep'. */
        newRowsAction ?: string;

        /** If true, the filter will not remove items that are no longer availabe due to other filters. */
        suppressRemoveEntries ?: boolean;
    }

}