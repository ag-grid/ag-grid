import { Autowired, Bean, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RowNode } from "../entities/rowNode";

@Bean('valueCache')
export class ValueCache {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private cacheVersion = 0;
    private active: boolean;
    private neverExpires: boolean;

    @PostConstruct
    public init(): void {
        this.active = this.gridOptionsWrapper.isValueCache();
        this.neverExpires = this.gridOptionsWrapper.isValueCacheNeverExpires();
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
        const valueInCache = this.active
            && rowNode.__cacheVersion === this.cacheVersion
            && rowNode.__cacheData[colId] !== undefined;
        if (valueInCache) {
            return rowNode.__cacheData[colId];
        } else {
            return undefined;
        }
    }

}
