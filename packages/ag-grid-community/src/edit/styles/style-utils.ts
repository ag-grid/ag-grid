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

const nodeHasLeafEdit = (
    children: RowNode[] | null | undefined,
    editModelSvc: BeanCollection['editModelSvc'],
    column: EditPosition['column']
): boolean | undefined => {
    if (!children) {
        return;
    }
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if (child.data) {
            const highlight =
                editHighlightFn(editModelSvc?.getEdit({ rowNode: child, column })) ||
                editHighlightFn(editModelSvc?.getEdit({ rowNode: child.pinnedSibling, column }));
            if (highlight) {
                return true;
            }
        }
        if (nodeHasLeafEdit(child.childrenAfterGroup, editModelSvc, column)) {
            return true;
        }
    }
};

export function _hasLeafEdits(beans: BeanCollection, position: EditPosition): boolean | undefined {
    const { column, rowNode } = position;

    // if we have group total rows, we should decorate them, rather than agg nodes
    if (beans.gos.get('groupTotalRow') && !rowNode?.footer) {
        return false;
    }

    return nodeHasLeafEdit(rowNode?.childrenAfterGroup as RowNode[] | null | undefined, beans.editModelSvc, column);
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
