import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import { EditCellValidationModel, EditRowValidationModel } from '../editModelService';
import { _announceChangedValidationErrors, _announceFullRowEditValidationErrors } from './validationAnnouncements';

const createColumn = (colId: string): AgColumn => ({ getColId: () => colId }) as AgColumn;

const createRowNode = (rowIndex: number, rowPinned: 'top' | 'bottom' | null = null): IRowNode =>
    ({ rowIndex, rowPinned }) as IRowNode;

const createBeans = (
    cellValidationModel: EditCellValidationModel,
    rowValidationModel: EditRowValidationModel,
    columns: AgColumn[],
    pinnedTopRowCount = 0
): { beans: BeanCollection; announceValue: ReturnType<typeof vi.fn> } => {
    const announceValue = vi.fn();
    const beans = {
        ariaAnnounce: { announceValue },
        colModel: { ready: true, colsTreeDepth: 0 },
        colNames: {
            getDisplayNameForColumn: (column: AgColumn) =>
                ({ weight: 'Weight', height: 'Height' })[column.getColId() as 'weight' | 'height'],
        },
        ctrlsSvc: { getHeaderRowContainerCtrl: () => ({ getRowCount: () => 1 }) },
        editModelSvc: {
            getCellValidationModel: () => cellValidationModel,
            getRowValidationModel: () => rowValidationModel,
        },
        pinnedRowModel: { getPinnedTopRowCount: () => pinnedTopRowCount },
        rowModel: { getRowCount: () => 10 },
        visibleCols: { allCols: columns },
    } as unknown as BeanCollection;

    return { beans, announceValue };
};

describe('_announceChangedValidationErrors', () => {
    test('preserves the existing wording when changes affect one row', () => {
        const rowNode = createRowNode(0);
        const weight = createColumn('weight');
        const previousCellValidationModel = new EditCellValidationModel();
        const previousRowValidationModel = new EditRowValidationModel();
        const currentCellValidationModel = new EditCellValidationModel();
        const currentRowValidationModel = new EditRowValidationModel();
        currentCellValidationModel.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        currentRowValidationModel.setRowValidation({ rowNode }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(currentCellValidationModel, currentRowValidationModel, [weight]);

        _announceChangedValidationErrors(
            beans,
            { cell: previousCellValidationModel, row: previousRowValidationModel },
            { cell: currentCellValidationModel, row: currentRowValidationModel }
        );

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cell Editor Validation Weight: Too heavy. Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('identifies each row when changed errors span multiple batch rows', () => {
        const pinnedRow = createRowNode(0, 'top');
        const bodyRow = createRowNode(0);
        const weight = createColumn('weight');
        const height = createColumn('height');
        const previousCellValidationModel = new EditCellValidationModel();
        const previousRowValidationModel = new EditRowValidationModel();
        const currentCellValidationModel = new EditCellValidationModel();
        const currentRowValidationModel = new EditRowValidationModel();

        currentCellValidationModel.setCellValidation(
            { rowNode: bodyRow, column: weight },
            { errorMessages: ['Too heavy'] }
        );
        currentCellValidationModel.setCellValidation(
            { rowNode: pinnedRow, column: height },
            { errorMessages: ['Too tall'] }
        );
        currentRowValidationModel.setRowValidation({ rowNode: bodyRow }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(
            currentCellValidationModel,
            currentRowValidationModel,
            [weight, height],
            1
        );

        _announceChangedValidationErrors(
            beans,
            { cell: previousCellValidationModel, row: previousRowValidationModel },
            { cell: currentCellValidationModel, row: currentRowValidationModel }
        );

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cell Editor Validation Row 2, Height: Too tall. Row 3, Weight: Too heavy. ' +
                'Row 3, Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('places the cell-validation prefix after an earlier row-only error', () => {
        const firstRow = createRowNode(0);
        const secondRow = createRowNode(1);
        const weight = createColumn('weight');
        const previousCells = new EditCellValidationModel();
        const previousRows = new EditRowValidationModel();
        const currentCells = new EditCellValidationModel();
        const currentRows = new EditRowValidationModel();
        currentRows.setRowValidation({ rowNode: firstRow }, { errorMessages: ['BMI is invalid'] });
        currentCells.setCellValidation({ rowNode: secondRow, column: weight }, { errorMessages: ['Too heavy'] });
        const { beans, announceValue } = createBeans(currentCells, currentRows, [weight]);

        _announceChangedValidationErrors(
            beans,
            { cell: previousCells, row: previousRows },
            { cell: currentCells, row: currentRows }
        );

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Row 2, Full Row Validation: BMI is invalid. Cell Editor Validation Row 3, Weight: Too heavy.',
            'editorValidation'
        );
    });

    test('replaces a pending announcement when its error is removed', () => {
        const rowNode = createRowNode(0);
        const weight = createColumn('weight');
        const previousCellValidationModel = new EditCellValidationModel();
        const previousRowValidationModel = new EditRowValidationModel();
        const currentCellValidationModel = new EditCellValidationModel();
        const currentRowValidationModel = new EditRowValidationModel();
        previousCellValidationModel.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        const { beans, announceValue } = createBeans(currentCellValidationModel, currentRowValidationModel, [weight]);

        _announceChangedValidationErrors(
            beans,
            { cell: previousCellValidationModel, row: previousRowValidationModel },
            { cell: currentCellValidationModel, row: currentRowValidationModel }
        );

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith('', 'editorValidation');
    });

    test('retains a newly added error when a different pending error is removed', () => {
        const rowNode = createRowNode(0);
        const weight = createColumn('weight');
        const height = createColumn('height');
        const initialCells = new EditCellValidationModel();
        const firstPassCells = new EditCellValidationModel();
        const secondPassCells = new EditCellValidationModel();
        const initialRows = new EditRowValidationModel();
        const firstPassRows = new EditRowValidationModel();
        const secondPassRows = new EditRowValidationModel();
        initialCells.setCellValidation({ rowNode, column: height }, { errorMessages: ['Too tall'] });
        firstPassCells.setCellValidation({ rowNode, column: height }, { errorMessages: ['Too tall'] });
        firstPassCells.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        secondPassCells.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        const { beans, announceValue } = createBeans(firstPassCells, firstPassRows, [weight, height]);

        _announceChangedValidationErrors(
            beans,
            { cell: initialCells, row: initialRows },
            { cell: firstPassCells, row: firstPassRows }
        );
        _announceChangedValidationErrors(
            beans,
            { cell: firstPassCells, row: firstPassRows },
            { cell: secondPassCells, row: secondPassRows }
        );

        expect(announceValue).toHaveBeenCalledTimes(2);
        expect(announceValue).toHaveBeenNthCalledWith(
            1,
            'Cell Editor Validation Weight: Too heavy.',
            'editorValidation'
        );
        expect(announceValue).toHaveBeenNthCalledWith(
            2,
            'Cell Editor Validation Weight: Too heavy.',
            'editorValidation'
        );
    });

    test('leaves the original pending announcement intact when an error is unchanged', () => {
        const rowNode = createRowNode(0);
        const weight = createColumn('weight');
        const previousCellValidationModel = new EditCellValidationModel();
        const previousRowValidationModel = new EditRowValidationModel();
        const currentCellValidationModel = new EditCellValidationModel();
        const currentRowValidationModel = new EditRowValidationModel();
        previousCellValidationModel.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        currentCellValidationModel.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        const { beans, announceValue } = createBeans(currentCellValidationModel, currentRowValidationModel, [weight]);

        _announceChangedValidationErrors(
            beans,
            { cell: previousCellValidationModel, row: previousRowValidationModel },
            { cell: currentCellValidationModel, row: currentRowValidationModel }
        );

        expect(announceValue).not.toHaveBeenCalled();
    });
});

describe('_announceFullRowEditValidationErrors', () => {
    test('preserves the existing wording when one row contributes cell and row errors', () => {
        const rowNode = createRowNode(0);
        const weight = createColumn('weight');
        const cellValidationModel = new EditCellValidationModel();
        const rowValidationModel = new EditRowValidationModel();
        cellValidationModel.setCellValidation({ rowNode, column: weight }, { errorMessages: ['Too heavy'] });
        rowValidationModel.setRowValidation({ rowNode }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(cellValidationModel, rowValidationModel, [weight]);

        _announceFullRowEditValidationErrors(beans);

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cannot complete row edit. Weight: Too heavy. Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('identifies each contributing row by its header- and pinned-aware ARIA row index', () => {
        const pinnedRow = createRowNode(0, 'top');
        const bodyRow = createRowNode(0);
        const weight = createColumn('weight');
        const height = createColumn('height');
        const cellValidationModel = new EditCellValidationModel();
        const rowValidationModel = new EditRowValidationModel();

        // Insert the body error first and put Weight first in visible column order. The announcement must
        // still order the errors by their absolute ARIA row index: pinned row 2, then body row 3.
        cellValidationModel.setCellValidation({ rowNode: bodyRow, column: weight }, { errorMessages: ['Too heavy'] });
        cellValidationModel.setCellValidation({ rowNode: pinnedRow, column: height }, { errorMessages: ['Too tall'] });
        rowValidationModel.setRowValidation({ rowNode: pinnedRow }, { errorMessages: ['Pinned BMI is invalid'] });
        rowValidationModel.setRowValidation({ rowNode: bodyRow }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(cellValidationModel, rowValidationModel, [weight, height], 1);

        _announceFullRowEditValidationErrors(beans);

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cannot complete row edit. Row 2, Height: Too tall. ' +
                'Row 2, Full Row Validation: Pinned BMI is invalid. Row 3, Weight: Too heavy. ' +
                'Row 3, Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('identifies a sole contributing row when it differs from the row whose completion was blocked', () => {
        const invalidRow = createRowNode(0);
        const attemptedRow = createRowNode(1);
        const cellValidationModel = new EditCellValidationModel();
        const rowValidationModel = new EditRowValidationModel();
        rowValidationModel.setRowValidation({ rowNode: invalidRow }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(cellValidationModel, rowValidationModel, []);

        _announceFullRowEditValidationErrors(beans, attemptedRow);

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cannot complete row edit. Row 2, Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('identifies a sole contributing row for a global batch completion', () => {
        const invalidRow = createRowNode(0);
        const cellValidationModel = new EditCellValidationModel();
        const rowValidationModel = new EditRowValidationModel();
        rowValidationModel.setRowValidation({ rowNode: invalidRow }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(cellValidationModel, rowValidationModel, []);
        beans.editSvc = { isBatchEditing: () => true } as BeanCollection['editSvc'];

        _announceFullRowEditValidationErrors(beans);

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cannot complete row edit. Row 2, Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('uses the ariaRowIndex locale override for a cross-row error', () => {
        const invalidRow = createRowNode(0);
        const attemptedRow = createRowNode(1);
        const cellValidationModel = new EditCellValidationModel();
        const rowValidationModel = new EditRowValidationModel();
        rowValidationModel.setRowValidation({ rowNode: invalidRow }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(cellValidationModel, rowValidationModel, []);
        beans.localeSvc = {
            getLocaleTextFunc: () => (key, defaultValue, variableValues) =>
                key === 'ariaRowIndex' ? `Data row ${variableValues?.[0]}` : defaultValue,
        } as BeanCollection['localeSvc'];

        _announceFullRowEditValidationErrors(beans, attemptedRow);

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cannot complete row edit. Data row 2, Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });

    test('preserves concise wording when the sole batch error belongs to the current row', () => {
        const currentRow = createRowNode(0);
        const cellValidationModel = new EditCellValidationModel();
        const rowValidationModel = new EditRowValidationModel();
        rowValidationModel.setRowValidation({ rowNode: currentRow }, { errorMessages: ['BMI is invalid'] });
        const { beans, announceValue } = createBeans(cellValidationModel, rowValidationModel, []);
        beans.editSvc = { isBatchEditing: () => true } as BeanCollection['editSvc'];

        _announceFullRowEditValidationErrors(beans, currentRow);

        expect(announceValue).toHaveBeenCalledOnce();
        expect(announceValue).toHaveBeenCalledWith(
            'Cannot complete row edit. Full Row Validation: BMI is invalid.',
            'editorValidation'
        );
    });
});
