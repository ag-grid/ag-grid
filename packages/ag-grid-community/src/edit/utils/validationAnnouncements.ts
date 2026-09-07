import type { LocaleTextFunc } from 'ag-stack';
import { _getLocaleTextFunc } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getAbsoluteRowIndex } from '../../entities/positionUtils';
import { getAriaHeaderRowCount } from '../../headerRendering/headerUtils';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { RowPosition } from '../../interfaces/iRowPosition';
import type { EditCellValidationModel, EditRowValidationModel } from '../editModelService';
import { _formatValidationMessages } from './validationMessages';

type ValidationModels = {
    cell: EditCellValidationModel;
    row: EditRowValidationModel;
};

type CellValidationAnnouncement = {
    rowNode: IRowNode;
    column: AgColumn;
    message: string;
};

type RowValidationAnnouncement = {
    rowNode: IRowNode;
    message: string;
};

type ValidationAnnouncements = {
    cells: CellValidationAnnouncement[];
    rows: RowValidationAnnouncement[];
};

type CollectValidationAnnouncementsParams = {
    previous?: ValidationModels;
};

const collectValidationAnnouncements = (
    translate: LocaleTextFunc,
    current: ValidationModels,
    { previous }: CollectValidationAnnouncementsParams = {}
): ValidationAnnouncements => {
    const cells: CellValidationAnnouncement[] = [];
    for (const [validationRowNode, rowValidations] of current.cell.getCellValidationMap()) {
        for (const [column, { errorMessages }] of rowValidations) {
            const message = _formatValidationMessages(errorMessages, translate, 'announcement');
            const previousMessages = previous?.cell.getCellValidation({
                rowNode: validationRowNode,
                column,
            })?.errorMessages;
            if (
                message.length > 0 &&
                (!previousMessages ||
                    message !== _formatValidationMessages(previousMessages, translate, 'announcement'))
            ) {
                cells.push({ rowNode: validationRowNode, column: column as AgColumn, message });
            }
        }
    }

    const rows: RowValidationAnnouncement[] = [];
    for (const [validationRowNode, { errorMessages }] of current.row.getRowValidationMap()) {
        const message = _formatValidationMessages(errorMessages, translate, 'announcement');
        const previousMessages = previous?.row.getRowValidation({ rowNode: validationRowNode })?.errorMessages;
        if (
            message.length > 0 &&
            (!previousMessages || message !== _formatValidationMessages(previousMessages, translate, 'announcement'))
        ) {
            rows.push({ rowNode: validationRowNode, message });
        }
    }

    return { cells, rows };
};

const hasRemovedValidationAnnouncement = (
    translate: LocaleTextFunc,
    previous: ValidationModels,
    current: ValidationModels
): boolean => {
    for (const [rowNode, rowValidations] of previous.cell.getCellValidationMap()) {
        for (const [column, { errorMessages }] of rowValidations) {
            const previousMessage = _formatValidationMessages(errorMessages, translate, 'announcement');
            const currentMessages = current.cell.getCellValidation({ rowNode, column })?.errorMessages ?? [];
            if (
                previousMessage.length > 0 &&
                _formatValidationMessages(currentMessages, translate, 'announcement').length === 0
            ) {
                return true;
            }
        }
    }

    for (const [rowNode, { errorMessages }] of previous.row.getRowValidationMap()) {
        const previousMessage = _formatValidationMessages(errorMessages, translate, 'announcement');
        const currentMessages = current.row.getRowValidation({ rowNode })?.errorMessages ?? [];
        if (
            previousMessage.length > 0 &&
            _formatValidationMessages(currentMessages, translate, 'announcement').length === 0
        ) {
            return true;
        }
    }

    return false;
};

const getColumnValidationLabel = (beans: BeanCollection, column: AgColumn): string =>
    beans.colNames.getDisplayNameForColumn(column, 'header', true) || column.getColId();

const getValidationAriaRowIndex = (beans: BeanCollection, rowNode: IRowNode): number | undefined => {
    const { rowIndex, rowPinned } = rowNode;
    if (rowIndex == null) {
        return undefined;
    }

    const rowPosition: RowPosition = { rowIndex, rowPinned: rowPinned ?? null };
    return getAriaHeaderRowCount(beans) + _getAbsoluteRowIndex(beans, rowPosition) + 1;
};

const formatValidationRowLabel = (translate: LocaleTextFunc, ariaRowIndex: number): string =>
    translate('ariaRowIndex', `Row ${ariaRowIndex}`, [String(ariaRowIndex)]);

const formatValidationDetails = (
    beans: BeanCollection,
    translate: LocaleTextFunc,
    { cells, rows }: ValidationAnnouncements,
    rowIndices?: ReadonlyMap<IRowNode, number>,
    cellPrefix?: string
): string => {
    const visibleColumnOrder = new Map<AgColumn, number>();
    const allCols = beans.visibleCols.allCols;
    for (let i = 0, len = allCols.length; i < len; ++i) {
        visibleColumnOrder.set(allCols[i], i);
    }

    const details: { rowNode: IRowNode; columnOrder: number; rowError: boolean; message: string }[] = [];
    for (let i = 0, len = cells.length; i < len; ++i) {
        const { rowNode, column, message } = cells[i];
        const ariaRowIndex = rowIndices?.get(rowNode);
        const rowLabel = ariaRowIndex == null ? '' : `${formatValidationRowLabel(translate, ariaRowIndex)}, `;
        details.push({
            rowNode,
            columnOrder: visibleColumnOrder.get(column) ?? Number.MAX_SAFE_INTEGER,
            rowError: false,
            message: `${rowLabel}${getColumnValidationLabel(beans, column)}: ${message}`,
        });
    }
    for (let i = 0, len = rows.length; i < len; ++i) {
        details.push({
            rowNode: rows[i].rowNode,
            columnOrder: Number.MAX_SAFE_INTEGER,
            rowError: true,
            message: formatFullRowValidationAnnouncement(translate, rows[i], rowIndices),
        });
    }

    details.sort((left, right) => {
        const rowOrder =
            (rowIndices?.get(left.rowNode) ?? Number.MAX_SAFE_INTEGER) -
            (rowIndices?.get(right.rowNode) ?? Number.MAX_SAFE_INTEGER);
        if (rowOrder !== 0) {
            return rowOrder;
        }
        if (left.rowError !== right.rowError) {
            return left.rowError ? 1 : -1;
        }
        return left.columnOrder - right.columnOrder;
    });

    if (cellPrefix) {
        const firstCell = details.find(({ rowError }) => !rowError);
        if (firstCell) {
            firstCell.message = `${cellPrefix} ${firstCell.message}`;
        }
    }

    return details.map(({ message }) => message).join(' ');
};

const formatFullRowValidationAnnouncement = (
    translate: LocaleTextFunc,
    { rowNode, message }: RowValidationAnnouncement,
    rowIndices?: ReadonlyMap<IRowNode, number>
): string => {
    const detail = translate('ariaFullRowValidationError', `Full Row Validation: ${message}`, [message]);
    const ariaRowIndex = rowIndices?.get(rowNode);
    return ariaRowIndex == null ? detail : `${formatValidationRowLabel(translate, ariaRowIndex)}, ${detail}`;
};

const getContributingRowIndices = (
    beans: BeanCollection,
    { cells, rows }: ValidationAnnouncements,
    contextRowNode?: IRowNode,
    identifySingleRow = false
): ReadonlyMap<IRowNode, number> | undefined => {
    const rowNodes = new Set<IRowNode>();
    for (let i = 0, len = cells.length; i < len; ++i) {
        rowNodes.add(cells[i].rowNode);
    }
    for (let i = 0, len = rows.length; i < len; ++i) {
        rowNodes.add(rows[i].rowNode);
    }

    if (
        rowNodes.size === 0 ||
        (!identifySingleRow && rowNodes.size === 1 && (!contextRowNode || rowNodes.has(contextRowNode)))
    ) {
        return undefined;
    }

    const rowIndices = new Map<IRowNode, number>();
    for (const rowNode of rowNodes) {
        const ariaRowIndex = getValidationAriaRowIndex(beans, rowNode);
        if (ariaRowIndex != null) {
            rowIndices.set(rowNode, ariaRowIndex);
        }
    }
    return rowIndices;
};

const formatChangedValidationAnnouncements = (
    beans: BeanCollection,
    translate: LocaleTextFunc,
    { cells, rows }: ValidationAnnouncements
): string => {
    const rowIndices = getContributingRowIndices(beans, { cells, rows });
    const cellPrefix = cells.length > 0 ? translate('ariaValidationErrorPrefix', 'Cell Editor Validation') : undefined;
    return formatValidationDetails(beans, translate, { cells, rows }, rowIndices, cellPrefix);
};

export const _announceChangedValidationErrors = (
    beans: BeanCollection,
    previous: ValidationModels,
    current: ValidationModels
): void => {
    const translate = _getLocaleTextFunc(beans.localeSvc);
    // Focus movement revalidates, so compare spoken text and announce only a genuinely new/changed error.
    const changed = collectValidationAnnouncements(translate, current, { previous });
    const announcement = formatChangedValidationAnnouncements(beans, translate, changed);

    if (announcement.length > 0) {
        beans.ariaAnnounce.announceValue(announcement, 'editorValidation');
    } else if (hasRemovedValidationAnnouncement(translate, previous, current)) {
        // Replace a debounced message that still contains the removed error. Remaining errors preserve
        // their pending announcement; an empty value cancels the message when the edit became valid.
        const remaining = collectValidationAnnouncements(translate, current);
        beans.ariaAnnounce.announceValue(
            formatChangedValidationAnnouncements(beans, translate, remaining),
            'editorValidation'
        );
    }
};

/** Announces why block mode refused to complete a full-row edit, including unchanged validation errors. */
export const _announceFullRowEditValidationErrors = (beans: BeanCollection, contextRowNode?: IRowNode): void => {
    const { editModelSvc, ariaAnnounce, localeSvc } = beans;
    if (!editModelSvc) {
        return;
    }

    const translate = _getLocaleTextFunc(localeSvc);
    const { cells, rows } = collectValidationAnnouncements(translate, {
        cell: editModelSvc.getCellValidationModel(),
        row: editModelSvc.getRowValidationModel(),
    });
    const rowIndices = getContributingRowIndices(
        beans,
        { cells, rows },
        contextRowNode,
        !contextRowNode && (beans.editSvc?.isBatchEditing() ?? false)
    );

    const validationDetails = formatValidationDetails(beans, translate, { cells, rows }, rowIndices);
    if (validationDetails.length === 0) {
        return;
    }

    const announcement = translate(
        'ariaFullRowEditValidationFailed',
        `Cannot complete row edit. ${validationDetails}`,
        [validationDetails]
    );
    ariaAnnounce.announceValue(announcement, 'editorValidation');
};
