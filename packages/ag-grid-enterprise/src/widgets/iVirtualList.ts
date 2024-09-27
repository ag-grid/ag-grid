export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
    /** Required if using soft refresh. If rows are equal, componentUpdater will be called instead of remove/create */
    areRowsEqual?(oldRow: any, newRow: any): boolean;
}
