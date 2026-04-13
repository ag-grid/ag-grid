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
        (ctrl as unknown as { editSvc: { isEditing: ReturnType<typeof vi.fn> } }).editSvc = {
            isEditing: vi.fn(() => editing),
        };
        (ctrl as unknown as { beans: Partial<BeanCollection> }).beans = {
            formula: {
                getFormulaError: vi.fn(() => (formulaError ? new Error('Formula error') : null)),
            } as any,
            editModelSvc: {
                getCellValidationModel: () => ({
                    hasCellValidation: vi.fn(() => cellValidationError),
                }),
            } as any,
        };

        return ctrl;
    };

    it.each([
        ['editing', { editing: true }],
        ['formula errors', { formulaError: true }],
        ['cell validation errors', { cellValidationError: true }],
    ])('suppresses note hover when the cell has %s', (_reason, params) => {
        const ctrl = createCellCtrl(params);

        expect(ctrl.isCellNoteHoverSuppressed()).toBe(true);
    });

    it('does not suppress note hover when the cell is not editing and has no errors', () => {
        const ctrl = createCellCtrl();

        expect(ctrl.isCellNoteHoverSuppressed()).toBe(false);
    });
});
