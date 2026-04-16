import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { CellCtrl } from './cellCtrl';

describe('CellCtrl', () => {
    const createCellCtrl = (params?: { editing?: boolean; formulaError?: boolean; cellValidationError?: boolean }) => {
        const { editing = false, formulaError = false, cellValidationError = false } = params ?? {};
        const ctrl = Object.create(CellCtrl.prototype) as CellCtrl;

        (ctrl as unknown as { column: AgColumn }).column = {} as AgColumn;
        (ctrl as unknown as { rowNode: RowNode }).rowNode = {} as RowNode;
        (ctrl as unknown as { editSvc: { isEditing: jest.Mock } }).editSvc = {
            isEditing: jest.fn(() => editing),
        };
        (ctrl as unknown as { beans: Partial<BeanCollection> }).beans = {
            formula: {
                getFormulaError: jest.fn(() => (formulaError ? { message: 'Formula error' } : null)),
            },
            editModelSvc: {
                getCellValidationModel: () => ({
                    hasCellValidation: jest.fn(() => cellValidationError),
                }),
            },
        };

        return ctrl;
    };

    it.each([
        ['editing', { editing: true }],
        ['formula errors', { formulaError: true }],
        ['cell validation errors', { cellValidationError: true }],
    ])('suppresses note hover when the cell has %s', (_reason, params) => {
        const ctrl = createCellCtrl(params);

        expect(ctrl.isNoteHoverSuppressed()).toBe(true);
    });

    it('does not suppress note hover when the cell is not editing and has no errors', () => {
        const ctrl = createCellCtrl();

        expect(ctrl.isNoteHoverSuppressed()).toBe(false);
    });
});
