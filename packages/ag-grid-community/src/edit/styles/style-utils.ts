import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import { _valuesDiffer } from '../utils/editors';

const editHighlightFn = (edit?: EditValue) => {
    if (edit !== undefined) {
        return _valuesDiffer(edit);
    }
};

export function _hasEdits(beans: BeanCollection, position: EditPosition): boolean | undefined {
    const edit = beans.editModelSvc?.getEdit(position);
    return editHighlightFn(edit);
}

export function _hasLeafEdits(beans: BeanCollection, position: EditPosition): boolean | undefined {
    return position.rowNode?.allLeafChildren?.some((rowNode) => {
        const mainNode = editHighlightFn(beans.editModelSvc?.getEdit({ rowNode, column: position.column }));
        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        const siblingNode = editHighlightFn(
            beans.editModelSvc?.getEdit({ rowNode: pinnedSibling, column: position.column })
        );

        return mainNode || siblingNode;
    });
}

export function _hasPinnedEdits(beans: BeanCollection, position: EditPosition): boolean | undefined {
    const pinnedSibling = (position.rowNode as RowNode).pinnedSibling;
    return editHighlightFn(
        beans.editModelSvc?.getEdit({
            rowNode: pinnedSibling,
            column: position.column,
        })
    );
}
