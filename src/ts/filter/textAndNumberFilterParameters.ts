
module awk.grid {

    export interface TextAndNumberFilterParameters {
        /** What to do when new rows are loaded. The default is to reset the filter, to keep it in line with 'set' filters. If you want to keep the selection, then set this value to 'keep'. */
        newRowsAction?: string;
    }

}