import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ValueCache extends BeanStub implements NamedBean {
    beanName = 'valueCache' as const;

    private cacheVersion = 0;
    private neverExpires: boolean = false;

    public postConstruct(): void {
        this.neverExpires = this.gos.get('valueCacheNeverExpires');
    }

    public onDataChanged(): void {
        if (!this.neverExpires) {
            this.expire();
        }
    }

    public expire(): void {
        this.cacheVersion++;
    }

    public setValue(rowNode: RowNode, colId: string, value: any): void {
        const cacheVersion = this.cacheVersion;
        if (rowNode.__cacheVersion !== cacheVersion) {
            rowNode.__cacheVersion = cacheVersion;
            rowNode.__cacheData = {};
        }
        rowNode.__cacheData[colId] = value;
    }

    public getValue(rowNode: RowNode, colId: string): any {
        if (rowNode.__cacheVersion !== this.cacheVersion) {
            return undefined;
        }
        return rowNode.__cacheData[colId];
    }
}
