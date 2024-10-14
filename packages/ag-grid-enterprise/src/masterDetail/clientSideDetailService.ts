import type {
    BeanCollection,
    FuncColsService,
    IClientSideRowModel,
    IRowModel,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import { BeanStub, ClientSideRowModelSteps, _isClientSideRowModel } from 'ag-grid-community';

export class ClientSideDetailService extends BeanStub implements NamedBean {
    beanName = 'clientSideDetailService' as const;

    private rowModel: IRowModel;
    private funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection): void {
        this.funcColsService = beans.funcColsService;
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        if (_isClientSideRowModel(this.gos)) {
            this.addManagedPropertyListeners(['treeData', 'masterDetail'], (params) => {
                const properties = params.changeSet?.properties;
                if (properties) {
                    const enabled = this.gos.get('masterDetail');
                    const masterDetailChanged = properties.includes('masterDetail');
                    let needUpdate = false;

                    if (enabled && properties.includes('treeData')) {
                        needUpdate = true; // When treeData and masterDetail are enabled, we need to check if leafs/groups changed
                    } else if (masterDetailChanged) {
                        needUpdate = true; // When masterDetail changes, we need to update all rows
                    }

                    if (needUpdate) {
                        let changed = false;
                        (this.rowModel as IClientSideRowModel).forEachLeafNode!((node) => {
                            if (this.updateMaster(node, masterDetailChanged, true)) {
                                changed = true;
                            }
                        });

                        if (changed) {
                            // We need to refresh the model to ensure all row components are rerendered
                            (this.rowModel as IClientSideRowModel).refreshModel({ step: ClientSideRowModelSteps.MAP });
                        }
                    }
                }
            });

            this.addManagedEventListeners({
                rowDataUpdated: ({ transactions }) => {
                    if (transactions && transactions.length) {
                        // Row data transactional update
                        const updatedNodes = new Set<RowNode>();
                        for (const transaction of transactions) {
                            for (const rowNode of transaction.update) {
                                updatedNodes.add(rowNode as RowNode);
                            }
                        }
                        (this.rowModel as IClientSideRowModel).forEachLeafNode!((node) => {
                            this.updateMaster(node, false, updatedNodes.has(node));
                        });
                    } else {
                        // New row data
                        (this.rowModel as IClientSideRowModel).forEachLeafNode!((node) => {
                            this.updateMaster(node, true, false);
                        });
                    }

                    // Note that CSRM will invoke refreshModel after this event
                },
            });
        }
    }

    private updateMaster<TData = any>(row: RowNode<TData>, overrideExpanded: boolean, updated: boolean): boolean {
        const gos = this.gos;
        const oldMaster = row.master;
        const newRow = oldMaster === undefined;

        let master = gos.get('masterDetail');

        const treeGroup = row.group && !!row.treeNode;

        if (treeGroup) {
            master = false; // Tree groups cannot be master rows
        }

        if (master) {
            if (newRow || updated) {
                const data = row.data;
                if (data) {
                    // if we are doing master detail, then the default is that everything can be a Master Row.
                    const isRowMasterFunc = gos.get('isRowMaster');
                    master = !isRowMasterFunc || !!isRowMasterFunc(row.data);
                }
            } else {
                master = oldMaster;
            }
        }

        if ((overrideExpanded || newRow) && !treeGroup) {
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
            row.expanded = expanded;
        } else if (oldMaster && !master) {
            // if changing AWAY from master, then un-expand, otherwise next time it's shown it is expanded again
            row.expanded = false;
        }

        if (oldMaster === master) {
            return false; // No changes
        }

        row.master = master;
        if (!newRow) {
            row.dispatchRowEvent('masterChanged');
        }

        return true;
    }
}
