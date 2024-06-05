import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { _exists } from '../utils/generic';
import { _iterateObject } from '../utils/object';
import type { DetailGridInfo } from './gridApi';

export class DetailGridApiService extends BeanStub implements NamedBean {
    beanName = 'detailGridApiService' as const;

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined } = {};

    public addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void {
        this.detailGridInfoMap[id] = gridInfo;
    }

    public removeDetailGridInfo(id: string): void {
        delete this.detailGridInfoMap[id];
    }

    public getDetailGridInfo(id: string): DetailGridInfo | undefined {
        return this.detailGridInfoMap[id];
    }

    public forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void) {
        let index = 0;
        _iterateObject(this.detailGridInfoMap, (id: string, gridInfo: DetailGridInfo) => {
            // check for undefined, as old references will still be lying around
            if (_exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }

    public override destroy(): void {
        this.detailGridInfoMap = {};
        super.destroy();
    }
}
