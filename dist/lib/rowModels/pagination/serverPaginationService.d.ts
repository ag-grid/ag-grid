// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IDatasource } from "./../iDatasource";
import { BeanStub } from "../../context/beanStub";
export interface IPaginationService {
    isLastPageFound(): boolean;
    getCurrentPage(): number;
    goToNextPage(): void;
    goToPreviousPage(): void;
    goToFirstPage(): void;
    goToLastPage(): void;
    getPageSize(): number;
    getTotalPages(): number;
    getTotalRowCount(): number;
    goToPage(page: number): void;
}
export declare class ServerPaginationService extends BeanStub implements IPaginationService {
    private filterManager;
    private gridPanel;
    private gridOptionsWrapper;
    private selectionController;
    private sortController;
    private eventService;
    private rowModel;
    private inMemoryRowModel;
    private callVersion;
    private datasource;
    private pageSize;
    private rowCount;
    private lastPageFound;
    private totalPages;
    private currentPage;
    isLastPageFound(): boolean;
    getPageSize(): number;
    getCurrentPage(): number;
    getTotalPages(): number;
    getTotalRowCount(): number;
    goToNextPage(): void;
    goToPreviousPage(): void;
    goToFirstPage(): void;
    goToLastPage(): void;
    goToPage(page: number): void;
    init(): void;
    setDatasource(datasource: IDatasource): void;
    private checkForDeprecated();
    private setPageSize();
    private reset(freshDatasource);
    private resetCurrentPage();
    private calculateTotalPages();
    private pageLoaded(rows, lastRowIndex);
    private loadPage();
    private isCallDaemon(versionCopy);
}
