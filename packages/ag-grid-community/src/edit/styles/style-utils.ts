import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import { _valuesDiffer } from '../utils/editors';

const editHighlightFn = (edit?: EditValue, includeEditing: boolean = false) => {
    if (edit !== undefined) {
        return _valuesDiffer(edit) || (includeEditing && edit.state === 'editing');
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

    // if we have group total rows, we should decorate them, rather than agg nodes
    if (beans.gos.get('groupTotalRow') && !rowNode?.footer) {
        return false;
    }

    for (const node of rowNode?.allLeafChildren ?? []) {
        const highlight =
            editHighlightFn(editModelSvc?.getEdit({ rowNode: node, column })) ||
            editHighlightFn(editModelSvc?.getEdit({ rowNode: (node as RowNode).pinnedSibling, column }));

        if (highlight) {
            return true;
        }
    }
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
