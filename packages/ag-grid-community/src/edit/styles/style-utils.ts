import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import { _sourceAndPendingDiffer } from '../utils/editors';

const editHighlightFn = (edit?: EditValue, includeEditing: boolean = false) => {
    if (edit !== undefined) {
        return _sourceAndPendingDiffer(edit) || (includeEditing && edit.state === 'editing');
    }
};

export function _hasEdits(
    beans: BeanCollection,
    position: EditPosition,
    includeEditing: boolean = false
): boolean | undefined {
    return editHighlightFn(beans.editModelSvc?.getEdit(position), includeEditing);
}

export function _hasLeafEdits(beans: BeanCollection, position: EditPosition): boolean | undefined {
    const { editModelSvc } = beans;
    const { column, rowNode } = position;
    if (!editModelSvc || !rowNode) {
        return;
    }

    // if we have group total rows, we should decorate them, rather than agg nodes
    if (beans.gos.get('groupTotalRow') && !rowNode.footer) {
        return false;
    }

    const query: EditPosition = { rowNode, column };
    const nodeHasLeafEdit = (node: RowNode): boolean => {
        const childrenAfterGroup = node.childrenAfterGroup;
        if (!childrenAfterGroup) {
            return false;
        }
        for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
            const child = childrenAfterGroup[i];
            if (child.data) {
                query.rowNode = child;
                if (editHighlightFn(editModelSvc!.getEdit(query))) {
                    return true;
                }
                query.rowNode = child.pinnedSibling;
                if (editHighlightFn(editModelSvc!.getEdit(query))) {
                    return true;
                }
            }
            if (child.group && nodeHasLeafEdit(child)) {
                return true;
            }
        }
        return false;
    };

    return nodeHasLeafEdit(rowNode as RowNode);
}

export function _hasPinnedEdits(beans: BeanCollection, { rowNode, column }: EditPosition): boolean | undefined {
    rowNode = (rowNode as RowNode).pinnedSibling;
    if (!rowNode) {
        return;
    }
    return editHighlightFn(
        beans.editModelSvc?.getEdit({
            rowNode,
            column,
        })
    );
}
