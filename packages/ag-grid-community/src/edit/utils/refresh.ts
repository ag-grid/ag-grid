import type { BeanCollection } from '../../context/context';
import type { EditPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import { _getRowCtrl } from './controllers';
import type { DestroyEditorParams } from './editors';
import { _destroyEditor, _populateModelValidationErrors } from './editors';

/** Drops edits on pinned rows that left their section: static pinned rows are dropped without being
 *  destroyed and without reporting it, so membership has to be re-tested. */
export const _purgeStalePinnedEdits = (beans: BeanCollection) => () => {
    const editMap = beans.editModelSvc?.getEditMap();
    if (!editMap?.size) {
        return;
    }

    const pinnedRowModel = beans.pinnedRowModel;
    let stale: Required<EditPosition>[] | undefined;
    editMap.forEach((editRow, rowNode) => {
        const pinned = rowNode.rowPinned;
        const id = rowNode.id;
        // No id means membership can't be tested, so keep the edit rather than discard it on a guess.
        if (pinned == null || id == null || pinnedRowModel?.getPinnedRowById(id, pinned) === rowNode) {
            return;
        }
        for (const column of editRow.keys()) {
            stale ??= [];
            stale.push({ rowNode, column });
        }
    });

    if (stale) {
        _purgeEdits(beans, stale);
    }
};

/**
 * Ends `positions` as edits: the editor stops (firing cellEditingStopped and clearing its validation), the
 * model entry goes, and a row left holding nothing is released from the strategy's started-rows bookkeeping.
 */
export const _purgeEdits = (beans: BeanCollection, positions: Required<EditPosition>[]): void => {
    const editModelSvc = beans.editModelSvc!;
    const editSvc = beans.editSvc!;

    // cancel: nothing wrote a value, so the stopped event must not advertise one.
    const params: DestroyEditorParams = { cancel: true };
    const cellValidations = editModelSvc.getCellValidationModel();
    const touchedRows = new Set<IRowNode>();
    for (let i = 0, len = positions.length; i < len; ++i) {
        const position = positions[i];
        // Via _destroyEditor so an open editor still fires cellEditingStopped; clearing after it, since it
        // re-reads the still-attached editor and would re-register the error it is about to strand.
        _destroyEditor(beans, position, params);
        cellValidations.clearCellValidation(position);
        editModelSvc.removeEdits(position);
        touchedRows.add(position.rowNode);
    }

    // A row purged down to nothing never reaches the stop pipeline, so the strategy would keep it in its
    // started-rows bookkeeping — no rowEditingStopped, and the detached node held alive.
    const releasedRows = new Set<IRowNode>();
    const rowValidations = editModelSvc.getRowValidationModel();
    let retainedEdits = false;
    for (const rowNode of touchedRows) {
        if (editModelSvc.getEditRow(rowNode)?.size) {
            retainedEdits = true;
        } else {
            releasedRows.add(rowNode);
            rowValidations.clearRowValidation({ rowNode });
        }
    }

    // The recorded row error was computed from an edit set that no longer exists, and what is left of the row
    // may break the rule on its own — so recompute rather than clear, and before the rows restyle below.
    if (retainedEdits) {
        _populateModelValidationErrors(beans);
    }

    for (const rowNode of touchedRows) {
        // Only once the edits are gone, or the row restyles as still-editing.
        const rowCtrl = _getRowCtrl(beans, { rowNode });
        if (rowCtrl) {
            editSvc.applyRowEditStyles(rowCtrl);
        }
    }
    if (releasedRows.size) {
        editSvc.releasePurgedRows(releasedRows);
    }
};
