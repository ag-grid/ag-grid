import type {
    BeanCollection,
    FuncColsService,
    IClientSideDetailService,
    IClientSideRowModel,
    IRowModel,
    NamedBean,
    RowNode,
    RowRenderer,
} from 'ag-grid-community';
import { BeanStub, ClientSideRowModelSteps, _isClientSideRowModel } from 'ag-grid-community';

export class ClientSideDetailService extends BeanStub implements NamedBean, IClientSideDetailService {
    beanName = 'clientSideDetailService' as const;

    private rowModel: IRowModel;
    private funcColsService: FuncColsService;
    private rowRenderer: RowRenderer;

    public wireBeans(beans: BeanCollection): void {
        this.funcColsService = beans.funcColsService;
        this.rowModel = beans.rowModel;
        this.rowRenderer = beans.rowRenderer;
    }

    private isEnabled() {
        const gos = this.gos;
        return gos.get('masterDetail') && !gos.get('treeData');
    }

    public postConstruct(): void {
        if (_isClientSideRowModel(this.gos)) {
            let enabled = this.isEnabled();
            this.addManagedPropertyListeners(['treeData', 'masterDetail'], (params) => {
                const properties = params.changeSet?.properties;
                if (properties) {
                    const newEnabled = this.isEnabled();
                    if (enabled !== newEnabled) {
                        enabled = newEnabled;
                        const rowModel = this.rowModel as IClientSideRowModel;
                        let changed = false;
                        rowModel.forEachLeafNode!((node) => {
                            if (this.setMasterForRow(node, node.data, true, newEnabled)) {
                                changed = true;
                            }
                        });

                        if (changed) {
                            rowModel.refreshModel({ step: ClientSideRowModelSteps.MAP });
                        }
                    }
                }
            });
        }
    }

    public setMasterForRow<TData = any>(
        rowNode: RowNode<TData>,
        data: TData,
        shouldSetExpanded: boolean,
        master = this.isEnabled()
    ): boolean {
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
                return true;
            }
        }

        return false;
    }
}
