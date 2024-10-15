import type {
    BeanCollection,
    FuncColsService,
    IClientSideDetailService,
    IClientSideRowModel,
    NamedBean,
    RowDataUpdatedEvent,
    RowNodeTransaction,
} from 'ag-grid-community';
import { RowNode, _exists } from 'ag-grid-community';
import { BeanStub, ClientSideRowModelSteps, _isClientSideRowModel } from 'ag-grid-community';

export class ClientSideDetailService extends BeanStub implements NamedBean, IClientSideDetailService {
    beanName = 'clientSideDetailService' as const;

    private beans: BeanCollection;
    private enabled: boolean;
    private rowModel: IClientSideRowModel;
    private funcColsService: FuncColsService;

    private isEnabled(): boolean {
        const gos = this.gos;
        return (
            gos.get('masterDetail') &&
            // TODO: AG-1752: [Tree Data] Allow tree data leaf rows to serve as master rows for detail grids (Tree Data hosting Master/Detail)"
            !gos.get('treeData')
        );
    }

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
        this.funcColsService = beans.funcColsService;
        this.rowModel = beans.rowModel as IClientSideRowModel;
    }

    public postConstruct(): void {
        if (_isClientSideRowModel(this.gos)) {
            this.enabled = this.isEnabled();
            this.addManagedPropertyListeners(['treeData', 'masterDetail'], this.enabledUpdated.bind(this));
            this.addManagedEventListeners({ rowDataUpdated: this.rowDataUpdated.bind(this) });
        }
    }

    private enabledUpdated() {
        const enabled = this.isEnabled();
        if (this.enabled !== enabled) {
            if (this.setMasters(null)) {
                this.rowModel.refreshModel({ step: ClientSideRowModelSteps.MAP });
            }
        }
    }

    private rowDataUpdated({ transactions }: RowDataUpdatedEvent) {
        this.setMasters(transactions);
    }

    private setMasters(transactions: RowNodeTransaction[] | null | undefined): boolean {
        const enabled = this.isEnabled();
        this.enabled = enabled;

        const gos = this.gos;
        const isRowMaster = gos.get('isRowMaster');
        const groupDefaultExpanded = gos.get('groupDefaultExpanded');
        let rowsChanged = false;

        const setMaster = (row: RowNode, created: boolean, updated: boolean) => {
            const oldMaster = row.master;

            let newMaster = enabled;

            if (enabled) {
                if (created || updated) {
                    if (isRowMaster) {
                        const data = row.data;
                        newMaster = !!data && !!isRowMaster(data);
                    }
                } else {
                    newMaster = oldMaster;
                }
            }

            if (newMaster && created) {
                // TODO: AG-11476 isGroupOpenByDefault callback doesn't apply to master/detail grid

                if (groupDefaultExpanded === -1) {
                    row.expanded = true;
                } else {
                    // need to take row group into account when determining level
                    const masterRowLevel = this.funcColsService.rowGroupCols?.length ?? 0;
                    row.expanded = masterRowLevel < groupDefaultExpanded;
                }
            } else if (!newMaster && oldMaster) {
                row.expanded = false; // if changing AWAY from master, then un-expand, otherwise next time it's shown it is expanded again
            }

            if (newMaster !== oldMaster) {
                row.master = newMaster;
                rowsChanged ||= !newMaster !== !oldMaster;

                row.dispatchRowEvent('masterChanged');
            }
        };

        if (transactions) {
            for (let i = 0, len = transactions.length; i < len; ++i) {
                const { update, add } = transactions[i];
                for (let j = 0, len = add.length; j < len; ++j) {
                    setMaster(add[j] as RowNode, true, false);
                }
                for (let j = 0, len = update.length; j < len; ++j) {
                    setMaster(update[j] as RowNode, false, true);
                }
            }
        } else {
            const allLeafChildren = this.rowModel.rootNode!.allLeafChildren!;
            for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
                setMaster(allLeafChildren[i], true, false);
            }
        }

        return rowsChanged;
    }

    /** Used by flatten stage to get or create a detail node from a master node */
    public getDetail(masterNode: RowNode): RowNode | null {
        if (!masterNode.master || !masterNode.expanded) {
            return null;
        }

        let detailNode = masterNode.detailNode;
        if (detailNode) {
            return detailNode;
        }

        detailNode = new RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;

        if (_exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }

        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        masterNode.detailNode = detailNode;

        return detailNode;
    }
}
