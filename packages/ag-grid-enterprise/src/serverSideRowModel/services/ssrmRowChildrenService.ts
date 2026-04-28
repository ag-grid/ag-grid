import type { IRowChildrenService, NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

/** handles row grouping and tree data logic */
export class SsrmRowChildrenService extends BeanStub implements NamedBean, IRowChildrenService {
    beanName = 'rowChildrenSvc' as const;

    public getHasChildrenValue(rowNode: RowNode): boolean | null {
        const isTreeData = this.gos.get('treeData');
        const isGroupFunc = this.gos.get('isServerSideGroup');
        // stubs and footers can never have children, as they're grid rows. if tree data the presence of children
        // is determined by the isServerSideGroup callback, if not tree data then the rows group property will be set.
        if (rowNode.stub || rowNode.footer) {
            return false;
        }
        if (!isTreeData) {
            return !!rowNode.group;
        }
        if (!isGroupFunc) {
            return false;
        }
        const result = isGroupFunc(rowNode.data);
        if (typeof result === 'object' && result !== null) {
            if (result.childCount != null) {
                rowNode.serverSideChildCount = result.childCount;
            }
            return result.hasChildren;
        }
        return !!result;
    }
}
