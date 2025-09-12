import type { NamedBean } from '../context/bean';
import { _getClientSideRowModel } from '../main';
import { AbstractClientSideNodeManager } from './abstractClientSideNodeManager';

export class ClientSideNodeManager<TData> extends AbstractClientSideNodeManager<TData> implements NamedBean {
    beanName = 'csrmNodeSvc' as const;

    public override updateGroupRowData(): void {
        const csrm = _getClientSideRowModel(this.beans);
        if (!csrm) {
            return;
        }

        const valueSvc = this.beans.valueSvc;
        const groupDisplayCols = this.beans.showRowGroupCols?.getShowRowGroupCols();
        csrm.forEachNode((node) => {
            if (!node.group) {
                return;
            }

            node.groupData = {};
            if (!groupDisplayCols?.length) {
                return;
            }

            for (const col of groupDisplayCols) {
                const groupColumn = node.rowGroupColumn;
                // if no group column, this is tree data and we have to take the key
                if (!groupColumn) {
                    for (const col of groupDisplayCols) {
                        node.groupData[col.getColId()] = node.key;
                    }
                    return;
                }

                const isRowGroupDisplayed = groupColumn !== null && col.isRowGroupDisplayed(groupColumn.getId());
                if (isRowGroupDisplayed) {
                    // if maintain group value type, get the value from any leaf node.
                    node.groupData![col.getColId()] = valueSvc.getValue(
                        groupColumn,
                        node.allLeafChildren?.[0]
                    );
                }
            }
        });
    }
}
