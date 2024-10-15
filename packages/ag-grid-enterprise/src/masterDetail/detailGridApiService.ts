import type {
    BeanCollection,
    DetailGridInfo,
    FuncColsService,
    IDetailGridApiService,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import { BeanStub, _exists } from 'ag-grid-community';

export class DetailGridApiService extends BeanStub implements NamedBean, IDetailGridApiService {
    beanName = 'detailGridApiService' as const;

    private funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection): void {
        this.funcColsService = beans.funcColsService;
    }

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined } = {};

    public setMasterForAllRows<TData = any>(rows: RowNode<TData>[] | null | undefined): void {
        if (rows) {
            for (let i = 0, len = rows.length; i < len; i++) {
                const rowNode = rows[i];
                const data = rowNode.data;
                if (data) {
                    this.setMasterForRow(rowNode, data, true);
                }
            }
        }
    }

    public setMasterForRow<TData = any>(rowNode: RowNode<TData>, data: TData, shouldSetExpanded: boolean): void {
        const oldMaster = rowNode.master;
        let master = false;

        if (this.gos.get('masterDetail')) {
            // if we are doing master detail, then the default is that everything can be a Master Row.
            const isRowMasterFunc = this.gos.get('isRowMaster');
            master = !isRowMasterFunc || !!isRowMasterFunc(data);
        }

        if (shouldSetExpanded) {
            let expanded = false;
            if (master) {
                const expandByDefault = this.gos.get('groupDefaultExpanded');
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
            rowNode.dispatchRowEvent('masterChanged');
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
        Object.values(this.detailGridInfoMap).forEach((gridInfo: DetailGridInfo) => {
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
