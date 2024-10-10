import type {
    BeanCollection,
    DetailGridInfo,
    FuncColsService,
    IDetailGridApiService,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import { BeanStub, _exists, _iterateObject } from 'ag-grid-community';

export class DetailGridApiService extends BeanStub implements NamedBean, IDetailGridApiService {
    beanName = 'detailGridApiService' as const;

    private funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection): void {
        this.funcColsService = beans.funcColsService;
    }

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined } = {};

    public setMasterForRow<TData = any>(
        rowNode: RowNode<TData>,
        data: TData,
        master: boolean,
        shouldSetExpanded: boolean
    ): void {
        const gos = this.gos;
        const oldMaster = rowNode.master;

        if (master) {
            // if we are doing master detail, then the default is that everything can be a Master Row.
            const isRowMasterFunc = gos.get('isRowMaster');
            master = !isRowMasterFunc || !!isRowMasterFunc(data);
        }
        // TODO: AG-1752 Allow tree data leaf rows to serve as master rows for detail grids (Tree Data hosting Master/Detail)

        if (shouldSetExpanded) {
            let expanded = false;
            if (master) {
                const expandByDefault = gos.get('groupDefaultExpanded');
                // TODO: AG-11476 isGroupOpenByDefault callback doesn't apply to master/detail grid
                if (expandByDefault === -1) {
                    expanded = true;
                } else {
                    // need to take row group into account when determining level
                    const masterRowLevel = this.funcColsService.rowGroupCols?.length ?? 0;
                    expanded = masterRowLevel < expandByDefault;
                }
            }
            rowNode.expanded = expanded;
        } else if (oldMaster && !master) {
            // if changing AWAY from master, then un-expand, otherwise next time it's shown it is expanded again
            rowNode.expanded = false;
        }

        if (oldMaster !== master) {
            rowNode.master = master;
            if (master || oldMaster !== undefined) {
                rowNode.dispatchRowEvent('masterChanged');
            }
        }
    }

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
