import type { DetailGridInfo } from '../api/gridApi';
import type { RowNode } from '../entities/rowNode';

export interface IDetailGridApiService {
    /** Called by CSRM to initialize a node as master */
    setMasterForRow<TData = any>(rowNode: RowNode<TData>, data: TData, shouldSetExpanded: boolean): void;

    /** Called by CSRM to update all row nodes master when masterDetail changes */
    setMasterForAllRows<TData = any>(rows: RowNode<TData>[] | null | undefined, shouldSetExpanded: boolean): void;

    addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void;

    removeDetailGridInfo(id: string): void;

    getDetailGridInfo(id: string): DetailGridInfo | undefined;

    forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void): void;
}
