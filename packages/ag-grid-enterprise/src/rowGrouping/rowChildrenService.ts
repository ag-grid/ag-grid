import type { IRowChildrenService, NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub, _isServerSideRowModel } from 'ag-grid-community';

/** handles row grouping and tree data logic */
export class RowChildrenService extends BeanStub implements NamedBean, IRowChildrenService {
    beanName = 'rowChildrenService' as const;

    public updateHasChildren(rowNode: RowNode): void {
        // in CSRM, the group property will be set before the childrenAfterGroup property, check both to prevent flickering
        let newValue: boolean | null =
            (rowNode.group && !rowNode.footer) || (rowNode.childrenAfterGroup && rowNode.childrenAfterGroup.length > 0);

        const isSsrm = _isServerSideRowModel(this.gos);
        if (isSsrm) {
            const isTreeData = this.gos.get('treeData');
            const isGroupFunc = this.gos.get('isServerSideGroup');
            // stubs and footers can never have children, as they're grid rows. if tree data the presence of children
            // is determined by the isServerSideGroup callback, if not tree data then the rows group property will be set.
            newValue =
                !rowNode.stub &&
                !rowNode.footer &&
                (isTreeData ? !!isGroupFunc && isGroupFunc(rowNode.data) : !!rowNode.group);
        }

        if (newValue !== rowNode.__hasChildren) {
            rowNode.__hasChildren = !!newValue;
            rowNode.dispatchRowEvent('hasChildrenChanged');
        }
    }

    public hasChildren(rowNode: RowNode): boolean {
        if (rowNode.__hasChildren == null) {
            this.updateHasChildren(rowNode);
        }
        return rowNode.__hasChildren;
    }

    public setAllChildrenCount(rowNode: RowNode, allChildrenCount: number | null): void {
        if (rowNode.allChildrenCount !== allChildrenCount) {
            rowNode.allChildrenCount = allChildrenCount;
            rowNode.dispatchRowEvent('allChildrenCountChanged');
        }
    }
}
