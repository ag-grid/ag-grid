import type { DetailGridInfo, IDetailGridApiService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class DetailGridApiService extends BeanStub implements NamedBean, IDetailGridApiService {
    beanName: "detailGridApiService";
    private detailGridInfoMap;
    addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void;
    removeDetailGridInfo(id: string): void;
    getDetailGridInfo(id: string): DetailGridInfo | undefined;
    forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void): void;
    destroy(): void;
}
