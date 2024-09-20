import type { BeanCollection } from '../context/context';

export function paginationIsLastPageFound(beans: BeanCollection): boolean {
    return beans.rowModel.isLastRowIndexKnown();
}

export function paginationGetPageSize(beans: BeanCollection): number {
    return beans.paginationService?.getPageSize() ?? 100;
}

export function paginationGetCurrentPage(beans: BeanCollection): number {
    return beans.paginationService?.getCurrentPage() ?? 0;
}
export function paginationGetPageCount(beans: BeanCollection): number {
    return beans.paginationService?.getTotalPages() ?? 1;
}
/** @deprecated v32.2 */
export function paginationGetTotalPages(beans: BeanCollection): number {
    return paginationGetPageCount(beans);
}

/** @deprecated v32.2 */
export function paginationGetRowCount(beans: BeanCollection): number {
    return beans.paginationService ? beans.paginationService.getMasterRowCount() : beans.rowModel.getRowCount();
}

export function paginationGoToNextPage(beans: BeanCollection): void {
    beans.paginationService?.goToNextPage();
}

export function paginationGoToPreviousPage(beans: BeanCollection): void {
    beans.paginationService?.goToPreviousPage();
}

export function paginationGoToFirstPage(beans: BeanCollection): void {
    beans.paginationService?.goToFirstPage();
}

export function paginationGoToLastPage(beans: BeanCollection): void {
    beans.paginationService?.goToLastPage();
}

export function paginationGoToPage(beans: BeanCollection, page: number): void {
    beans.paginationService?.goToPage(page);
}
