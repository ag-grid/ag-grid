import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { Autowired, Bean, PostConstruct, PreDestroy } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";

/**
 * For Master Detail, it is required to keep components between expanding & collapsing parents.
 * For example a user expands row A (and shows a detail grid for this row), then when row A
 * is closed, we want to keep the detail grid, so next time row A is expanded the detail grid
 * is showed with it's context intact, eg if user sorted in the detail grid, that sort should
 * still be applied after the detail grid is shown for the second time.
 */
@Bean('detailRowCompCache')
export class DetailRowCompCache {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private cacheItems: CacheItem[] = [];

    private maxCacheSize: number;

    private active: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.active = this.gridOptionsWrapper.isKeepDetailRows();
        this.maxCacheSize = this.gridOptionsWrapper.getKeepDetailRowsCount();
    }

    public addOrDestroy(rowNode: RowNode, pinned: string, comp: ICellRendererComp): void {
        // only accept detail rows
        const doNotUseCache = !this.active || !rowNode.detail;
        if (doNotUseCache) {
            this.destroyFullWidthRow(comp);
            return;
        }

        const item = this.getCacheItem(rowNode, true);

        // put the comp in the right location of the item.
        // we also destroy any previous comp - this should never happen
        // as the logic outside of this class shouldn't be adding same item to the
        // cache twice, however we cater for it in case in future releases code
        // outside of this class is changed and this could happen.
        switch (pinned) {
            case Column.PINNED_LEFT:
                this.destroyFullWidthRow(item.left);
                item.left = comp;
                break;
            case Column.PINNED_RIGHT:
                this.destroyFullWidthRow(item.right);
                item.right = comp;
                break;
            default:
                this.destroyFullWidthRow(item.center);
                item.center = comp;
                break;
        }

        this.cacheItems.sort((a: CacheItem, b: CacheItem) => {
            return b.lastAccessedTime - a.lastAccessedTime;
        });
        this.purgeCache(this.maxCacheSize);
    }

    private getCacheItem(rowNode: RowNode, autoCreate = false): CacheItem {
        let res: CacheItem;

        for (let i = 0; i < this.cacheItems.length; i++) {
            const item = this.cacheItems[i];
            if (item.rowNode === rowNode) {
                res = item;
                break;
            }
        }

        if (!res && autoCreate) {
            res = {
                rowNode: rowNode
            } as CacheItem;
            this.cacheItems.push(res);
        }

        if (res) {
            this.stampCacheItem(res);
        }

        return res;
    }

    private stampCacheItem(item: CacheItem) {
        item.lastAccessedTime = new Date().getTime();
    }

    private destroyFullWidthRow(comp: ICellRendererComp): void {
        if (comp && comp.destroy) {
            comp.destroy();
        }
    }

    private purgeCache(startIndex: number): void {
        // delete all rows past the index of interest
        for (let i = startIndex; i < this.cacheItems.length; i++) {
            const item = this.cacheItems[i];
            this.destroyFullWidthRow(item.center);
            this.destroyFullWidthRow(item.left);
            this.destroyFullWidthRow(item.right);
        }

        // change the length of the array so it no longer contains the deleted items
        if (this.cacheItems.length > startIndex) {
            this.cacheItems.length = startIndex;
        }
    }

    public get(rowNode: RowNode, pinned: string): ICellRendererComp {
        if (!rowNode.detail) { return undefined; }

        const item = this.getCacheItem(rowNode);
        let res: ICellRendererComp;
        if (item) {
            switch (pinned) {
                case Column.PINNED_LEFT:
                    if (item.left) {
                        res = item.left;
                        item.left = undefined;
                    }
                    break;
                case Column.PINNED_RIGHT:
                    if (item.right) {
                        res = item.right;
                        item.right = undefined;
                    }
                    break;
                default:
                    if (item.center) {
                        res = item.center;
                        item.center = undefined;
                    }
                    break;
            }
        }
        return res;
    }

    @PreDestroy
    public destroy(): void {
        this.purgeCache(0);
    }

}

interface CacheItem {
    rowNode: RowNode;
    lastAccessedTime: number;
    center?: ICellRendererComp;
    left?: ICellRendererComp;
    right?: ICellRendererComp;
}
