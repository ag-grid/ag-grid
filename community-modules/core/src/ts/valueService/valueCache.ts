import { Bean, PostConstruct } from "../context/context";
import { RowNode } from "../entities/rowNode";
import { BeanStub } from "../context/beanStub";

@Bean('valueCache')
export class ValueCache extends BeanStub {

    private cacheVersion = 0;
    private active: boolean;
    private neverExpires: boolean;

    @PostConstruct
    public init(): void {
        this.active = this.gridOptionsService.is('valueCache');
        this.neverExpires = this.gridOptionsService.is('valueCacheNeverExpires');
    }

    public onDataChanged(): void {
        if (this.neverExpires) { return; }

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
