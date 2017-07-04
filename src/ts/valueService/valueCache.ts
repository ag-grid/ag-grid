import {Autowired, Bean, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";

@Bean('valueCache')
export class ValueCache {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private cacheVersion = 0;
    private cacheActive: boolean;
    private invalidateOnDataChanged: boolean;

    @PostConstruct
    public init(): void {
        this.cacheActive = !this.gridOptionsWrapper.isValueCacheOff();
        this.invalidateOnDataChanged = this.gridOptionsWrapper.isValueCacheExpiresAfterUpdate();
    }

    public onDataChanged(): void {
        if (this.invalidateOnDataChanged) {
            this.invalidate();
        }
    }

    public invalidate(): void {
        this.cacheVersion++;
    }

    public setValue(rowNode: RowNode, colId: string, value: any): any {
        if (this.cacheActive) {
            if (rowNode.__cacheVersion !== this.cacheVersion) {
                rowNode.__cacheVersion = this.cacheVersion;
                rowNode.__cacheData = {};
            }
            rowNode.__cacheData[colId] = value;
        }
    }

    public getValue(rowNode: RowNode, colId: string): any {
        let valueInCache = this.cacheActive
            && rowNode.__cacheVersion===this.cacheVersion
            && rowNode.__cacheData[colId]!==undefined;
        if (valueInCache) {
            return rowNode.__cacheData[colId];
        } else {
            return undefined;
        }
    }

}
