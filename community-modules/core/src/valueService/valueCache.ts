import { BeanStub } from '../context/beanStub';
import { Bean } from '../context/context';
import { RowNode } from '../entities/rowNode';

@Bean('valueCache')
export class ValueCache extends BeanStub {
    private cacheVersion = 0;
    private active: boolean;
    private neverExpires: boolean;

    public override postConstruct(): void {
        super.postConstruct();
        this.active = this.gos.get('valueCache');
        this.neverExpires = this.gos.get('valueCacheNeverExpires');
    }

    public onDataChanged(): void {
        if (this.neverExpires) {
            return;
        }

        this.expire();
    }

    public expire(): void {
        this.cacheVersion++;
    }

    public setValue(rowNode: RowNode, colId: string, value: any): any {
        if (this.active) {
            if (rowNode.__cacheVersion !== this.cacheVersion) {
                rowNode.__cacheVersion = this.cacheVersion;
                rowNode.__cacheData = {};
            }

            rowNode.__cacheData[colId] = value;
        }
    }

    public getValue(rowNode: RowNode, colId: string): any {
        if (!this.active || rowNode.__cacheVersion !== this.cacheVersion) {
            return undefined;
        }

        return rowNode.__cacheData[colId];
    }
}
