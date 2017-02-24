// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class PaginationController {
    private filterManager;
    private gridPanel;
    private gridOptionsWrapper;
    private selectionController;
    private sortController;
    private eventService;
    private rowModel;
    private inMemoryRowModel;
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
    private checkForDeprecated();
    private reset(freshDatasource);
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
