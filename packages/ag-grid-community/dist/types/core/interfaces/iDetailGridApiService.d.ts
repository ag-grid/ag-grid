import type { DetailGridInfo } from '../api/gridApi';
export interface IDetailGridApiService {
    addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void;
    removeDetailGridInfo(id: string): void;
    getDetailGridInfo(id: string): DetailGridInfo | undefined;
    forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void): void;
}
