// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export default class PaginationController {
    private eGui;
    private btNext;
    private btPrevious;
    private btFirst;
    private btLast;
    private lbCurrent;
    private lbTotal;
    private lbRecordCount;
    private lbFirstRowOnPage;
    private lbLastRowOnPage;
    private ePageRowSummaryPanel;
    private angularGrid;
    private callVersion;
    private gridOptionsWrapper;
    private datasource;
    private pageSize;
    private rowCount;
    private foundMaxRow;
    private totalPages;
    private currentPage;
    init(angularGrid: any, gridOptionsWrapper: any): void;
    setDatasource(datasource: any): void;
    reset(): void;
    private myToLocaleString(input);
    private setTotalLabels();
    private calculateTotalPages();
    private pageLoaded(rows, lastRowIndex);
    private updateRowLabels();
    private loadPage();
    private isCallDaemon(versionCopy);
    private onBtNext();
    private onBtPrevious();
    private onBtFirst();
    private onBtLast();
    private isZeroPagesToDisplay();
    private enableOrDisableButtons();
    private createTemplate();
    getGui(): any;
    private setupComponents();
}
