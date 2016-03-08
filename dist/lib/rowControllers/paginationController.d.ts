// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class PaginationController {
    private filterManager;
    private gridPanel;
    private gridOptionsWrapper;
    private selectionController;
    private rowModel;
    private sortController;
    private eventService;
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
    private callVersion;
    private datasource;
    private pageSize;
    private rowCount;
    private foundMaxRow;
    private totalPages;
    private currentPage;
    init(): void;
    setDatasource(datasource: any): void;
    private reset();
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
